# 5. Do not cache instantie overview

Date: 2023-07-31

## Status

Accepted

## Context

Instanties (public-service resources) use a combination of mu-cl-resources and lpdc-management services to query and update its data.

Both querying and updating is handled both by mu-cl-resources and lpdc-management services. The lpdc-management services don't use the jsonapi of mu-cl-resources to query or update; they use sparql directly via mu-auth and virtuoso.

Part of the mu-cl-resources definition for public-services includes a resource concept-display-configuration, which also directly gets an update in lpdc-management via mu-auth, virtuoso.

## Decision

We decided in the dispatcher to _not cache the queries on mu-cl-resources for the public-services_. 

Sample from dispatcher.ex 
```
  get "/public-services/*path" do
    forward conn, path, "http://resource/public-services/"
  end
```

## Consequences

- We need to ensure that the uncached version of querying the public-service through resource is performant.
