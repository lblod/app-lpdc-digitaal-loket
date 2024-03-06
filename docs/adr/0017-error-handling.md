# 17. Data Integrity Tests

Date: 2024-03-06

## Status

Accepted

## Context

Currently, no alert box is shown when api call returns an error. At most an error is shown in the javascript console. The user does not know something went wrong.
We should build a mechanism in the ui that shows an error message when an API call returns an error.

## Decision

To ensure we get an uniform handling of errors when the lpdc-frontend calls the ldpc-management-service backend, we should do uniform error handling in the backend as well. Suggestion is to implement a error output contract in lpdc-management-service according to [rfc 7807](https://www.rfc-editor.org/rfc/rfc7807.html) .
Also clean up in lpdc-management-service all the copied error handling, and use [express middleware](https://expressjs.com/en/guide/writing-middleware.html) .
Also implement in the UI a timeout on any toasters … .
And cleanup any manual error handling either in UI or backend.

## Consequences
