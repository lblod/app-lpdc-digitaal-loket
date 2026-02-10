# LPDC (Lokale Producten- en Dienstencatalogus) - Digitaal loket

## Context

The LPDC application is built on the data model defined in:
* https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/

[System Context Diagram](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764559416630047&cot=14).

Other repos:
- [LPDC frontend](https://github.com/lblod/frontend-lpdc)
- [LPDC Management Service](https://github.com/lblod/lpdc-management-service)
- [LPDC Publish Service](https://github.com/lblod/lpdc-publish-service)

## Software Architecture

[Container Diagram](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764558708522486&cot=14)

Component Diagram: The architecture is that each docker can in fact be seen as a component. So in this system, the component diagram is the same than the container diagram. We would like to revise and simplify this in the future.

[Sequence Diagram For 'Wijzigingen bewaren' on an 'Instantie'](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764559335291592&cot=14)

[Sequence Diagram For 'Reading and updating concepts from LDES stream'](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764559654392138&cot=14)

## Further documentation

- Setting up and running a local [development environment](docs/development-environment.md)
- [Making releases and deploying](docs/deployment.md) to the different environments.
- Additional documentation on [operational support](docs/operation-support/operation-support.md) and supporting [integrating parties](docs/integrerende-gemeentes.md).
- An overview of (historical) [decisions](docs/adr/adrs.md) that shaped the applications.
- Info about the [feedback-available-flag-service](docs/feedback-available-flag-service-info.md).
