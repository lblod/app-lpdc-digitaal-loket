# 1. Trunk-based Development

Date: 2023-07-13

## Status

Accepted

## Context

We need to devise a strategy for branching.

## Decision

We will use [Trunk-based development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development).

## Consequences

- Developers will need to learn to develop and commit in small batches.
- A commit pushed to the trunk will possibly go to production, so it needs to be tested before pushing.
- We will augment the current code base with automated testing.
- We will need an CI/CD pipeline. 
- If a certain feature cannot be released into production in pieces, we will either need careful planning, or use feature flags.