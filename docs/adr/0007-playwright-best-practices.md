# 7. Playwright best practices

Date: 2023-11-27

## Status

Accepted

## Context

We need a strategy to optimize maintenance and clarity in our end-to-end test suite using [Playwright](https://playwright.dev).

The strategy will need to balance flexibility with code reuse.

## Decision

- We will use [Page object models](https://playwright.dev/docs/pom) as a technique. A page object represents part of the application. 
- Page objects **simplify authoring** by _creating a higher-level API_ which suits your application and **simplify maintenance** by _capturing element selectors in one place_ and _create reusable code to avoid repetition_.
- We will have an `AbstractPage` and an `AbstractModal`. Each page / modal shall extend from one of these. Pages will reside in a subfolder `pages`, modals in `modals`.
- Each concrete Page / Modal will have a set of Locators, initialized in the constructor. The client tests will use these specific page objects, its locators, and if needed _some simple helper methods_ on the class itself. We **prefer to use the locators of the pages directly in the tests**. This will provide maximum flexibility. 
- For **more complex individual components on the page** (that either have a complex selector structure, or provide complex behaviour that is not readily available in the default Playwright API), we will create a **component**. Examples include `Select`, `MultiSelect`, `SelectWithCreate`, `Table`. These will reside in subfolder `components`. 

## Consequences

- We will be alert to move duplicate behaviour from tests to page objects if appropriate. But we remain alert to guard a balance between code reuse and flexibility. We might accept a bit of duplication in the tests over having a page object that has too much code reducing the flexibility and paradoxically its reuse. 