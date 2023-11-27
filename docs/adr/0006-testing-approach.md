# 6. Testing approach

Date: 2023-09-04

## Status

Accepted

Amended (2023-11-27)

## Context

As detailed in [principles - test driven development](../principles.md#test-driven-development), we **use test driven development**.

Automated tests _first_ and foremost **require fast and reliable feedback**, and _secondly_ some archetypes assume a non deployed application (unit test, component test, integration tests): both requirements seem difficult to technically achieve in the current mu-stack. 

Furthermore, functionally and technically achieving an operation having its application logic, technical configuration and any other configuration is **scattered over several microservices**, a small configuration change can thus easily break functionality, making it difficult to judge the impact of a change on the whole system or the operation.  

## Decision

- We will write **unit tests** and **integration tests** in **frontend-lpdc** project directly. We will **use the ember testing framework**. 
- If possible, we will write **unit tests** for **lpdc-management** and **lpdc-publish** (the difficulty currently is that the mu-javascript helper code is injected during the docker build -> the code does not compile in the IDE, so you cannot exercise a typical unit test without having first a new docker build done). Sometimes it is feasible to extract a function void of any mu architecture code: this can then be **unit tested**.
- The **bulk of the tests** however will be **end 2 end tests**. We will write them for 1. **lpdc-management rest api** 2. the **mu-cl-resources configuration / endpoints** 3. the **frontend-lpdc (and the other services)** 4. **all other config from app-lpdc-digitaal-loket**. End to end means that **all containers are configured**: identifier, dispatcher, database (mu-auth), virtuoso, delta notifier, migrations, cache, resource, lpdc-ldes-consumer, lpdc-management, lpdc-publish, frontend-lpdc.
- We will use [**Playwright**](https://playwright.dev/) using [Typescript](https://www.typescriptlang.org/) for writing the **end-to-end tests**.
- Since IPDC is outside our system boundary, we will **create an ipdc-stub** that mimics IPDC. This will be used to verify the behaviour of _reading the ldes-stream from IPDC_ and _pushing instances to IPDC_.
- A separate docker config for **latest** and **local** development will be created. The latest config will run with docker 'latest' versions of frontend-lpdc, lpdc-management, lpdc-publish. The development version will run from the local code, started with node or ember in development mode.
- The [Continous Integration build](../deployment.md#continuous-integration) will also run the complete test set based on the latest containers.
- We will seek a solution so that lpdc-management project compiles in the IDE, and does not need a docker build.

## Consequences

- Starting the containers for the end-to-end tests will be slow. 
- We will need to reduce the restart time of the test containers.
- Having the bulk of the tests as end-to-end tests will increase the build time.
- We will have to migrate some end-to-end tests back to unit / integration tests if technical issues with lpdc-management have been solved. 
