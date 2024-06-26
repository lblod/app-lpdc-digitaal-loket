# 18. Boolean logic in ember submission

Date: 2024-06-26

## Status

Accepted

## Context

The rdflib serializer cannot process boolean values directly. This limitation requires a workaround to ensure compatibility and proper data handling in our system.


## Decision

- We will map our boolean values to '0' and '1' strings. This conversion ensures that the rdflib serializer is working correctly.

## Consequences
- Additional mapping in the backend when passing on data
