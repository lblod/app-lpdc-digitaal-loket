# 17. Error handling

Date: 2024-03-06

## Status

Accepted

## Context

Currently, no alert box is shown when an API call returns an error. At most an error is shown in the javascript console. The user does not know something went wrong.
We should build a mechanism in the UI that shows an error message when an API call returns an error.

## Decision

- To ensure we get an uniform handling of errors when the `lpdc-frontend` calls the `ldpc-management-service` backend, we should do uniform error handling in the backend as well. We will implement an error output contract in `lpdc-management-service` according to [rfc 7807](https://www.rfc-editor.org/rfc/rfc7807.html) .
- Clean up in `lpdc-management-service` all the copied error handling, and use [express middleware](https://expressjs.com/en/guide/writing-middleware.html) .
- Implement in the` lpdc-frontend` a timeout on any toasters … .
- Cleanup any manual error handling either in UI or backend.

## Consequences
- We will not touch upon the existing error handling done by `mu-cl-resources`, and others. We will only adapt our `lpdc-management-service` backend.
