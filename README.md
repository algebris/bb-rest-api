# BB REST API

As a part of BB backend experimental environment there are two modules at the moment.
*BlockProcessor* intended to work with blockchain fetching and processing transactions directly via RPC port.
And *Rest API* which intended for querying processed data. They both use the same database (Redis).

1. Blockchain Block Processor

This one repository https://github.com/algebris/bb-blockprocessor

2. BB REST API 

https://github.com/algebris/bb-rest-api


## Pre-requisites

### Make sure you installed latest Node.js

https://nodejs.org/en/download/

```
# node -v
v9.9.0

# npm -v
v5.6.0
```

### Make sure you installed bb-blockprocessor (see the link above)

This module populate Redis database with the necessary data. So REST API provides just a querying to this DB.

### Running

```
# npm start
```