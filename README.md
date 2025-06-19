# LPDC (Lokale Producten- en Dienstencatalogus) - Digitaal loket

_Note_: Documentation is structured using [The software guidebook by Simon Brown](https://leanpub.com/documenting-software-architecture).

## 1. Context

The LPDC application is built on the data model defined in:
* https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/

[System Context Diagram](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764559416630047&cot=14).

Other repos:
- [LPDC frontend](https://github.com/lblod/frontend-lpdc)
- [LPDC Management Service](https://github.com/lblod/lpdc-management-service)
- [LPDC Publish Service](https://github.com/lblod/lpdc-publish-service)

## 2. Functional Overview

## 3. Quality Attributes

## 4. Constraints

## 5. [Principles](docs/principles.md)

## 6. Software Architecture

[Container Diagram](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764558708522486&cot=14)

Component Diagram: The architecture is that each docker can in fact be seen as a component. So in this system, the component diagram is the same than the container diagram. We would like to revise and simplify this in the future.

[Sequence Diagram For 'Wijzigingen bewaren' on an 'Instantie'](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764559335291592&cot=14)

[Sequence Diagram For 'Reading and updating concepts from LDES stream'](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764559654392138&cot=14)

## 7. Code

## 8. Data

## 9. [Infrastructure Architecture](docs/infrastructure-architecture.md)

## 10. [Deployment](docs/deployment.md)

## 11. [Operation and Support](docs/operation-support/operation-support.md)

## 12. [Development Environment](docs/development-environment.md)

## 13. [Decision Log](docs/adr/adrs.md)

## 14. [Integrerende gemeentes](docs/integrerende-gemeentes.md)