# 8. Frontend initiates state changes via backend operations

Date: 2023-11-27

## Status

Accepted

## Context

State changes in the frontend can technically happen 
- either; via the mu-cl-resources; in which you have a (cached) ember data model on which you change some state, and execute save(), which calls the json-api of mu-cl-resources, and directly saves in the database.
- or; via the backend operations in lpdc-management; in which you have a put, post request, execute business logic, and then save triples in the database.

There is overlap in which data is managed by whom. Both mu-cl-resources and lpdc-management might change the same data. The frontend is keeping a cached version in the form of ember-data of the instanties. So if we are not careful, we might override a state change done by lpdc-management by executing a save() on mu-cl-resources.

We need a consistent strategy to avoid hard to track bugs.

## Decision

- **State changes from the frontend to the backend go via the business operations on lpdc-management service**. We will only use mu-cl-resources for a read model (only gets). 
- When a business operation was executed, we will **refresh the ember data cache in the form of a reload function**. As an template example:
```javascript
   async loadPublicServiceDetails(publicServiceId) {
    return this.store.findRecord('public-service', publicServiceId, {
      reload: true,
      include:
        'type,status,concept-tags,target-audiences,competent-authority-levels,executing-authority-levels,concept,review-status',
    });
  }

```
- **No caching will happen on mu-cl-resources** for data that is being managed by business operations in lpdc-management. (this is configured in the dispatcher config ... )
- We will **minimize the data in the ember data read model**; this model is defined in the mu-cl-resources config. Only include there what you need to render in the user interface.

## Consequences
- Developers need to be careful that the refresh functions include all dependencies defined in the read model in the form of the resources' config.
- Developers need to ensure that the resources config in dispatcher for the read model only defines a get, all other operations should throw a http 404 to catch bugs more easily.
- Developers should consider splitting this read model from mu-cl-resources more cleanly from the full aggregate model used in the backend. 