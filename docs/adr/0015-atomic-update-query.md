# 15. Atomic update query

date: 2024-02-08

## Status

Accepted

## Context

Previously, in the lpdc-management system, updates to aggregates in the database were performed through individual delete and insert operations.
Each triple of the aggregate was deleted, then inserted one by one.
This method lacks atomicity, posing a risk of data corruption in case of failures or interruptions during the process.
We assume that reads are frequent, but updates do not occur often.  
Also, we've noticed that mu-auth breaks atomic properties of a delete insert query by executing this as 2 queries to the virtuoso database.

## Decision

To enhance data integrity and consistency, we will transition to using atomic operations for updating aggregates.
This approach involves executing a [DELETE/INSERT](https://www.w3.org/TR/sparql11-update/) query within an unified transaction.
By encapsulating the whole update process in a transaction, we ensure that either all changes are committed or none, thereby maintaining the atomicity of updates.

Furthermore, to manage concurrency and prevent conflicts between simultaneous transactions, we will include a check for the `modifiedDate` of the aggregate within the WHERE clause of our queries.
This ensures that only the most current data versions are updated, minimizing the risk of overwriting recent changes made by concurrent transactions.

## Consequences

This solution is limited as it does not let us perform read and write operations across multiple aggregates within a single transaction. Virtuoso does not support having a transaction in which you can do multiple insert and delete operations that combined behave in a ACID fashion.
