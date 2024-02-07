# 9. Technically Optimize backend

Date: 2023-12-07

## Status

Accepted

## Context

The current lpdc-management-service project has the following aspects making it difficult to develop:
- depends on mu-javascript-template 
   - requiring a long reload time on changes during development (15-30 seconds)
   - the project does not compile in the IDE (since the template only injects dependent libraries during docker build time)
   - tests cannot be run (because it cannot be compiled in IDE)
   - no arm64 build available
   - is not up-to-date with security fixes
- config of forms is in app-lpdc-digitaal-loket (while this does not change with the application version - this is application code, not config)
- we use javascript (instead of typescript)
- no code verification configured
- no domain structure in the code. the code base seems a group of scripts manipulating data, instead of domain logic executing a business process

## Decision

We will make following changes to lpdc-management-service:
- depend on the latest LTS version of node (which includes stability + security fixes).
- enjoy a fast reload in development when a change occurs (ideally 1 sec reload time for restarting node server).
- write code in typescript , but allow javascript files as well.
- have the semantic forms config in the lpdc-management project instead of configuration via app-lpdc-digitaal-loket
- we want to have a compiling version in the IDE
- be able to run unit/collaboration tests in the IDE (in the test vm)
- be able to run integration tests in the IDE (connecting to a running docker container)
- have an arm64 build
- create another internal application structure to properly support DDD (Domain Driven Design) .
- code is verified using automatic verification tools (es lint)

## Consequences
- We will depend on an LTS node-alpine version directly
- We will create a minimal Docker file for production
- We will copy the dependent mu-helper-scripts into the lpdc-management-service codebase. This is a temporary solution. These should be distributed in an npm package.
- Running end-to-end tests will remain in app-lpdc-digitaal-loket (which integrates all the components).