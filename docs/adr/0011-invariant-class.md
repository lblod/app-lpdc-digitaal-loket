# 11 Ensure Domain Integrity by using the invariant class 

date: 2024-02-07

## Status

Accepted

## Context

The invariant class plays a critical role in upholding the integrity and consistency of the domain within a software application. 
It serves as a mechanism to enforce domain logic and maintain data validity throughout the system's lifecycle.

## Decision 

We will implement checks from the invariant class throughout our software application to enforce business rules.
This involves defining classes with strict validation rules for their properties to ensure that all objects created conform to our domain's integrity and consistency requirements.


## Consequences 

- **Enforce Business Rules**: The invariant class allow the encapsulation of business rules as part of the domain logic. This ensures that all entities conform to the defined rules, preventing the system from entering an invalid state.
  - Example: Ensuring every concept entity has a title to maintain data consistency.
- **Reduce Errors**: By validating conditions and constraints at the class level, the invariant class significantly reduces the likelihood of errors and bugs that could stem from invalid data or incorrect state mutations.
By enforcing these business rules upon object creation, it ensures that objects are always in a correct and expected state, eliminating the possibility of creating objects with missing or incorrect fields.
- **Simplify Maintenance**: Developers can easily understand and modify the business rules of the application.
- **Object consistency**: Fetching incorrect objects now triggers errors, enhancing system robustness by preventing the manipulation of invalid data.
- **Business changes**: Changes to business rules necessitate creating migration scripts to align existing data with the new rules, ensuring data integrity across system updates.
