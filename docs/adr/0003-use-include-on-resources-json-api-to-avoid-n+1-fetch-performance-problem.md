# 3. Use include on resources json-api to avoid n+1 fetch performance problem

Date: 2023-07-13

## Status

Accepted

## Context

The overview screens of 'instanties' and 'concepten' are perceived to be slow. 

It takes more than 3 seconds to load a paged view of 'instanties' on a development environment without any load.

The user interface uses the resources service to query the list of 'instanties'.
Then, in the index route in the ember application, for each instantie, all the relationships are loaded via explicit ember data reload calls.
This generates for each instantie again 5 requests that go through the entire stack.
So in total to load an overview of 20 instanties, 1 + 5 x 20 = 101 fetch requests have been done.

Since the browser and / or server does not allow more than a number of concurrent requests, the time to handle this flood of requests is in total > 3 seconds.

Caching will not solve the initial query's slowness.

## Decision

We will use the include features of json-api from the frontend, which is [implemented by the mu-cl-resources](https://github.com/mu-semtech/mu-cl-resources/blob/master/README.md#including-results); and remove the manually loading of the relationships.

This will include all the relationships in the json-api result, and ember-data component in the frontend automatically understands.

In the ember router, we will add to the query object an include section: e.g.

```javascript
    let query = {
    //... other keys
    include:
        'display-configuration,target-audiences,concept-tags,competent-authority-levels,type',
};
```

## Notes

Detailed analysis can be found in [LPDC-540](https://binnenland.atlassian.net/browse/LPDC-540) (private link)
