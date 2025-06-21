library(data.table)
library(fpp)
source("list.R")


# **** FUNCTIONS ****
# metrics
mae <- function(actual, predicted)
{
     return(mean(abs(as.numeric(actual) - as.numeric(predicted))))
}

# Normalize/Denormalize
min_na <- function(x) min(x, na.rm=T);
max_na <- function(x) max(x, na.rm=T);

normalize <- function(x,minval,maxval) {
     return ((x - minval) / (maxval - minval));
}

denormalize <- function(x,minval,maxval) {
     return (x*(maxval-minval) + minval);
}

# Conversions
## Change UV to degree
uv2degree <- function(u_ms, v_ms) {
     return((270-(atan2(v_ms, u_ms)*(180/pi)))%%360);
}

## Change UV to speed (ms)
uv2speed <- function(u_ms, v_ms) {
     return(sqrt(u_ms*u_ms + v_ms*v_ms));
}

## Change Celsius to Rankine
celsius2rankine <- function(celsius) {
     absoluteZero <- 273.15
     return((celsius + absoluteZero)*9/5)
}

## prediction
findsimilar <- function(x, dataset, topN=10) {
     res <- numeric(0)
     for (i in 1:nrow(dataset)) {
          res <- c(res, mae(dataset[i,], x))
     }     
     return(sort(res, index.return=T)$ix[1:topN]);
}

# **** START ****
suffix1 <- "15042017_competition" # yesterday
suffix2 <- "16042017_competition" # today
## Load data
d_minus2  <- read.csv(paste0("data/wind_power_generation_data_", suffix1, ".csv"))
d_minus1  <- read.csv(paste0("data/wind_power_generation_data_", suffix2, ".csv"))
met_minus2  <- read.csv(paste0("data/meteorological_data_", suffix1, ".csv"))
met_minus1  <- read.csv(paste0("data/meteorological_data_", suffix2, ".csv"))

meteo <- rbind(met_minus2, met_minus1)
meteo <- meteo[order(meteo$height.above.ground.in.m, meteo$location, meteo$day, meteo$start.time.3h.interval..utc.),]
wind <- rbind(d_minus2, d_minus1)
wind <- wind[order(wind$day, wind$start.time.quarter.hour),]

starttime <- "2016-04-02 09:00:00"
endtime <- "2016-04-04 06:00"
hrz <- 48 # TODO

meteo <- cbind(seq(from = as.POSIXct(starttime), to = as.POSIXct(endtime), by = "hour")[1:3==1], 
               uv2degree(meteo$u.component.wind.in.m.s, meteo$v.component.wind.in.m.s),
               uv2speed(meteo$u.component.wind.in.m.s, meteo$v.component.wind.in.m.s),
               celsius2rankine(meteo$temperature.in..C),
               meteo);
meteo.org <- meteo
for (i in c(2:4,12)) {
     meteo[,i] <- normalize(meteo[,i], min(meteo[,i], na.rm=T), max(meteo[,i], na.rm=T));
}

# Pivot
df <- do.call("cbind", 
              lapply(array(c(2,80,100)), function(x) {
                   df <- meteo[meteo$height.above.ground.in.m==x,c(1,7,2:4,12)];
                   names(df) <- c(
                        "datetime",
                        "location",
                        paste0("wdir_",x),
                        paste0("wspeed_",x),
                        paste0("temp_",x),
                        paste0("solar_",x)
                   );
                   #pivot
                   df <- dcast(setDT(df), 
                               datetime ~ location, 
                               value.var = c(paste0("wspeed_",x),
                                             paste0("wspeed_",x),
                                             paste0("temp_",x),
                                             paste0("solar_",x)
                               ));
                   return(as.data.frame(df)[,-c(1:2)]);
              })
)
dim(df)
df.new <- df[rep(1:nrow(df),1,each=2),] # duplicate extra rows
dim(df.new)
df.new[c(seq(2, dim(df.new)[1], by=2)), ] <- NA # replace all duplicates with blank cells
df <- na.spline(df.new)

#Decompose, normalize
meteo.trends <- array(0, dim=dim(df))
meteo.season <- array(0, dim=dim(df))
meteo.residual <- array(0, dim=dim(df))

for (i in 1:ncol(df)) {
     comp <- stl(ts(na.spline(df[,i]), frequency=15), s.window="periodic") #TODO f=15
     meteo.trends[,i] <- comp$time.series[,2]
     meteo.season[,i] <- comp$time.series[,1]
     meteo.residual[,i] <- comp$time.series[,3]
     
     #Slice, concat
     d <- meteo.trends[,i] + meteo.residual[,i] # TODO Vain residual
     if (i==1) test.x <- matrix(d, ncol=hrz, byrow=T)
     else test.x <- cbind(test.x, matrix(d, ncol=hrz, byrow=T))
}

#Y slice, concat
power <- wind[1:6==1,3] # TODO
length(power)
power.org <- power
power <- normalize(power, min(power, na.rm=T), max(power, na.rm=T));

comp <- stl(ts(power, frequency=15), s.window="periodic") #TODO f=15
power.trends <- comp$time.series[,2]
power.season <- comp$time.series[,1]
power.residual <- comp$time.series[,3]

d <- power.trends + power.residual # TODO Vain Trendi
test.y <- matrix(d, ncol=hrz, byrow=T)

# ***** FORECAST
## Load model
list[data.x, data.y, norm.min, norm.max] <- readRDS("model/final_similarity-1.rds")

topX <- findsimilar(test.x[1,], data.x, 10)
preds <- colMeans(data.y[topX,]);#+power.season[1:hrz]
preds <- denormalize(preds, norm.min, norm.max);
preds <- na.approx(matrix(t(cbind(preds, NA, NA, NA, NA, NA)), ncol=1, byrow=F))
#f <- tail(power.org,1)/preds[1]
#preds <- f * preds
#preds[preds < 0] <- NA
#preds <- na.spline(preds)
#plot(preds,type="l")

write.csv(preds, paste0("forecasts/similar_", suffix2, ".csv"), row.names=F)
