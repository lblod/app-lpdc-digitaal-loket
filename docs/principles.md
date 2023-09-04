# Test Driven Development

LPDC and its components (lpdc-management, lpdc-publish, frontend-lpdc, app-lpdc-digitaal-loket) are developed using automated tests, written and
maintained by its developers.

To design and understand the behaviour of our code, we verify by writing tests before code. Since tests are the first client of our production code, it helps us design modular software. The tests communicate to the developer problems of modularity of code.

## Goals

#### For the tests

- Documentation
- Establish clear boundaries
- Fast and reliable feedback
- Only fail for useful reasons

#### For the production code

- modular code (a/ building abstractions b/ separation of concerns)

#### For the developer

- reduce / eliminate accidental complexity
- effectively understand and express essential complexity

## 5 Archetypes of automated tests

Ideally, we develop using following types of tests, each having its unique focus. 

| Type | Boundary | Example                                           | Useful reasons to fail                         | mocking used?                        |
| ---- | -------- |---------------------------------------------------|------------------------------------------------|--------------------------------------|
| **Unit test**| a minimal concept in code | class, or a few classes, a function, method, etc. | specific part of the concept is not understood | no                                   |
| **Collaboration test** | a compound element creating a meaninful whole | group of classes within single bounded context    | result of collaboration fails                  | only at the bounded context boundary | 
| **Integration test** | integration with / configuration of a technology | persistence with orm / sql database               | configuration out of sync with code            | no                                   |
| **Application architecture test** | application code | whether the code conforms to security guidelines  | a violation of agreed structuring of the code  | n/a (mostly static code analysis)    |
| **End 2 end test** | test scenarios on a deployed and integrated application | exercising UI on a fully deployed application| scenario fails | only at the system boundary |


