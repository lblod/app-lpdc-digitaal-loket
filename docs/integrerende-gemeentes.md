## Inhoudsopgave
<!-- TOC -->
  * [Inleiding](#inleiding-)
  * [Stroomdiagramma](#stroomdiagramma)
  * [Technologie beschrijving](#technologie-beschrijving)
  * [Contractspecificaties](#contractspecificaties)
  * [Voorbeelden + implementatie tips](#voorbeelden--implementatie-tips)
  * [Verklarende woordenlijst](#verklarende-woordenlijst)
  * [Referenties](#referenties)
<!-- TOC -->

## Inleiding 

Dit document beschrijft het proces hoe integrerende gemeentes gepubliceerde productinformatie kunnen synchroniseren met LPDC (Lokale Producten- en Dienstencatalogus). De producten worden zichtbaar voor de gemeente in LPDC. Ook synchroniseert LPDC de producten automatisch naar IPDC (Interbestuurlijke Producten- en Dienstencatalogus).

Dit document geeft een overzicht onder de vorm van een [stroomdiagramma](#stroomdiagramma), [specifieert het contract](#contract-specificaties), geeft [(uitvoerbare) voorbeelden en implementatie tips](#voorbeelden--implementatie-tips), een [verklarende woordenlijst](#verklarende-woordenlijst) en een lijst van gebruikte [referenties](#referenties).

## Stroomdiagramma

Beschrijft op een hoog niveau de relevante datastromen tussen integrerende gemeente, LPDC en IPDC.

![integrerende-gemeentes-stroomdiagramma.png](img%2Fintegrerende-gemeentes-stroomdiagramma.png)

1. **IPDCv3**: De interbestuurlijke producten en dienstencatalogus (IPDC) beschrijft producten en diensten van overheden in Vlaanderen. 
Dit zijn producten van zowel bovenlokale als lokale besturen (gevoed door de Lokale Producten en DienstenCatalogus (LPDC)). 
IPDC tracht zo de centrale bron te zijn voor alle producten en diensten binnen Vlaanderen, en om dit te faciliteren is hij verdeeld in twee delen: concepten en instanties.
2. **Ophalen concepten**: de toepassingen van integrerende gemeentes kunnen concepten ophalen bij IPDC. 
Indien integrerende gemeentes kiezen dit via **LDES** (Linked Data Event Stream) te verwezenlijken, gebeurt dit via conceptsnapshots. 
Hoe hierbij aan te sluiten, vind je [hier](https://vlaamseoverheid.atlassian.net/wiki/external/6317081715/ZGU4MGNlODM2N2U1NDU5MGFlY2NlYzcxYmQyYWUwMTc). 
3. **Toepassing van lokaal bestuur**: toepassing van integrerende gemeente dat instanties beheert, optioneel op basis van concepten uit IPDC. 
Deze toepassing levert te publiceren instanties en eventuele wijzigingen in de vorm van een stroom van instantiesnapshots als een **LDES**.
4. **Ophalen te publiceren instanties**: LPDC-module synchroniseert de instanties van de integrerende gemeente door de aangeboden instantiesnapshots uit te lezen met behulp van een **LDES**. 
5. **LPDC**: stelt je in staat om de producten en diensten van je lokale bestuur te beheren. Het herbouwt ook elke instantie vanuit de laatste snapshot van de **LDES** en synchroniseert deze vervolgens met IPDC. De meest recent bijgewerkte versie van elke instantie is zichtbaar voor de integrerende gemeente op LPDC, maar alleen in een leesmodus. 
6. LPDC-module publiceert instanties naar IPDC.   

## Technologie beschrijving

Samenvatting van de gebruikte technologieën voor gegevensoverdracht. Niet bedoeld om allesomvattend te zijn. Verdere technische details zijn te vinden in de referenties.

### Linked Data 

**Linked Data** (LD) verwijst naar een methode om gestructureerde gegevens te publiceren zodat ze onderling verbonden en doorzoekbaar zijn op het internet. 
Deze aanpak maakt gebruik van standaarden zoals de **Resource Description Framework (RDF)**, **SPARQL (een RDF-querytaal)**, en **URI's (Uniform Resource Identifiers)** om gegevens te beschrijven en te linken. 
Het doel is om data uit verschillende bronnen gemakkelijk toegankelijk en integreerbaar te maken, zodat gebruikers en computersystemen deze kunnen vinden en gebruiken voor diverse doeleinden.

**LOD (Linked Open Data)** is een uitbreiding van het Linked Data-concept, waarbij de nadruk ligt op het openbaar en vrij beschikbaar maken van verbonden datasets. 
LOD maakt het mogelijk om gegevenssets van verschillende domeinen (zoals overheid, cultuur, wetenschap) aan elkaar te koppelen, waardoor een rijk en onderling verbonden gegevensweb ontstaat dat voor iedereen toegankelijk is.

### RDF (Resource Description Framework)

#### Inleiding

(uit:[rdf primer](https://www.w3.org/TR/rdf11-primer/))

RDF is een framework om informatie uit te drukken over bronnen. Bronnen kunnen van alles zijn, inclusief documenten, mensen, fysieke objecten en abstracte concepten.

RDF is bedoeld voor situaties waarin informatie op het web verwerkt moet worden door applicaties, in plaats van alleen weergegeven te worden aan mensen.

RDF biedt een gemeenschappelijk kader voor het uitdrukken van deze informatie zodat het tussen applicaties uitgewisseld kan worden zonder verlies van betekenis.
Aangezien het een gemeenschappelijk kader is, kunnen applicatieontwerpers gebruikmaken van de beschikbaarheid van gemeenschappelijke RDF-parsers en verwerkingstools.

Het vermogen om informatie uit te wisselen tussen verschillende applicaties betekent dat de informatie beschikbaar kan worden gemaakt voor applicaties anders dan waarvoor het oorspronkelijk was gecreëerd.
In het bijzonder kan RDF gebruikt worden om gegevens te publiceren en aan elkaar te koppelen op het web.

RDF stelt ons in staat uitspraken te doen over bronnen. Het formaat van deze uitspraken (statements) is eenvoudig.

Een uitspraak (Engels: statement) heeft altijd de volgende structuur:

**`<subject> <predicate> <object>`**

Een RDF-statement drukt een relatie uit tussen twee bronnen. 
Het **subject** _(onderwerp)_ en het **object** vertegenwoordigen de twee aan elkaar gerelateerde bronnen; het **predicaat** _(predicate)_ representeert de **aard van hun relatie**. 
De relatie wordt op een directionele wijze geformuleerd (van onderwerp naar object) en wordt in RDF-terminologie een **property** _(eigenschap)_ genoemd. 
Omdat RDF-statements altijd uit **drie elementen bestaan**, worden ze **triples** genoemd.

_Voorbeelden:_
```
<Bob> <is een> <persoon>.
<Bob> <is een vriend van> <Alice>.
<Bob> <is geboren op> <4 juli 1990>. 
<Bob> <is geïnteresseerd in> <de Mona Lisa>.
<Alice> <is een> <persoon>. 
<de Mona Lisa> <heeft als titel> <Mona Lisa>.
<de Mona Lisa> <was gecreëerd door> <Leonardo da Vinci>.
<de Mona Lisa> <is een> <schilderij>.
<de video 'La Joconde à Washington'> <gaat over> <de Mona Lisa>.
<Leonardo da Vinci> <is een> <persoon>. 
```

Dezelfde bron wordt vaak in meerdere triples van een dataset genoemd. 
In het bovenstaande voorbeeld is Bob het subject (onderwerp) van vier triples, en de Mona Lisa is het subject (onderwerp) en het object van elk twee triples. 
Het vermogen om dezelfde bron in de positie van subject (onderwerp) van de ene triple en in de positie van object van een andere triple te hebben, 
maakt het mogelijk om verbindingen tussen triples te vinden, wat een belangrijk onderdeel is van de kracht van RDF.

We kunnen triples visualiseren als een geconnecteerde **graaf**. Een graaf is een representatie van een objectenset waar sommige paren van de objecten met elkaar verbonden zijn door links.

RDF is een graaf in de zin dat het een verzameling van triples is die een netwerk van verbindingen tussen verschillende bronnen vormt. 

Elke triple in een RDF-graaf bestaat uit een subject (onderwerp), een predicaat (predicate) en een object. Deze triples beschrijven de relaties tussen de bronnen.

![rdf-triple-graaf.png](img%2Frdf-triple-graaf.png)

Merk op dat we rdf relaties unidirectioneel voorstellen in de graaf, in de richting van de triple beschrijving. Echter, semantisch dien je de relatie in beide richting te begrijpen. Je kan bv. vragen via SPARQL: _Wat is \<Bob\>?_ maar ook _Wie \<is een\> \<persoon\>_?     

#### IRIs
Een IRI is een International Resource Identifier. Een IRI definieert een bron (resource).

De URL's (Uniform Resource Locators) die mensen gebruiken als webadressen zijn één vorm van IRI (Internationalized Resource Identifiers).

Andere vormen van IRI bieden een identificatie voor een bron zonder de locatie of hoe deze te benaderen te impliceren. 

Het concept van IRI is een generalisatie van URI (Uniform Resource Identifier), waardoor niet-ASCII tekens gebruikt kunnen worden in de IRI-tekenreeks. 
IRI's zijn gespecificeerd in [RFC3987](https://www.ietf.org/rfc/rfc3987.txt).

IRI's kunnen verschijnen **in alle drie de posities** van een triple.

Zoals vermeld, worden IRI's gebruikt om bronnen te identificeren zoals documenten, personen, fysieke objecten en abstracte concepten. 

Bijvoorbeeld, de IRI voor Leonardo da Vinci in DBpedia is (subject en object `<Leonardo da Vinci>`):

```
http://dbpedia.org/resource/Leonardo_da_Vinci
```

De IRI voor een video over de Mona Lisa getiteld 'La Joconde à Washington' in Europeana is: (subject: `<de video 'La Joconde à Washington'>`)

```
http://data.europeana.eu/item/04802/243FA8618938F4117025F17A8B813C5F9AA4D619
```

IRI's zijn wereldwijde identificatoren, dus andere mensen kunnen deze IRI hergebruiken om hetzelfde te identificeren. 
Bijvoorbeeld, de volgende IRI wordt door veel mensen gebruikt als een RDF-eigenschap om een kennissenrelatie tussen mensen aan te geven (in ons voorbeeld `<is een vriend van>`):

```
http://xmlns.com/foaf/0.1/knows
```

RDF is neutraal over wat de IRI vertegenwoordigt. Echter, IRI's kunnen betekenis krijgen door specifieke vocabulaires of conventies.

Bijvoorbeeld, DBpedia gebruikt IRI's in de vorm van http://dbpedia.org/resource/Naam om het ding aan te duiden dat beschreven wordt door het overeenkomstige Wikipedia-artikel.

Het RDF-datamodel biedt een manier om uitspraken te doen over bronnen. Zoals we hebben vermeld, maakt dit datamodel geen aannames over waarvoor bron-IRI's staan. 
In de praktijk wordt RDF doorgaans gebruikt in combinatie met vocabulaires of andere conventies die semantische informatie over deze bronnen verstrekken.

Veel gebruikte voorbeelden zijn: [RDF Syntax](https://www.w3.org/1999/02/22-rdf-syntax-ns), [Dublin Core](http://dublincore.org/documents/dcmi-terms/), [schema.org](http://schema.org/), [SKOS](http://www.w3.org/2004/02/skos/), [FOAF](http://www.foaf-project.org/).

The aanduiden van een type `<is een>` kan bv. met
```
http://www.w3.org/1999/02/22-rdf-syntax-ns#type
```

#### Literals

Literals zijn basiswaarden die geen IRI's zijn. 

Voorbeelden van literals omvatten strings zoals "La Joconde", datums zoals "de 4e juli, 1990" en getallen zoals "3.14159". 

Literals worden geassocieerd met een datatype waardoor dergelijke waarden correct geparsed en geïnterpreteerd kunnen worden. 
String literals kunnen optioneel geassocieerd worden met een language tag (taaltag).

**Literals mogen alleen verschijnen in de objectpositie van een triple.**

#### Triple-store

De set van triples worden bewaard in een **triple-store**. Dit is een database die RDF van nature kan opslaan.

Voorbeelden van triple stores zijn: [Virtuoso](https://github.com/openlink/virtuoso-opensource), [Apache Jena](https://jena.apache.org/), [GraphDB](https://graphdb.ontotext.com/).

### Serialisatie-formaten voor RDF-data

Er bestaan verschillende serialisatieformaten voor het noteren van RDF-grafen. 
Echter, verschillende manieren van het noteren van dezelfde graaf leiden tot precies dezelfde triples en zijn dus logisch equivalent.

Hieronder geven we voorbeelden van verscheidene serialisatieformaten die het pseudocode voorbeeld mapt met een aantal vocabulaires. 

#### N-Triples

N-Triples biedt een simpele, regelgebaseerde, platte-tekst manier om RDF-grafen te serialiseren.
```turtle
<http://example.org/bob#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
<http://example.org/bob#me> <http://xmlns.com/foaf/0.1/knows> <http://example.org/alice#me> .
<http://example.org/bob#me> <http://schema.org/birthDate> "1990-07-04"^^<http://www.w3.org/2001/XMLSchema#date> .
<http://example.org/bob#me> <http://xmlns.com/foaf/0.1/topic_interest> <http://www.wikidata.org/entity/Q12418> .
<http://example.org/alice#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
<http://www.wikidata.org/entity/Q12418> <http://purl.org/dc/terms/title> "Mona Lisa" .
<http://www.wikidata.org/entity/Q12418> <http://purl.org/dc/terms/creator> <http://dbpedia.org/resource/Leonardo_da_Vinci> .
<http://www.wikidata.org/entity/Q12418> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://schema.org/Painting>.
<http://data.europeana.eu/item/04802/243FA8618938F4117025F17A8B813C5F9AA4D619> <http://purl.org/dc/terms/subject> <http://www.wikidata.org/entity/Q12418> .
<http://dbpedia.org/resource/Leonardo_da_Vinci> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
```

Elke regel vertegenwoordigt een triple. Volledige _IRI_'s zijn omsloten in spitse haakjes (`<>`). 
De punt aan het einde van de regel geeft het einde van de triple aan. 
In regel 3 zien we een voorbeeld van een _literal_, in dit geval een datum. 
Het datatype wordt aan de literal toegevoegd via een `^^` scheidingsteken. 
De datum representatie volgt de conventies van het `XML Schema datatype date`.

Omdat string _literals_ zo alomtegenwoordig zijn, staat N-Triples de gebruiker toe om het datatype weg te laten bij het schrijven van een string literal. 
Dus, `"Mona Lisa"` is equivalent aan  `"Mona Lisa"^^xsd:string`. 
In het geval van taal-getagde strings verschijnt de tag direct na de string, gescheiden door een `@ symbool`, bijvoorbeeld `"La Joconde"@fr` (de Franse naam van de Mona Lisa).

Het aantal lijntjes N-Triples vertegenwoordigt het aantal links in de graaf.

#### Turtle

Turtle is een uitbreiding van [N-Triples](#n-triples). 
Naast de basis N-Triples syntax, introduceert Turtle een aantal syntactische verkortingen, zoals ondersteuning voor namespace prefixes, lijsten en afkortingen voor datatyped literals. 
Turtle biedt een compromis tussen schrijfgemak, parsegemak en leesbaarheid.

Het werkvoorbeeld uitgedrukt in TURTLE:

```turtle
BASE   <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX wd: <http://www.wikidata.org/entity/>

<bob#me>
    a foaf:Person ;
    foaf:knows <alice#me> ;
    schema:birthDate "1990-07-04"^^xsd:date ;
    foaf:topic_interest wd:Q12418 .

<alice#me>
    a foaf:Person.

<http://dbpedia.org/resource/Leonardo_da_Vinci>
    a foaf:Person.

wd:Q12418
    dcterms:title "Mona Lisa" ;
    dcterms:creator <http://dbpedia.org/resource/Leonardo_da_Vinci> ;
    a schema:Painting .

<http://data.europeana.eu/item/04802/243FA8618938F4117025F17A8B813C5F9AA4D619>
    dcterms:subject wd:Q12418 .
```

- de afkorting 'a' komt overeen met de menselijke intuïtie over `rdf:type`. 
- _PREFIX_ voorziet een afgekorte vorm om IRI's te specifiëren, bv. `foaf:Person` is hetzelfde als `<http://xmlns.com/foaf/0.1/Person>`; `xsd:date` is hetzelfde als `<http://www.w3.org/2001/XMLSchema#date>`
- het scheidingsteken `;` wijst erop dat de lijst van `predicaten` en `objecten` horen bij het eerder vermelde `subject`. 

#### JSON-LD

JSON-LD biedt een JSON-syntax voor RDF-grafen en datasets. 

JSON-LD kan gebruikt worden om JSON-documenten met minimale wijzigingen naar RDF om te zetten en omgekeerd.

JSON-LD biedt universele identificatoren voor JSON-objecten, een mechanisme waarbij een JSON-document kan verwijzen naar een object dat in een ander JSON-document elders op het web wordt beschreven, evenals datatype- en taalafhandeling. 

JSON Document van lopend voorbeeld:

```json
{
  "@context": "example-context.json",
  "@id": "http://example.org/bob#me",
  "@type": "Person",
  "isEenVriendVan": {
    "@id": "http://example.org/alice#me",
    "@type": "Person"
  },
  "isGeborenOp": "1990-07-04",
  "isGeinteresseerdIn": {
    "@id": "http://www.wikidata.org/entity/Q12418",
    "titel": "Mona Lisa",
    "onderwerp_van": "http://data.europeana.eu/item/04802/243FA8618938F4117025F17A8B813C5F9AA4D619",
    "wasGecreerdDoor": {
      "@id": "http://dbpedia.org/resource/Leonardo_da_Vinci",
      "@type": "Person"
    }
  }
}

```

De key `@context` wijst naar een JSON-document dat beschrijft hoe het document naar een RDF-graaf kan worden gemapt (zie hieronder). 

Elk JSON-object komt overeen met een RDF-bron. Deze worden aangeduid met het trefwoord `@id `. 
In het bovenstaande voorbeeld zijn er 4 JSON-objecten: `"@id": "http://example.org/bob#me"`, `"@id": "http://example.org/alice#me"`, ` "http://www.wikidata.org/entity/Q12418"` en `"@id": "http://dbpedia.org/resource/Leonardo_da_Vinci"`.
Het trefwoord `@id`, wanneer gebruikt als een key in een JSON-LD document, wijst naar een IRI die de bron identificeert die overeenkomt met het huidige JSON-object.

Het trefwoord `@type` beschrijft het type.

Andere attributen beschrijven eigenschappen van een JSON-object. (bvb. `isEenVriendVan`, `isGeborenOp`, `titel`, enz).

Dit context-document beschrijft hoe een JSON-LD document naar een RDF-graaf kan worden gemapt (ofwel embedded binnen de @context tag, ofwel beschikbaar gesteld via een URL).

```json
{
  "@context": {
    "foaf": "http://xmlns.com/foaf/0.1/", 
    "Person": "foaf:Person",
    "isGeinteresseerdIn": "foaf:topic_interest",
    "isEenVriendVan": {
      "@id": "foaf:knows",
      "@type": "@id"
    },
    "isGeborenOp": {
      "@id": "http://schema.org/birthDate",
      "@type": "http://www.w3.org/2001/XMLSchema#date"
    },
    "dcterms": "http://purl.org/dc/terms/",
    "titel": "dcterms:title",
    "wasGecreerdDoor": {
      "@id": "dcterms:creator",
      "@type": "@id"
    },
    "onderwerp_van": {
      "@reverse": "dcterms:subject",
      "@type": "@id"
    }
  }
}
```

Merk op dat de combinatie van de twee documenten het semantisch model opbouwen. De keuze van de termen in de `@context` document en de json zijn op zich vrij te kiezen.

In bovenstaand voorbeeld werd in het context-document nederlands gebruikt (en de data die deze @context gebruikt ook). Dit is geen vereiste, andere talen of eigen termen werken evengoed.

Een interactieve omzetting van dit voorbeeld op json-ld playground vind je [hier](https://json-ld.org/playground/#startTab=tab-nquads&json-ld=%7B%22%40context%22%3A%7B%22foaf%22%3A%22http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%22%2C%22Person%22%3A%22foaf%3APerson%22%2C%22isGeinteresseerdIn%22%3A%22foaf%3Atopic_interest%22%2C%22isEenVriendVan%22%3A%7B%22%40id%22%3A%22foaf%3Aknows%22%2C%22%40type%22%3A%22%40id%22%7D%2C%22isGeborenOp%22%3A%7B%22%40id%22%3A%22http%3A%2F%2Fschema.org%2FbirthDate%22%2C%22%40type%22%3A%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23date%22%7D%2C%22dcterms%22%3A%22http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%22%2C%22titel%22%3A%22dcterms%3Atitle%22%2C%22wasGecreerdDoor%22%3A%7B%22%40id%22%3A%22dcterms%3Acreator%22%2C%22%40type%22%3A%22%40id%22%7D%2C%22onderwerp_van%22%3A%7B%22%40reverse%22%3A%22dcterms%3Asubject%22%2C%22%40type%22%3A%22%40id%22%7D%7D%2C%22%40id%22%3A%22http%3A%2F%2Fexample.org%2Fbob%23me%22%2C%22%40type%22%3A%22Person%22%2C%22isEenVriendVan%22%3A%7B%22%40id%22%3A%22http%3A%2F%2Fexample.org%2Falice%23me%22%2C%22%40type%22%3A%22Person%22%7D%2C%22isGeborenOp%22%3A%221990-07-04%22%2C%22isGeinteresseerdIn%22%3A%7B%22%40id%22%3A%22http%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ12418%22%2C%22titel%22%3A%22Mona%20Lisa%22%2C%22onderwerp_van%22%3A%22http%3A%2F%2Fdata.europeana.eu%2Fitem%2F04802%2F243FA8618938F4117025F17A8B813C5F9AA4D619%22%2C%22wasGecreerdDoor%22%3A%7B%22%40id%22%3A%22http%3A%2F%2Fdbpedia.org%2Fresource%2FLeonardo_da_Vinci%22%2C%22%40type%22%3A%22Person%22%7D%7D%7D&frame=%7B%7D&context=%7B%22%40context%22%3A%22http%3A%2F%2Fschema.org%2F%22%7D).


###  SPARQL (SPARQL Protocol and RDF Query Language)

Om gegevens te zoeken of te manipuleren in de graaf, kan je gebruik maken van **SPARQL**.

Met SPARQL kun je vragen stellen (queries) over diverse gegevensbronnen. Dit werkt zelfs als deze gegevens oorspronkelijk niet in het RDF-formaat zijn opgeslagen, maar wel zo kunnen worden geïnterpreteerd met behulp van middleware.

Met SPARQL kun je complexe vragen stellen die verschillende voorwaarden combineren (opvragen van vereiste en optionele graafpatronen samen met hun conjuncties en disjuncties). Je kunt ook informatie samenvoegen (aggregatie), gedetailleerde subvragen stellen (subqueries), bepaalde gegevens uitsluiten (negatie), nieuwe informatie berekenen uit bestaande gegevens, en de zoekopdrachten verfijnen door te bepalen uit welke gegevensbronnen je informatie wilt halen.

De resultaten van SPARQL-queries kunnen resultaatsets of RDF-grafen zijn.

Een voorbeeld query: 

```sparql
select ?subject WHERE {
    GRAPH <test> {
          ?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person>
    }
}
```

Geeft als resultaat:
```
subject
http://dbpedia.org/resource/Leonardo_da_Vinci
http://example.org/alice#me
http://example.org/bob#me
```

### SHACL (Shapes Constraint Language)

SHACL is een taal voor het beschrijven en valideren van RDF-grafen.

SHACL beschrijft de structuur en de condities waaraan een dataset dient te voldoen.

SHACL voorziet metadata over de data met als doel de data te kunnen valideren.

Kan de definities en structuren die zijn vastgelegd in RDF-schema's en OWL-ontologieën aanvullen.  
Dit betekent dat SHACL gebruikt kan worden om extra regels en beperkingen toe te voegen aan de informatie die al gedefinieerd is in RDF-schema's (een manier om relaties en structuren in RDF-gegevens te beschrijven) en OWL-ontologieën (een taal voor het definiëren van complexe relaties tussen concepten). SHACL helpt bij het verfijnen en specificeren van de verwachtingen over de gegevensstructuur en integriteit, bovenop de bestaande definities in RDF en OWL.

SHACL's worden beschreven in RDF.

### LDES (Linked Data Event Stream)

#### Inleiding

Een Linked Data Event Stream (LDES) (`ldes:EventStream`) is een verzameling (`rdfs:subClassOf tree:Collection`) van onveranderlijke objecten, waarbij elk object wordt beschreven met behulp van een set RDF-triples.

De focus van een LDES is om clients in staat te stellen de geschiedenis van een dataset te repliceren en efficiënt te synchroniseren met de nieuwste wijzigingen.

LDES maakt gebruik van de [TREE specificatie](https://treecg.github.io/specification) om verzamelingen, fragmentering en/of paginering eigenschappen te beschrijven.

_Noot_: Wanneer een client eenmaal een `member` heeft verwerkt, zou deze het nooit meer opnieuw moeten hoeven te verwerken. Een Linked Data Event Stream-client kan dus een lijst van (of cache voor) reeds verwerkte lid-IRI's bijhouden.

Verdere LDES-voorbeelden in dit hoofdstuk illustreren concepten van een LDES, met RDF-data in serialisatievorm _Turtle_. De data kan uiteraard ook geserialiseerd worden als JSON-LD. Op het einde van deze sectie is een voorbeeld ook gepresenteerd in json-ld formaat.

Volgend voorbeeld duidt een 'observatie' aan aangeboden in een LDES stream:

```turtle
@prefix ex: <http://example.com/ns#> .
@prefix ldes: <https://w3id.org/ldes#> .
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix tree: <https://w3id.org/tree#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:C1 a ldes:EventStream ;
      ldes:timestampPath sosa:resultTime ;
      tree:member ex:Observation1 .

ex:Observation1 a sosa:Observation ;
                sosa:resultTime "2021-01-01T00:00:00Z"^^xsd:dateTime ;
                sosa:hasSimpleResult "..." .
```
- `tree:member` duidt op een member in de verzameling.
- `ldes:timestampPath` verwijst naar de predicate in een member waar de _timestamp_ van de data te vinden is.
- `ex:Observation1` wordt beschreven als RDF-data.

#### Fragmentering en paginering

Linked Data Event Streams mogen gefragmenteerd worden wanneer hun grootte te groot wordt voor één HTTP-antwoord. 

Fragmenten moeten worden beschreven met behulp van de functies in de TREE-specificatie. Alle relatie-types uit de TREE-specificatie mogen worden gebruikt.

Voorbeeld:

```turtle
@prefix ex: <http://example.com/ns#> .
@prefix ldes: <https://w3id.org/ldes#> .
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix tree: <https://w3id.org/tree#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:C1 a ldes:EventStream ;
      ldes:timestampPath sosa:resultTime ;
      tree:member ex:Observation1, ex:Observation2;
      tree:view ex:page-1 .

ex:page-1 a tree:Node ;
          tree:relation [
              a tree:GreaterThanOrEqualToRelation ;
              tree:path sosa:resultTime ;
              tree:node ex:page-2 ;
              tree:value "2020-12-24T12:00:00Z"^^xsd:dateTime
          ] .

ex:Observation1 a sosa:Observation ;
                sosa:resultTime "2021-01-01T00:00:00Z"^^xsd:dateTime ;
                sosa:hasSimpleResult "..." .

ex:Observation2 a sosa:Observation ;
                sosa:resultTime "2021-01-01T01:00:00Z"^^xsd:dateTime ;
                sosa:hasSimpleResult "..." .
```
- de ldes stream pagina bevat alle `tree:members` van deze pagina (`ex:Observation1` en `ex:Observation2`)
- `tree:view` specifieert welke subset van de `tree:collection` deze pagina toont, en via `tree:relation` kan je navigeren naar andere subsets. Typisch zijn de `ex:page-1` en `ex:page2` effectieve URL's die een gepagineerd endpoint aanduiden (zie verder).  

#### Versionering

Beschrijft hoe je een object kan veranderen waarbij je de historiek van het rdf-document bijhoudt. 
Je stuurt met andere woorden een serie van snapshots van de data van het rdf-document op. 
Hierbij verwijs je telkens naar het origineel rdf-document en het tijdstip van de snapshot. 
Dit stelt de LDES-afnemer in staat de historiek te reconstrueren en de laatste versie te bewaren (en hierbij toch performant niet telkens de hele LDES te hoeven uitlezen).

Technisch, wordt een versiebeheerde-LDES gedefinieerd met twee eigenschappen: `ldes:versionOfPath` en `ldes:timestampPath`.
- `ldes:versionOfPath`: verklaart de predicate die wordt gebruikt om te definiëren dat een `tree:member` van een `ldes:EventStream` een versie is van een rdf-document.
- `ldes:timestampPath`: verklaart de predicate die wordt gebruikt om de DateTime van een `tree:member` te definiëren.

Volgend voorbeeldje illustreert versiebeheerde-LDES:

```turtle
@prefix ex: <http://example.com/ns#> .
@prefix ldes: <https://w3id.org/ldes#> .
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix tree: <https://w3id.org/tree#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix adms: <http://www.w3.org/ns/adms#> .

ex:C2 a ldes:EventStream ;
      ldes:timestampPath dcterms:created ;
      ldes:versionOfPath dcterms:isVersionOf ;
      tree:member ex:AddressRecord1-version1, ex:AddressRecord1-version2.

ex:AddressRecord1-version1 dcterms:created "2021-01-01T00:00:00Z"^^xsd:dateTime ;
                           adms:versionNotes "First version of this address" ;
                           dcterms:isVersionOf ex:AddressRecord1 ;
                           dcterms:title "Streetname X, ZIP Municipality, Country" .

ex:AddressRecord1-version2 dcterms:created "2021-01-02T00:00:00Z"^^xsd:dateTime ;
                           adms:versionNotes "Second version of this address" ;
                           dcterms:isVersionOf ex:AddressRecord1 ;
                           dcterms:title "Streetname X + Y, ZIP Municipality, Country" .
```

- Deze LDES bevat 2 elementen: zowel `ex:AddressRecord1-version1` en `ex:AddressRecord1-version2` worden verwezen door `tree:member`. 
- Net als in vorige voorbeeld wijst `ldes:timestampPath` naar de `predicate` in een `member` waar de _timestamp_ te vinden is. Deze keer verwijst die naar `dcterms:created`.  
- `ldes:versionOfPath` verwijst naar de `predicate` binnen de `member` dat het nietversiebeheerde-document aanduidt: `dcterms:isVersionOf`. In beide gevallen in het voorbeeld wordt verwezen naar `ex:AddressRecord1`. Merk op dat `ex:AddressRecord1` niet in de data zit. De data wordt enkel beschikbaar gesteld via versies.
- Dit kan uiteraard gecombineerd worden met paginering en fragmentering.

Ter illustratie, het vorige voorbeeld in json-ld formaat (met context ingebed):
```json
{
  "timestampPath": "created",
  "versionOfPath": "isVersionOf",
  "@id": "http://example.com/ns#C2",
  "@type": "EventStream",
  "@context": {
    "schema": "http://schema.org/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "ldes": "https://w3id.org/ldes#",
    "tree": "https://w3id.org/tree#",
    "dcterms": "http://purl.org/dc/terms/",
    "adms": "http://www.w3.org/ns/adms#",
    "id": {
      "@id": "schema:identifier"
    },
    "created": {
      "@id": "dcterms:created",
      "@type": "xsd:dateTime"
    },
    "isVersionOf": {
      "@id": "dcterms:isVersionOf",
      "@type": "@id"
    },
    "versionOfPath": {
      "@id": "ldes:versionOfPath",
      "@type": "@id"
    },
    "timestampPath": {
      "@id": "ldes:timestampPath",
      "@type": "@id"
    },
    "member": {
      "@id": "tree:member",
      "@container": "@set"
    },
    "versionNotes": {
      "@id": "adms:versionNotes",
      "@type": "xsd:string"
    },
    "title": {
      "@id": "dcterms:title",
      "@type": "xsd:string"
    }
  },
  "member": [
    {
      "@id": "http://example.com/ns#AddressRecord1-version1",
      "created": "2021-01-01T00:00:00Z",
      "versionNotes": "First version of this address",
      "isVersionOf": "http://example.com/ns#AddressRecord1",
      "title": "Streetname X, ZIP Municipality, Country"
    },
    {
      "@id": "http://example.com/ns#AddressRecord1-version2",
      "created": "2021-01-02T00:00:00Z",
      "versionNotes": "Second version of this address",
      "isVersionOf": "http://example.com/ns#AddressRecord1",
      "title": "Streetname X + Y, ZIP Municipality, Country"
    }
  ]
}

```

## Contractspecificaties

Het [IPDC-LPDC implementatiemodel](https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/) beschrijft in detail (zoals kardinaliteiten, codelijsten, datatypes) de gewenste datastructuur.

De huidige versie (2022-06-15) krijgt binnenkort een update. Een preview hiervan is [hier](https://productencatalogus.data.test-vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/ontwerpstandaard/2024-02-29/) te vinden.

Het IPDC-LPDC implementatiemodel beschrijft de datastructuur voor ConceptSnapshots en InstantieSnapshots. Merk op dat deze gelijkaardig, maar niet identiek zijn.

## Voorbeelden + implementatie tips

Dit zijn voorbeelden die het IPDC-LPDC implementatiemodel illusteren met uitvoerbare voorbeelden.

### Uitvoerbare instantiesnapshot-LDES-stub

Een uitvoerbare, **voorbeeld-implementatie van een instantiesnapshot-LDES-stub** is [hier](../tests/instancesnapshot-ldes-stub) te vinden.

Dit is een **Typescript** project dat een **vaste lijst van 3 pagina's** teruggeeft. 

Het bevat ook een endpoint voor de [InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld).

Om het project effectief uit te voeren, is de recentste [LTS-versie van Node JS](https://nodejs.org/en) vereist.

```shell
  npm ci
  npm run start
```

Je kan de pagina's uitlezen door http://localhost/doc/instancesnapshot?pageNumber=0 , 1, 2 uit te voeren.
Dit geeft de data in [json-ld formaat](#json-ld) terug, daarbij verwijzend naar de [InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld).

Pagina's 0, 1, 2 zijn ook [hier](../tests/instancesnapshot-ldes-stub/ldes-pages/page-0.json), [hier](../tests/instancesnapshot-ldes-stub/ldes-pages/page-1.json) en [hier](../tests/instancesnapshot-ldes-stub/ldes-pages/page-2.json) te vinden.

In hoofdstuk [Voorbeeld pagina in detail](#voorbeeld-pagina-in-detail) wordt verder ingegaan op elk element van de data.

### integrerende-gemeente-LDES-reader

Dit project illustreert uitvoerbare commando's voor **uitlezen en interpreteren van een LDES in [json-ld](#json-ld) en [turtle formaat](#turtle)**. 

Het project maakt een connectie met de [instantiesnapshot-LDES-stub](#uitvoerbare-instantiesnapshot-ldes-stub). 

Het project kan makkelijk aangepast worden om naar een andere URL te connecteren, en kan in die vorm dienen als test voor een LDES opgezet door de integrerende gemeente.

Je kan het project [hier](../tests/integrerende-gemeente-ldes-reader) vinden.

Om het project effectief uit te voeren, is de recentste [LTS-versie van Node JS](https://nodejs.org/en) vereist.
```shell
  npm ci
```

Uitlezen van volledige LDES en schrijven naar console-uitvoer als [json-ld formaat](#json-ld).
```shell
  npm run start-export-as-json-ld
```

Uitlezen van volledige LDES, interpreteren en samenvoegen met verwezen [InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld) en resultaat schrijven naar console-uitvoer als [turtle formaat](#turtle).
```shell
  npm run start-export-as-turtle
```

#### JSON-LD en context samenvoegen opmerkingen

De [LDES-reader](#integrerende-gemeente-ldes-reader) kan [json-ld](#json-ld) en [turtle](#turtle) produceren. 

Beide formaten ([json-ld](#json-ld) en [turtle](#turtle)) zijn serialisatie-formaten voor dezelfde data.

Indien de [json-ld](#json-ld) data en de bijhorende [InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld) goed op elkaar afgestemd zijn, dan zal dit een correcte [turtle](#turtle) genereren.

Met 'correct' bedoelen we, één waarin voor elk [json-ld](#json-ld) datum een overeenkomstig attribuut ter interpretatie gevonden wordt in de [InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld).

Indien er in één van de twee een afwijking is, dan zal de turtle ofwel minder triples bevatten, niet goed gevormde IRIs hebben, of mogelijk andere problemen vertonen.

Het voorziene voorbeeld in [instantiesnapshot-LDES-stub](#uitvoerbare-instantiesnapshot-ldes-stub) is conform en met verscheidene voorbeelden bedoeld exhaustief te zijn.

Nazicht van de gegenereerde Turtle door de integrerende gemeente is zeker aan te bevelen.

### Voorbeeld pagina in detail

Hierin zullen we een aantal elementen van de data belichten. 

Uit: [page-0](../tests/instancesnapshot-ldes-stub/ldes-pages/page-0.json).

_Merk op_ dat alle vermelde URL's die de [LDES](#ldes-linked-data-event-stream) vermelden, (andere pagina's (`http://hostname/doc/instancesnapshot?pageNumber=0`), of identificatie van de pagina (`http://hostname/doc/instancesnapshot?pageNumber=0`)), verwijzen naar de **'hostname'**. 

Dit moet de **publiek toegankelijke internet-host zijn die de LDES aanbiedt**. 

Merk op dat deze door de [uitvoerbare instantiesnapshot-LDES-stub voorheen](#uitvoerbare-instantiesnapshot-ldes-stub) vervangen wordt door **'localhost'**.   

![page-0.json.png](img%2Fpage-0.json.png)

1. `"timestampPath": "generatedAtTime" `, `"versionOfPath": "isVersionOf"`: properties met values die aangeven welke properties in de members gebruikt worden voor de [versionering van LDES](#versionering). Zowel `generatedAtTime` en `isVersionOf` zal je terugvinden in elke member.
2. Identificatie van deze pagina van de LDES.
3. Relation wijst naar andere pagina's van LDES. In dit voorbeeld is er een volgende pagina met nummer 1. In [page-1](../tests/instancesnapshot-ldes-stub/ldes-pages/page-1.json) vindt u navigatie terug naar [page-0](../tests/instancesnapshot-ldes-stub/ldes-pages/page-0.json) en verder naar [page-2](../tests/instancesnapshot-ldes-stub/ldes-pages/page-2.json). In [page-2](../tests/instancesnapshot-ldes-stub/ldes-pages/page-2.json) vindt u navigatie terug naar [page-1](../tests/instancesnapshot-ldes-stub/ldes-pages/page-1.json).
4. Verwijst naar de gebruikte [InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld). In dit voorbeeld wordt deze apart hosted. Kan eventueel ook ingesloten meegegeven worden.
5. Identificatie van de LDES pagina, en aangeven dat het een LDES is.
6. Onder member volgt een json array van alle members van deze pagina van de LDES.
7. `"@id": "http://data.lblod.info/id/public-service-snapshot/6e9334cb-272c-443d-8b0a-1b02149a5126"` identificeert hierbij de [instantiesnapshot](#instantiesnapshot). 
Deze [IRI](#iris) voldoet aan formaat 'http://data.lblod.info/id/public-service-snapshot/<genereerde-uuid>', en dient door de integrerende gemeente gegenereerd te worden.
8. `"isVersionOf": "http://data.lblod.info/id/public-service/c0d6bf9a-fcc4-4d46-beb6-3f4d80f03bf3",` identificeert de [instantie](#instantie).
Deze [IRI](#iris) voldoet aan formaat 'http://data.lblod.info/id/public-service/<genereerde-uuid>', en dient door de integrerende gemeente gegenereerd te worden.
9. `"createdBy": "353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"` : `<uuid>` van de integrerende gemeente.
[InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld) definieert een basis url waardoor in [turtle formaat](#turtle) de [iri](#iris) wordt [http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5](http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5). 
Dit is een uitvoerbare URL die wijst in dit voorbeeld naar Gemeente Gent.
Kan ook als absolute URL opgegeven worden.
10. `"aangemaaktOp": "2024-02-14T13:42:12.357Z",` `"bewerktOp": "2024-02-14T13:59:25.236Z",`: geeft het moment dat de [instantie](#instantie) aangemaakt en respectievelijk laatst bewerkt werd. Dit wordt door LPDC at verbatim overgenomen.
11. `"generatedAtTime": "2024-02-18T06:32:10.377Z"`: geeft het moment dat de [instantiesnapshot](#instantiesnapshot) aangemaakt werd. Is een property die door LDES-verwerking wordt geïnterpreteerd.
12. `"titel:"`, `"beschrijving:"`: een voorbeeld van 2 data velden die gelinked zijn vanuit [instantie](#instantie), beide string literals met een taal tag.
13. `"bevoegdeOverheden": ["353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"]`: `<uuid>` van de bevoegde overheid.
[InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld) definieert een basis url waardoor in [turtle formaat](#turtle) de [iri](#iris) wordt [http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5](http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5).
Dit is een uitvoerbare URL die in dit voorbeeld wijst naar Gemeente Gent.
Kan ook als absolute URL opgegeven worden.
Meerdere `bevoegdeOverheden` kunnen opgegeven worden, dus is dit json-type een array.
14. `"geografischToepassingsgebieden": ["http://vocab.belgif.be/auth/refnis2019/44021"]`: de geografische toepassingsgebieden relevant voor deze [instantie](#instantie). 
Een code uit de http://vocab.belgif.be/auth/refnis2019 wordt verwacht.
Meerdere `geografischToepassingsgebieden` kunnen opgegeven worden, dus is dit json-type een array.
15. `"uitvoerendeOverheden": ["353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"]`: `<uuid>` van de uitvoerende overheid.
[InstanceJsonLdContext.jsonld](../tests/instancesnapshot-ldes-stub/ldes-pages/InstanceJsonLdContext.jsonld) definieert een basis url waardoor in [turtle formaat](#turtle) de [iri](#iris) wordt [http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5](http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5).
Dit is een uitvoerbare URL die wijst in dit voorbeeld naar Gemeente Gent.
Kan ook als absolute URL opgegeven worden.
Meerdere `uitvoerendeOverheden` kunnen opgegeven worden, dus is dit json-type een array.
16. Voorbeeld van een tweede, later gegenereerde (`"generatedAtTime": "2024-02-20T07:32:10.377Z"`), [instantie snapshot](#instantiesnapshot)(`"http://data.lblod.info/id/public-service-snapshot/84d1e739-d20c-4986-84d8-331bd58feb09"`) van dezelfde [instantie](#instantie) (`"isVersionOf": "http://data.lblod.info/id/public-service/c0d6bf9a-fcc4-4d46-beb6-3f4d80f03bf3"`). 
Hier werd `titel` en `beschrijving` updatet.
Merk op dat **telkens** de **volledige data van de instantie dient te worden meegegeven** bij elke nieuwe [instantie snapshot](#instantiesnapshot). Een nieuwe [instantie snapshot](#instantiesnapshot) geeft m.a.w. niet enkel de verandering ten opzicht van vorige weer.

Ter illustratie de gegeneerde [turtle](#turtle) voor dit deel van LDES, merk op dat hierin de informatie uit de LDES is _verwijderd_ (behalve `generatedAtTime` en `isVersionOf`).
Dit is de informatie die door LPDC zal verwerkt worden.

```turtle
<http://data.lblod.info/id/public-service-snapshot/6e9334cb-272c-443d-8b0a-1b02149a5126> a <http://purl.org/vocab/cpsv#PublicService>;
    <http://purl.org/dc/terms/isVersionOf> <http://data.lblod.info/id/public-service/c0d6bf9a-fcc4-4d46-beb6-3f4d80f03bf3>;
    <http://purl.org/pav/createdBy> <http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5>;
    <http://purl.org/dc/terms/created> "2024-02-14T13:42:12.357Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://purl.org/dc/terms/modified> "2024-02-14T13:59:25.236Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://www.w3.org/ns/prov#generatedAtTime> "2024-02-18T06:32:10.377Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://purl.org/dc/terms/title> "Minimalistische instantie"@nl-be-x-informal;
    <http://purl.org/dc/terms/description> "<p data-indentation-level=\"0\">Beschrijving van de minimalistische instantie</p>"@nl-be-x-informal;
    <http://purl.org/dc/terms/spatial> <http://vocab.belgif.be/auth/refnis2019/44021>.

<http://data.lblod.info/id/public-service-snapshot/84d1e739-d20c-4986-84d8-331bd58feb09> a <http://purl.org/vocab/cpsv#PublicService>;
    <http://purl.org/dc/terms/isVersionOf> <http://data.lblod.info/id/public-service/c0d6bf9a-fcc4-4d46-beb6-3f4d80f03bf3>;
    <http://purl.org/pav/createdBy> <http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5>;
    <http://purl.org/dc/terms/created> "2024-02-14T13:42:12.357Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://purl.org/dc/terms/modified> "2024-02-15T14:59:30.236Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://www.w3.org/ns/prov#generatedAtTime> "2024-02-20T07:32:10.377Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://purl.org/dc/terms/title> "Minimalistische instantie updatet"@nl-be-x-informal;
    <http://purl.org/dc/terms/description> "<p data-indentation-level=\"0\">Beschrijving van de minimalistische instantie updatet</p>"@nl-be-x-informal;
    <http://purl.org/dc/terms/spatial> <http://vocab.belgif.be/auth/refnis2019/44021>.
```


## Verklarende woordenlijst

Hieronder beschrijven we een aantal termen die een leidraad vormen doorheen het verhaal. Deze termen zijn toepasbaar op LPDC, IPDC, eventueel ook voor de toepassingen van lokale besturen.

#### Concept
Concepten kunnen gezien worden als sjablonen die redacteurs van de Vlaamse overheid klaarzetten voor lokale besturen.
Met die aanzet kunnen de lokale besturen vlot hun eigen dienstverlening (instantie) aanmaken.
Een goed voorbeeld van een concept is het huwelijk.
Hoewel de beschrijving en voorwaarden van een huwelijk grotendeels hetzelfde zijn voor de verschillende gemeentes zijn er mogelijk toch lokale verschillen, zoals de locatie en prijs.

#### ConceptSnapshot
Een gegeventsmomentopname van een concept. Dit wordt gebruikt om de staat van conceptgegevens op een specifiek tijdstip te beschrijven. Een serie van conceptsnapshots beschrijft verschillende versies doorheen de tijd van een concept.
Het bevat een unieke id per opname, een tijdstip van opname, een verwijzing naar de id van het concept, een (kopie van) alle gegevens van het concept op moment van opname, en optioneel een archiveringsstatus (dit om aan te duiden of een concept nog actief is of niet).

#### Instantie
Zijn de werkelijke invulling van een product of dienst.
De bevoegde overheid kan variëren: federaal, Vlaams, provinciaal,… en de dienstverlening kan uitgevoerd worden door nog een andere overheid zoals een lokaal bestuur.
Bevat optioneel een link naar een concept waarop het oorspronkelijk was gebaseerd.

#### InstantieSnapshot
Een gegeventsmomentopname van een instantie. Dit wordt gebruikt om de staat van instantiegegevens op een specifiek tijdstip te beschrijven. Een serie van instantiesnapshots beschrijft verschillende versies doorheen de tijd van een instantie.
Het bevat een unieke id per opname, een tijdstip van opname, een verwijzing naar de id van de instantie, een (kopie van) alle gegevens van de instantie op moment van opname, en optioneel een archiveringsstatus (dit om aan te duiden of de instantie nog actief is of niet).


## Referenties

### Algemeen

- [LPDC](https://lpdc.lokaalbestuur.vlaanderen.be/)
- [IPDC](https://productencatalogus-v3.vlaanderen.be/nl/producten)
- [Hoe aansluiten op IPDC v3](https://vlaamseoverheid.atlassian.net/wiki/external/6317081715/ZGU4MGNlODM2N2U1NDU5MGFlY2NlYzcxYmQyYWUwMTc#Basisbegrippen-IPDC)

### Gebruikte standaarden
- [IPDC - LPDC (Implementatiemodel)](https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/)
- [IPDC - LPDC (Implementatiemodel) - TEST](https://productencatalogus.data.test-vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/ontwerpstandaard/2024-02-29/)
- [URI (Uniform Resource Identifier)](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier)
- [RDF (Resource Description Framework)](https://www.w3.org/TR/rdf11-primer/)
- [OWL (Web Ontology Language)](https://www.w3.org/TR/owl2-overview/)
- [N-TRIPLES](https://www.w3.org/TR/n-triples/)
- [turtle](https://www.w3.org/TR/turtle/)
- [JSON-LD specificatie](https://www.w3.org/TR/json-ld/)
- [JSON-LD (JSON for Linking Data)](https://json-ld.org/)
- [JSON-LD 1.1 Processing Algorithms and API](https://www.w3.org/TR/json-ld11-api/)
- [JSON-LD Playground](https://json-ld.org/playground/)
- [SHACL (Shapes Constraint Language)](https://www.w3.org/TR/shacl)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [LDES (Linked Data Event Streams)](https://semiceu.github.io/LinkedDataEventStreams/)
- [TREE (The TREE hypermedia specification)](https://treecg.github.io/specification/)

### Broncode (open source) / Ondersteunende technologieën

- [LBLOD (Local Decisions as Linked Open Data in Flanders) broncode](https://github.com/lblod/)
- [app-lpdc-digitaal-loket](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development)
- [lpdc-management-service](https://github.com/lblod/lpdc-management-service/tree/development)
- [frontend-lpdc](https://github.com/lblod/frontend-lpdc/tree/development)
- [lpdc-publish-service](https://github.com/lblod/lpdc-publish-service/tree/development)
- [ldes-consumer-service](https://github.com/redpencilio/ldes-consumer-service)
- [TREEcg (TREE community group - Hypermedia controls for publishing collections of entities)](https://github.com/TREEcg), met oa. [Actor Init LDES client (Metadata harvester for a Linked Data Event Stream.)](https://github.com/TREEcg/event-stream-client/tree/main/packages/actor-init-ldes-client)
- [Node JS](https://nodejs.org/en)

