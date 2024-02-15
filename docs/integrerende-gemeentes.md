## Inleiding 

Dit document beschrijft het proces hoe integrerende gemeentes gepubliceerde product informatie kunnen synchroniseren met LPDC (Lokale Producten- en Dienstencatalogus). De producten worden zichtbaar voor de gemeente in LPDC. Ook synchroniseert LPDC de producten automatisch naar IPDC (Interbestuurlijke Producten- en Dienstencatalogus).

## Context diagramma / Stroomdiagramma

Beschrijft op een hoog niveau de data stromen tussen a/ integrerende gemeente b/ lpdc c/ ipdc en de gebruikte technologieën.

## Technologie beschrijving
### Linked Data 

**Linked Data** (LD) verwijst naar een methode om gestructureerde gegevens te publiceren zodat ze onderling verbonden en doorzoekbaar zijn op het internet. 
Deze aanpak maakt gebruik van standaarden zoals de **Resource Description Framework (RDF)**, **SPARQL (een RDF-querytaal)**, en **URI's (Uniform Resource Identifiers)** om gegevens te beschrijven en te linken. 
Het doel is om data uit verschillende bronnen gemakkelijk toegankelijk en integreerbaar te maken, zodat gebruikers en computersystemen deze kunnen vinden en gebruiken voor diverse doeleinden.

**LOD (Linked Open Data)** is een uitbreiding van het Linked Data-concept, waarbij de nadruk ligt op het openbaar en vrij beschikbaar maken van verbonden datasets. 
LOD maakt het mogelijk om gegevenssets van verschillende domeinen (zoals overheid, cultuur, wetenschap) aan elkaar te koppelen, waardoor een rijk en onderling verbonden gegevensweb ontstaat dat voor iedereen toegankelijk is.

### RDF (Resource Description Framework) - SPARQL (SPARQL Protocol and RDF Query Language)

