# 4. Use sparse-fieldsets on resources json-api to minimize the amount of data queried for overview screens

Date: 2023-07-31

## Status

Accepted

## Context

[Further performances improvements for overview screens](0003-use-include-on-resources-json-api-to-avoid-n+1-fetch-performance-problem.md) are deemed necessary.

We've noticed that the user interface loads the entire concept or instantie. But does not need all this data in the overview.

## Decision

We will use the sparse fieldsets features of json-api from the frontend, which is [implemented by the mu-cl-resources](https://github.com/mu-semtech/mu-cl-resources#sparse-fieldsets).

In the ember router, we will add to the query object a fields section: e.g.

```javascript
let query = {
    //... other keys
    'fields[conceptual-public-services]':
        'name,display-configuration,product-id,type,target-audiences,competent-authority-levels,concept-tags',
};
```

## Consequences

Developers must exercise care to include all the fields necessary for rendering: verify the templates, models, controllers, etc. files. 

## Notes

Detailed analysis can be found in [LPDC-541](https://binnenland.atlassian.net/browse/LPDC-541) (private link)