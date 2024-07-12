# 22. Processing snapshots without delta notifier

Date: 2024-07-12

## Status

Accepted

## Context

There are multiple LDES streams that generate conceptSnapshots and instanceSnapshots.
These snapshot need to be processed. It will create or update corresponding concepts and instances. 
There is no retry mechanism for the delta notifier. When management-service is not ready to process a snapshot the snapshot will not be processed.
Also, snapshot don't necessarily arrive in the correct order in management service with the delta notifier.

## Decision

Make management service periodically query all the snapshots that need to be processed in order. 
Then process each snapshot one by one. 

## Consequences

Extra overhead is created to keep track of all the already processed snapshots.
It is possible now to guarantee correct order of processing. 