(uit:[rdf primer](https://www.w3.org/TR/rdf11-primer/))

RDF is een framework om informatie uit te drukken over bronnen. Bronnen kunnen van alles zijn, inclusief documenten, mensen, fysieke objecten en abstracte concepten.
RDF is bedoeld voor situaties waarin informatie op het web verwerkt moet worden door applicaties, in plaats van alleen weergegeven te worden aan mensen. 
RDF biedt een gemeenschappelijk kader voor het uitdrukken van deze informatie zodat het tussen applicaties uitgewisseld kan worden zonder verlies van betekenis. 
Aangezien het een gemeenschappelijk kader is, kunnen applicatieontwerpers gebruikmaken van de beschikbaarheid van gemeenschappelijke RDF-parsers en verwerkingstools. 
Het vermogen om informatie uit te wisselen tussen verschillende applicaties betekent dat de informatie beschikbaar kan worden gemaakt voor applicaties anders dan waarvoor het oorspronkelijk was gecreëerd.
In het bijzonder kan RDF gebruikt worden om gegevens te publiceren en aan elkaar te koppelen op het web.

RDF stelt ons in staat uitspraken (statements) te doen over bronnen. Het formaat van deze uitspraken (statements) is eenvoudig. 
Een uitspraak (engels: Statement) heeft altijd de volgende structuur:

**`<subject> <predicate> <object>`**

Een RDF-statement drukt een relatie uit tussen twee bronnen. 
Het **<subject>** _(onderwerp)_ en het **object** vertegenwoordigen de twee aan elkaar gerelateerde bronnen; het **predicaat** _(predicate)_ representeert de **aard van hun relatie**. 
De relatie wordt op een directionele wijze geformuleerd (van onderwerp naar object) en wordt in RDF een **property** _(eigenschap)_ genoemd. 
Omdat RDF-statements altijd uit **drie elementen bestaan**, worden ze **triples** genoemd.

_Voorbeeld:_
```
<Bob> <is een> <persoon>.
<Bob> <is een vriend van> <Alice>.
<Bob> <is geboren op> <4 juli 1990>. 
<Bob> <is geïnteresseerd in> <de Mona Lisa>.
<Alice> <is een> <persoon>. 
<de Mona Lisa> <was gecreëerd door> <Leonardo da Vinci>.
<de Mona Lisa> <is een> <schilderij>.
<de video 'La Joconde à Washington'> <gaat over> <de Mona Lisa> .
<Leonardo da Vinci> <is een> <persoon>. 
```

Dezelfde bron wordt vaak in meerdere triples genoemd. 
In het bovenstaande voorbeeld is Bob het subject (onderwerp) van vier triples, en de Mona Lisa is het subject (onderwerp) en het object van elk twee triples. 
Het vermogen om dezelfde bron in de positie van subject (onderwerp) van de ene triple en in de positie van object van een andere triple te hebben, 
maakt het mogelijk om verbindingen tussen triples te vinden, wat een belangrijk onderdeel is van de kracht van RDF.

We kunnen triples visualiseren als een geconnecteerde **graaf**. Een graaf is een representatie van een set van objecten waar sommige paren van de objecten met elkaar verbonden zijn door links.
RDF is een graaf in de zin dat het een verzameling van triples is die een netwerk van verbindingen tussen verschillende bronnen vormt. 
Elke triple in RDF graaf bestaat uit een subject (onderwerp), een predicaat (predicate) en een object, waarbij deze triples de relaties tussen de bronnen beschrijven.

![rdf-triple-graaf.png](img%2Frdf-triple-graaf.png)

Merk op dat de relaties altijd bidirectioneel zijn in de graaf, maar in de triple omschrijving volstaat één richting te beschrijven.

De set van triples worden bewaard in een **triple-store**. Dit is een database dit RDF van nature kan opslaan.

Om gegevens te zoeken of te manipuleren in de graaf, kan je gebruik maken van **SPARQL**. 
SPARQL kan gebruikt worden om queries uit te drukken over diverse gegevensbronnen, of de gegevens nu van nature als RDF opgeslagen zijn of als RDF bekeken worden via middleware. 
SPARQL bevat mogelijkheden voor het opvragen van vereiste en optionele graafpatronen samen met hun conjuncties en disjuncties. 
SPARQL ondersteunt ook aggregatie, subqueries, negatie, het creëren van waarden door expressies, uitbreidbare waardebeoordeling, en het beperken van queries door bron RDF-graaf. 
De resultaten van SPARQL-queries kunnen resultaatsets of RDF-grafen zijn.

### LDES (Linked Data Event Stream)

### JSON-LD ()
### SHACL

## Contract specificaties

## Voorbeelden + implementatie tips

## Referenties

### Algemeen

- [LPDC](https://lpdc.lokaalbestuur.vlaanderen.be/)
- [IPDC](https://productencatalogus-v3.vlaanderen.be/nl/producten)

### Gebruikte standaarden
- [IPDC - LPDC (Implementatiemodel)](https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/)
- [URI (Uniform Resource Identifier)](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier)
- [RDF (Resource Description Framework)](https://www.w3.org/TR/rdf11-primer/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [OWL (Web Ontology Language)](https://www.w3.org/TR/owl2-overview/)
- [SHACL (Shapes Constraint Language)](https://www.w3.org/TR/shacl)
- [LDES (Linked Data Event Streams)](https://semiceu.github.io/LinkedDataEventStreams/)
- [TREE (The TREE hypermedia specification)](https://treecg.github.io/specification/)
- [JSON-LD (JSON for Linking Data)](https://json-ld.org/)
- [JSON-LD 1.1 Processing Algorithms and API](https://www.w3.org/TR/json-ld11-api/)

### Broncode (open source)

- [LBLOD (Local Decisions as Linked Open Data in Flanders) broncode](https://github.com/lblod/)
- [app-lpdc-digitaal-loket](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development)
- [lpdc-management-service](https://github.com/lblod/lpdc-management-service/tree/development)
- [frontend-lpdc](https://github.com/lblod/frontend-lpdc/tree/development)
- [lpdc-publish-service](https://github.com/lblod/lpdc-publish-service/tree/development)
- [ldes-consumer-service](https://github.com/redpencilio/ldes-consumer-service)
- [TREEcg (TREE community group - Hypermedia controls for publishing collections of entities)](https://github.com/TREEcg), met oa. [Actor Init LDES client (Metadata harvester for a Linked Data Event Stream.)](https://github.com/TREEcg/event-stream-client/tree/main/packages/actor-init-ldes-client)
- 
