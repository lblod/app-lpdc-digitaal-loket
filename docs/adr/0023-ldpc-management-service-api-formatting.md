# 23. Lpdc management service api formatting

Date: 2024-07-12

## Status 

Accepted

## Context

In [semantic.works](https://semantic.works/) ecosystem there is good support for apis following JSON:API standard.
Also, Emberjs works very well together with JSON:API standard.  

## Decision

To speed up development we decided to not use JSON:API standard in api responses for now in lpdc-management.
Most api endpoints are for commands or querying form data. 

Overview queries are still queried through mu-cl-resources which returns result in JSON:API formatting. 
Making it easy to create overview pages with filters, sorting and pagination capabilities.
This will be kept. 

## Consequences

The rest of the [semantic.works](https://semantic.works/) framework works well together with JSON:API so this breaks a bit with the rest of the framework.
