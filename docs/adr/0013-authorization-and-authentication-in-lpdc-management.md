# 13. Authorization and authentication in lpdc-management

date: 2024-02-07

## Status

Accepted

## Context

It is important to ensure that only authenticated and authorized users have the capability to make requests to the lpdc-management service.
Historically, the authentication and authorization processes were managed by the mu-authorization service, which performed these checks at the database level.
Due to [use applicative tenant filtering in lpdc managemnt service](0012-use-applicative-tenant-filtering-in-lpdc-management) we needed an alternative solution.

## Decision

For each endpoint the user session should be validated. 

This validation process involves the verification of the following criteria within each request:
1. **Session Presence**: Each request must include a `sessionId`, ensuring that a session is actively associated with the request.
2. **Session Validity**: The `sessionId` provided must correspond to an existing session in the database, confirming the session's validity.
3. **Role Verification**: The session must correctly represent the user's role, ensuring that the user has the appropriate permissions for their request.

Given the use of the Express framework within the management-service, we have decided to leverage an [express middleware function](https://expressjs.com/en/guide/using-middleware.html) for the implementation of our session validation mechanism.

## Consequences

Previously, authentication and authorization checks were not applied to endpoints interacting with external APIs, particularly those related to address information, since these did not directly query our internal database. The introduction of this new session validation approach enables us to extend protection to these previously unsecured endpoints.