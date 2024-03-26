# 12. Use applicative tenant filtering in lpdc management service

Date: 2024-02-07

## Status

Accepted

## Context

For performance, stability and transaction reasons, we prefer to use the virtuoso database directly, instead of going through mu-authorization service.

This means that the applicative tenant filtering that mu-authorization provides cannot be relied on anymore.

## Decision

We will implement applicative tenant filtering in each sparql repository implementation in the lpdc-management code.

In the sparql code, this means that we need to specify the graph: 

As an example:
```sparql
SELECT ?s ?p ?o {
    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
       ?s ?p ?o
    }
}
```

## Consequences

- All data that is linked to bestuurseenheid, and thus resides in a specific user graph, needs to filtered programmatically on the bestuurseenheid linked to the logged-in user.
- When a query is tried without login, an error should occur.
- When a users tries to tamper, and requests an id from a usergraph not linked to his, no results should be returned.
- We cannot use the application graph http://mu.semte.ch/application in queries, since these are not resolved by virtuoso database.