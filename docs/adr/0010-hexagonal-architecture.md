# 10. Implementing Hexagonal Architecture

- The application will be structured using [hexagonal architecture](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)
  - Directories will delineate the primary architectural components.
  - Dependency rules will be enforced through [ArchUnit](https://www.archunit.org) tests.
- The core domain will adopt [Domain Driven Design](https://wikipedia.org/wiki/Domain-driven_design) principles.

See a practical example of hexagonal architecture in our LPDC project on [Miro](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764568140431537&cot=14).

Below is the diagram outlining the architectural dependencies:

```plantuml
@startuml
!pragma layout smetana
skinparam componentStyle rectangle

[Core Domain] <<..src.core.domain..>> as Domain
[Core Port] <<..src.core.port..>> as Port
[Driven Adapter] <<..src.driven..>> as Driven
[Driving Adapter] <<..src.driving..>> as Driving

Domain --> Port  : Uses
Port --> Domain : Uses
Driven --> Port : Implements
Driven --> Domain : Accesses
Driving --> Port : Implements
Driving --> Domain : Accesses

@enduml
