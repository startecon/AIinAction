# AI in Action
* This repository is for DevPost Competition AI in Action
* Read more information about our project [here](https://devpost.com/software/ecowind-zxyjn1)
* Live Demo can be found [here](https://aiinaction-dev-a6dcbwf3aea0gxcv.swedencentral-01.azurewebsites.net/)
* There's three folders which contains different parts or our solution
    1. [App](/app/Readme.md) contains website project ASP.Net 8 and React
    1. [ETL](/ETL/Readme.md) contains ETL-processes jupyter notebooks in python, and also some R testing
    1. [GoogleCloudRun](/GoogleCloudRun/Readme.md) contains API code for run in Google's Cloud Run -service

## Project Goal
Our solution is based MongoDB Atlas database and it's Vector Search capabilities. 
We have historical data of a wind mill farm and we use it to demonstrate how we can find similar weather condititions from history.
We use that power production information to forecast power production for coming next time points.

## MongoDB Database and Atlas Search
* We store only few facts to [MongoDB database](https://www.mongodb.com/docs/atlas/atlas-ui/databases/) collections
    * unique row id
    * date of observation
    * vector of observations
    * and vector of wind power production for following 48 time points 
* [Vector Index](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/) makes indices from the vector which our solution creates from wind mill farm observations and one vector contains about 700-800 dimensions 
* [Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/) run from the Google Cloud Run web service and it will seek similar observations from history and returns wind power production time series from best matched candidates
* [Parallel Query Execution](https://www.mongodb.com/docs/atlas/atlas-search/concurrent-query/) improves the query performance and it's existing feature in the Atlas Search so we don't have to implement the mechanism from the scratch.

