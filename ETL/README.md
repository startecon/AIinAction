# Google Run Service

## Libraries used in solution
* [pymongo](https://pypi.org/project/pymongo/) for basic functionality to access and query MongoDB
* [pymongo.operations](https://pymongo.readthedocs.io/en/stable/api/pymongo/operations.html) for using SearchIndexModel for Atlas Vector Index
* [math](https://docs.python.org/3/library/math.html) for using mathematical functions
* [time](https://docs.python.org/3/library/time.html) for using time functions

## Data Ingestions
* Jupyter notebook [data-ingestion-1.ipynb](./data-ingestion-1.ipynb)

### Functionality
1. Load data from wind mill farm observations dataset
1. Load data from wind power production dataset
1. Access to MongoDB
1. Create collection
1. Iterate data and build documents which contains
    * unique row id
    * date and time of observations
    * vector of every metrics in observations of all wind mills in that specific time point
    * vector of wind power production for following 48 time points 
1. Ingest document to just created collection
1. Build Atlas Vector Index

## Testing Vector Index and Atlas Search
* Jupyter notebook [test-query-1.ipynb](./test-query-1.ipynb)

### Functionality
1. Access to MongoDB
1. Pick first item to be used as query item
1. Query by using Atlas Vector Search and query item's vector
1. Calculate confidence interval from candidates wind power production time series 
1. Gat best match and pick it's wind power production time series to be the forecast prediction 
