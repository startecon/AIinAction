# load_data.R
# Same data load for all models



library(zoo)
library(data.table)
library(forecast)

load_train2_data <- function (hrz = 12, day = 336, start_time = "2016-12-01 00:00:00", end_time = "2016-12-01 23:59") {
     # Data load
     meteo <- read.csv(paste0("data/daily/meteorological_data_", day, ".csv"))
     wind <- read.csv(paste0("data/daily/wind_power_generation_", day, ".csv"))

     # Time indices
     wind.time <- seq(from = as.POSIXct(start_time), to = as.POSIXct(end_time), by = "min")[1:15==1];
     meteo.time <- seq(from = as.POSIXct(start_time), to = as.POSIXct(end_time), by = "hour")[1:3==1];
     
     # Observations
     meteo <- meteo[meteo$day < day,]
     wind <- wind[wind[,1] < day,]
     
     # Check lengths
     all.equal(length(meteo.time),dim(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 2,])[1])
     all.equal(length(wind.time),dim(wind)[1])
     
     # Forecast horizon
     l <- dim(wind)[1] # data length
     
     # Normalize
     meteo[,5:8] <- scale(meteo[,5:8])
     wind[,3] <- scale(wind[,3])
     
     # Pivot
     df <- do.call("cbind", 
                   apply(array(c(2,80,100)), 1, function(x) {
                        df <- cbind(meteo.time, meteo[meteo$height.above.ground.in.m==x,c(3,5:8)]);
                        names(df) <- c(
                             "datetime",
                             "location",
                             paste0("uspeed_",x),
                             paste0("vspeed_",x),
                             paste0("temp_",x),
                             paste0("solar_",x)
                        );
                        #pivot
                        df <- dcast(setDT(df), 
                                    datetime ~ location, 
                                    value.var = c(paste0("uspeed_",x),
                                                  paste0("vspeed_",x),
                                                  paste0("temp_",x),
                                                  paste0("solar_",x)
                                    ));
                        return(as.data.frame(df)[,-c(1:2)]);
                   })
     )
     
     # Merge
     obs <- zoo(df, meteo.time) 
     wind.gen <- zoo(wind[,3], wind.time)
     obs <- merge(wind.gen,obs)
     
     # Interpolation and names
     obs <- na.spline(obs)
     obs <- obs[index(wind.gen),]
     train <- cbind(obs[hrz:l,],obs[,1])[hrz:l]
     names(train)[c(1:2,ncol(train))] <- c("datetime", "power", "label")
     num.obs <- dim(train)[1]
     
     # Slice and multiply Time series by one time step
     df <- do.call("cbind", 
                   apply(array(2:ncol(train)), 1, function(x) {
                        return(do.call("rbind", 
                                       apply(array(1:hrz), 1, function(y) {
                                            return(as.data.frame(matrix(train[y:num.obs,x], ncol=hrz)));
                                       })
                        ));
                   })
     )
     
     # Split into training and test sets
     valid.ind <- c(1:num.obs)[1:(hrz*10)>(hrz*9)]
     train.ind <- c(1:num.obs)[1:(hrz*10)<(hrz*9)]
     xcols <- 1:(hrz*(ncol(train)-2))
     ycols <- (hrz*(ncol(train)-2)+1):(hrz*(ncol(train)-1))
     train.x <- data.matrix(df[train.ind, xcols])
     train.y <- data.matrix(df[train.ind, ycols])
     valid.x <- data.matrix(df[valid.ind, xcols])
     valid.y <- data.matrix(df[valid.ind, ycols])

     return (list(
          train.x = train.x,
          train.y = train.y,
          valid.x = valid.x,
          valid.y = valid.y,
          denorm = c(attr(wind[,3], 'scaled:scale'), attr(wind[,3], 'scaled:center'))
     ));
}

load_history_data <- function (hrz = 12, day = 336, start_time = "2016-12-01 00:00:00", end_time = "2016-12-01 23:59") {
     # Data load
     day <- 145
     start_time <- "2016-12-01 00:00:00"
     end_time <- "2016-12-01 23:59"
     hrz <- 96
     
     meteo <- read.csv(paste0("data/daily/meteorological_data_", day, ".csv"))
     wind <- read.csv(paste0("data/daily/wind_power_generation_", day, ".csv"))
     wind_dplus <- read.csv(paste0("data/daily/wind_power_generation_", (day+1), ".csv"))
     
     # Time indices
     wind.time <- seq(from = as.POSIXct(start_time), to = as.POSIXct(end_time), by = "min")[1:15==1];
     meteo.time <- seq(from = as.POSIXct(start_time), to = as.POSIXct(end_time), by = "hour")[1:3==1];

     # Check lengths
     all.equal(length(meteo.time),dim(meteo[meteo$location == 1 & meteo$height.above.ground.in.m == 2,])[1])
     all.equal(length(wind.time),dim(wind)[1])
     
     # Forecast horizon
     l <- dim(wind)[1] # data length
     
     # Normalize
     meteo[,5:8] <- scale(meteo[,5:8])
     wind[,3] <- scale(wind[,3])
     wind_dplus[,3] <- scale(wind_dplus[,3])
     
     # Pivot
     df <- do.call("cbind", 
                   apply(array(c(2,80,100)), 1, function(x) {
                        df <- cbind(meteo.time, meteo[meteo$height.above.ground.in.m==x,c(3,5:8)]);
                        names(df) <- c(
                             "datetime",
                             "location",
                             paste0("uspeed_",x),
                             paste0("vspeed_",x),
                             paste0("temp_",x),
                             paste0("solar_",x)
                        );
                        #pivot
                        df <- dcast(setDT(df), 
                                    datetime ~ location, 
                                    value.var = c(paste0("uspeed_",x),
                                                  paste0("vspeed_",x),
                                                  paste0("temp_",x),
                                                  paste0("solar_",x)
                                    ));
                        return(as.data.frame(df)[,-c(1:2)]);
                   })
     )
     
     # Merge
     obs <- zoo(df, meteo.time) 
     wind.gen <- zoo(wind[,3], wind.time)
     obs <- merge(wind.gen,obs)
     
     # Interpolation and names
     obs <- na.spline(obs)
     obs <- obs[index(wind.gen),]

     train <- cbind(obs[,-1],wind_dplus[,3])
     xcols <- 1:(hrz*(ncol(train)-1))
     ycols <- (hrz*(ncol(train)-1)+1):(hrz*ncol(train))
     df <- matrix(train, nrow=1)
     
     test.x <- matrix(df[,xcols], nrow=1)
     test.y <- matrix(df[,ycols], nrow=1)

     return (list(
          test.x = test.x,
          test.y = test.y,
          denorm = c(attr(wind_dplus[,3], 'scaled:scale'), attr(wind_dplus[,3], 'scaled:center'))
     ));
}
