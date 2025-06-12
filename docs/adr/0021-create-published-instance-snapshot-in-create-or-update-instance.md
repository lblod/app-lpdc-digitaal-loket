# 21. Create published instance snapshot in create or update instance

Date: 2024-07-12

## Status

Accepted

## Context

When an instance is published an update query is performed to update its status to 'verzonden'. 
In the scenario creating an instance based of an incoming instanceSnapshot from a LDES stream, the instance is created with the status 'verzonden'.
For instances in this status a publishedInstanceSnapshot needs to be created to be published to IPDC. 
Because the virtuoso database only supports a transactions in a single insert(delete) query. You cannot insert update multiple aggregates in one transaction.

## Decision

To guarantee creation of publishedInstanceSnapshot when an instance is published,
the triples for publishedInstanceSnapshot are inserted in the same query as instance is created or updated.

## Consequences

Saving publishedInstanceSnapshot is including in the instance repository.
This might not be very clean, but it solves the transaction issue and prevents us to have to fix data integrity issues
