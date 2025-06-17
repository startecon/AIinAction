# load_data.R
# Same data load for all models



# Change UV to degree
uv2degree <- function(u_ms, v_ms) {
     return((270-(atan2(v_ms, u_ms)*(180/pi)))%%360);
}

# Change UV to speed (ms)
uv2speed <- function(u_ms, v_ms) {
     return(sqrt(u_ms*u_ms + v_ms*v_ms));
}

# Get global min/max
get_global_min_max <- function() {
     source("normalize-1.R");
     meteo <- read.csv("data/meteorological_data.csv")
     wind <- read.csv("data/wind_power_generation_data.csv")
     
     return (list(
          wind_min = min_na(wind[,3]),
          wind_max = max_na(wind[,3]),
          meteo_min = as.numeric(lapply(meteo[,5:8], min_na)),
          meteo_max = as.numeric(lapply(meteo[,5:8], max_na))
     ));
}

load_train_data <- function (hrz = 12, starttime = "2016-01-01 00:00:00", endtime = "2016-12-31 23:59") {
     
     require(zoo)
     require(data.table)
     require(forecast)
     require(Rlibeemd)
     source("normalize-1.R")
     source("list.R")
     
     # Get global min/max
     list[wind_min, wind_max, meteo_min, meteo_max] <- get_global_min_max();
     
     #hrz = 152; starttime = "2016-01-01 00:00:00"; endtime = "2016-12-30 23:59";
     
     from_day <- as.integer(as.Date(starttime)-as.Date("2015-12-31 00:00:00"));
     to_day <- as.integer(as.Date(endtime)-as.Date(starttime)) + from_day;
     
     # Data load
     meteo <- read.csv("data/meteorological_data.csv")
     wind <- read.csv("data/wind_power_generation_data.csv")
     
     # Observations
     meteo <- meteo[meteo$day >= from_day & meteo$day <= to_day,]
     meteo[,5:8] <- as.data.frame(Map(normalize_global, meteo[,5:8], meteo_min, meteo_max))
     dplus <- normalize_global(wind[wind$day >= from_day+1 & wind$day <= to_day+1,3], wind_min, wind_max)
     power <- normalize_global(wind[wind$day >= from_day & wind$day <= to_day,3], wind_min, wind_max)
     uspeed <- na.approx(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 80,5])
     vspeed <- na.approx(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 80,6])
     temp <- na.approx(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 80,7])
     solar <- na.approx(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 80,8])

     temp <- na.spline(matrix(t(cbind(t(t(temp)), NA, NA, NA, NA, NA, NA, NA)), ncol=1, byrow=F))
     speed <- na.spline(matrix(t(cbind(t(t(uv2speed(uspeed,vspeed))), NA, NA, NA, NA, NA, NA, NA)), ncol=1, byrow=F))
     direction <- na.spline(matrix(t(cbind(t(t(uv2degree(uspeed,vspeed))), NA, NA, NA, NA, NA, NA, NA)), ncol=1, byrow=F))
     
     # select data source
     datasetX <- temp
     
     # select data target
     datasetY <- dplus
     
     compsX = stl(ts(as.numeric(datasetX), frequency=96), s.window="periodic")
     seasonsX <- compsX$time.series[,1]
     trendsX <- compsX$time.series[,2]
     noiseX <- compsX$time.series[,3]
     
     compsY = stl(ts(as.numeric(datasetY), frequency=96), s.window="periodic")
     seasonsY <- compsY$time.series[,1]
     trendsY <- compsY$time.series[,2]
     noiseY <- compsY$time.series[,3]
     
     normX <- smooth.spline(noiseX + trendsX, spar=0.2)$y
     normY <- smooth.spline(noiseY + trendsY, spar=0.2)$y
     
     l <- length(normX)
     
     dataX <- matrix(normX[1:(l-hrz)], ncol=hrz, byrow=T)
     dataY <- matrix(normY[hrz:l], ncol=hrz, byrow=T)
     trendX <- matrix(trendsX[1:(l-hrz)], ncol=hrz, byrow=T)
     trendY <- matrix(trendsY[1:(l-hrz)], ncol=hrz, byrow=T)
     
     for (i in 2:hrz) {
          i <- 2
          rows <- floor((l-i)/hrz);
          dataX <- rbind(dataX, matrix(normX[i:((rows-1)*hrz)], ncol=hrz, nrow=rows, byrow=T))
          trendX <- rbind(trendX, matrix(trendsX[i:((rows-1)*hrz)], ncol=hrz, nrow=rows, byrow=T))
          dataY <- rbind(dataY, matrix(normY[(hrz+i):(rows*hrz)], ncol=hrz, byrow=T))
          trendY <- rbind(trendY, matrix(trendsY[i:((rows-1)*hrz)], ncol=hrz, nrow=rows, byrow=T))
     }
     l <- nrow(dataY)
     trendX <- trendX[1:l,hrz]
     trendY <- trendY[1:l,1]
     dataX <- t(dataX[1:l,]-trendX)
     dataY <- t(dataY-trendY)
     
     ## Resize
     hrz <- hrz / 4
     
     dataX <- cbind(dataX[1:4==1,],
                    dataX[1:4==2,],
                    dataX[1:4==3,],
                    dataX[1:4==4,])
     
     dataY <- cbind(dataY[1:4==1,],
                    dataY[1:4==2,],
                    dataY[1:4==3,],
                    dataY[1:4==4,])

     return (list(
          x = t(dataX),
          y = t(dataY)
     ));
}

