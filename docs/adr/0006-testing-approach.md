# 6. Testing approach

Date: 2023-09-04

## Status

Accepted

## Context

As detailed in [principles - test driven development](../principles.md#test-driven-development), we **use test driven development**.

Automated tests **require fast and reliable feedback**, and secondly some archetypes assume a non deployed application (unit test, component test, integration tests): both requirements seem difficult to technically achieve in the mu-stack. 

Furthermore, functionally and technically achieving an operation has its application logic, technical configuration and configuration is **scattered over several microservices**, a small configuration change can thus easily break functionality, making it difficult to judge the impact of a change on the whole system.  

## Decision

- We will write **unit tests** and **integration tests** in **frontend-lpdc** project directly. We will **use the ember testing framework**. 
- If possible, we will write **unit tests** for **lpdc-management** and **lpdc-publish** (the difficulty currently is that the mu- javascript helper code is injected during the docker build -> so you cannot exercise a typical unit test without having first a new docker build done). Sometimes it is feasible to extract a function void of any mu architecture code: this can then be unit tested.
- The **bulk of the tests** however will be **end 2 end tests**. We will write them for 1. **lpdc-management rest api** 2. the **mu-cl-resources configuration** 3. the **frontend-lpdc** 4. **all other config from app-lpdc-digitaal-loket**. End to end means that **all containers are configured**: identifier, dispatcher, database (mu-auth), virtuoso, delta notifier, migrations, cache, resource, lpdc-ldes-consumer, lpdc-management, lpdc-publish, frontend-lpdc.
- We will use [**Playwright**](https://playwright.dev/) using [Typescript](https://www.typescriptlang.org/) for writing the **end-to-end tests**.
- We will **create an ipdc-stub** that mimics ipdc. This will be used to verify the behaviour of _reading the ldes-stream from ipdc_ and _pushing instances to ipdc_.
- A separate docker config for **latest** and **local** development will be created. The latest config will run with docker 'latest' versions of frontend-lpdc, lpdc-management, lpdc-publish. The development version will run from the local code, started with node or ember in development mode.
- The [Continous Integration build](../deployment.md#continuous-integration) will also run the complete test set based on the latest containers.

## Consequences

- Starting the containers for the end-to-end tests will be slow.
- We will need to reduce the restart time of the test containers.
- Having the bulk of the tests as end-to-end tests will increase the build time.
