# 6. Testing approach

Date: 2023-09-04

## Status

Accepted

## Context

As detailed in [principles - test driven development](../principles.md), we will use test driven development.

For some components, the requirements for the tests of fast and reliable feedback, and or some archetypes that assume a non deployed application (unit test, component test, integration tests) seem difficult to technically achieve in the mu-stack. 

Furthermore, application logic and configuration is scattered over several microservices, a small configuration change can easily break functionality, making it difficult to judge the impact of a change on the whole system.  

## Decision

- We will write unit tests and components tests in frontend-lpdc project directly.
- If possible, we will write unit tests for lpdc-management (the difficulty is that the mu- javascript code is injected during the docker build -> so you cannot exercise a typical test without having a new docker build done). Sometimes it is feasible to extract a function, that can be unit tested, without any of the mu architecture needed.
- The bulk of the tests however will be end 2 end tests. We will write them for 1. lpdc-management rest api 2. the mu-cl-resources configuration 3. the frontend-lpdc 4. all other config from app-lpdc-digitaal-loket. End to end means that all containers are configured: identifier, dispatcher, database (mu-auth), virtuoso, delta notifier, migrations, cache, resource, lpdc-ldes-consumer, lpdc-management, lpdc-publish, frontend-lpdc. 
- We will create an ipdc-stub that mimics ipdc. This will be used to verify the behaviour of reading the ldes-stream from ipdc and pushing instances to ipdc.

## Consequences

- A separate docker config for latest and local development will be created.
- Starting the containers for the end-to-end tests will be slow.
- We will need to tune the restart the tests container.