# ******** Test data

load_test_data <- function (hrz = 12, starttime = "2016-12-01 00:00:00", endtime = "2016-12-01 23:59") {
     
     require(zoo)
     require(data.table)
     require(forecast)
     source("normalize-1.R")
     source("list.R")
     
     # Get global min/max
     list[wind_min, wind_max, meteo_min, meteo_max] <- get_global_min_max();
     
     # Data load
     day <- as.integer(as.Date(starttime)-as.Date("2015-12-31 00:00:00"));
     
     meteo <- read.csv(paste0("data/daily/meteorological_data_", day, ".csv"))
     wind <- read.csv(paste0("data/daily/wind_power_generation_", day, ".csv"))
     wind_dplus <- read.csv(paste0("data/daily/wind_power_generation_", (day+1), ".csv"))
     
     # Time indices
     wind.time <- seq(from = as.POSIXct(starttime), to = as.POSIXct(endtime), by = "min")[1:15==1];
     meteo.time <- seq(from = as.POSIXct(starttime), to = as.POSIXct(endtime), by = "hour")[1:3==1];
     
     # Check lengths
     all.equal(length(meteo.time),dim(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 2,])[1])
     all.equal(length(wind.time),dim(wind)[1])
     
     # Forecast horizon
     l <- dim(wind)[1] # data length
     
     # Normalize
     meteo[,5:8] <- as.data.frame(Map(normalize_global, meteo[,5:8], meteo_min, meteo_max))
     wind[,3] <- normalize_global(wind[,3], wind_min, wind_max)
     wind_dplus[,3] <- normalize_global(wind_dplus[,3], wind_min, wind_max)
     temp <- meteo[meteo$height.above.ground.in.m==80&meteo$location==1,7]
     solar <- meteo[meteo$height.above.ground.in.m==80&meteo$location==1,8]
     
     # Pivot
     df <- do.call("cbind", 
                   apply(array(c(2,100)), 1, function(x) {
                        df <- cbind(meteo.time, meteo[meteo$height.above.ground.in.m==x,c(3,5:6)]);
                        names(df) <- c(
                             "datetime",
                             "location",
                             paste0("uspeed_",x),
                             paste0("vspeed_",x)
                        );
                        #pivot
                        df <- dcast(setDT(df), 
                                    datetime ~ location, 
                                    value.var = c(paste0("uspeed_",x),
                                                  paste0("vspeed_",x)
                                    ));
                        return(as.data.frame(df)[,-c(1:2)]);
                   })
     )
     
     # Merge
     df <- cbind(df, temp, solar)
     obs <- zoo(df, meteo.time) 
     wind.gen <- zoo(wind[,3], wind.time)
     obs <- merge(wind.gen,obs)
     
     # Interpolation and names
     obs <- na.spline(obs)
     obs <- obs[index(wind.gen),]
     
     train <- cbind(obs,wind_dplus[,3])
     xcols <- 1:(hrz*(ncol(train)-1))
     ycols <- (hrz*(ncol(train)-1)+1):(hrz*ncol(train))
     df <- matrix(train[1:hrz,], nrow=1)
     
     x <- matrix(df[,xcols], nrow=1)
     y <- matrix(df[,ycols], nrow=1)
     
     return (list(
          x = x,
          y = y,
          denorm = c(wind_min, wind_max)
     ));
}
