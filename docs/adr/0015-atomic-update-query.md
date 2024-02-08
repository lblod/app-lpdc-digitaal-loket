# 15. Atomic update query

date: 2024-02-08

## Status

Accepted

## Context

In lpdc-management, update queries used to be a split into separate delete and insert queries. Each triple was inserted or removed in a separate DELETE or INSERT query.
This is not atomic and can result in corrupted data when something goes wrong.

## Decision

Replace all update queries with a DELETE/INSERT query where the whole aggregate will be removed and inserted in the same transaction. 

To prevent that concurrent transactions interfere with each other we check modifiedDate of aggregate in WHERE clause of the query.

## Consequences



