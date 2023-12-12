# Updates to shacl shape / vocabularium
- Prefixes added
- schemas -> schema ... (https -> http)
- requirement shape : skos:prefLabel -> dc:title
- <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> is not used as a type -> cpsv:PublicService is used instead ...
- procedure > website : added order
- moreInfo > website : added order
- contactpoint > email: pattern
- AddressShape > fullAddress verwijderd
- shacl:path <https://www.w3.org/ns/locn#adminUnitL2> : ? updated to ? shacl:path <http://www.w3.org/ns/locn#adminUnitL2>
- shacl:class <http://fixme.com#URL>; (url): xsd:string ??
- add oss:shapes a rdf:Property;
- added mu-semtech.ttl (containing uuid description; maybe we should elaborate on this a bit more)

# Remarks

#### Language Strings
- when in an example for a rdf:langString, specifying it via:

```
ex:someAddress
a locn:Address ;
adres:land "abc"@en .
```
we always get following error ...
```
Message:
[]
Path:
NamedNode { value: 'https://data.vlaanderen.be/ns/adres#land' }
FocusNode:
NamedNode { value: 'http://example.com/ns#someAddress' }
Severity:
NamedNode { value: 'http://www.w3.org/ns/shacl#Violation' }
SourceConstraintComponent:
NamedNode {
value: 'http://www.w3.org/ns/shacl#ClassConstraintComponent'
}
SourceShape:
BlankNode { value: 'b2' }
```

when data type = xsd:string, then it rightly complains that "dd"@nl is not the correct datatype, but "data" is

======>

shacl:class rdf:langString ===> shacl:datatype rdf:langString
shacl:class xsd:string ===> shacl:datatype xsd:string

... and others

- how to limit on the amount of language strings ?
  A definition like [
  shacl:datatype rdf:langString;
  shacl:description "This property represents the official Name of the Public Service."@nl;
  shacl:maxCount 1;
  shacl:minCount 1;
  shacl:name "name"@nl;
  shacl:path dc:title
  ] does not allow data like:
  ex:an-instance
  a lpdcExt:InstancePublicService ;
  dc:title """title-nl"""@nl ;
  dc:title """title-fr"""@fr ;
  = > which is correctly validated => how to allow multiple language strings ?
  => @see : https://www.w3.org/TR/shacl/#LanguageInConstraintComponent
  and https://www.w3.org/TR/shacl/#UniqueLangConstraintComponent
- languages:
    - concept : same as instantie (en, nl, nl-be-x-formal, nl-be-x-informal), nl-be-x-generated-formal, nl-be-x-generated-informal, de, fr
    - instantie : en, nl, nl-be-x-formal, nl-be-x-informal
- known limitation: langMatches -> formal / informal is not really working ? because of the hierarchical nature of validations ... (and thus a ''known' limitation for all language specified strings) => we should add a note ...  
  ... kan wel opgelost worden met sparql queries
- oss:allowedLanguagesOnInstance
  rdf:first "en" ;
  rdf:rest  [ rdf:first "nl" ;
  rdf:rest  [ rdf:first "nl-be-x-formal" ;
  rdf:rest  [ rdf:first "nl-be-x-informal" ;
  rdf:rest  rdf:nil ] ] ] .  => op termijn zal "nl" verdwijnen uit instanties.
- since the library we are using (https://github.com/zazuko/rdf-validate-shacl) does not support [shacl - sparql based constraints](https://www.w3.org/TR/shacl/#sparql-constraints) ; more complex validations that talk about the actual data for instance if for a certain type (title) a language en is filled in, then also a description with a language en is filled in; is not possible to express...

#### Shacl Closed World Assumption 
- when validating a turtle file, and you for instance have a concept -> you have to provide this data as well in the turtle file (at least the type ...)
  otherwise it can not validate it ... (and gives a class type exception)
- In the LINK editor, you need to add all the ttl files used ... They then appear under External Libraries - some are already added by default. others custom ones you need to add.
  This allows proper navigation in the editor - AND - proper validation in the editor. Don't know how this works in the shacl library. How to add all these shape definition ttl's as well ?
- In the shapes loading in the typescript code, I think you need to add all the ontologies in the form of ttl files which are not standard libraries ...
- When validating chains of classes. e.g.
  <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4>
  a besluit:Bestuurseenheid.
  for which a a besluit:Bestuurseenheid. is defined to be a subclass of rdfs:subClassOf <http://data.europa.eu/m8g/PublicOrganisation> . (in m8g file)., and specified in the shacl shape
  ; we need ... only ... to include the besluit.ttl in the shapes AND merge all shapes also in the data (for this validator?)
  (because internally in the code, strangely the class validation logic happens on the context.$data graph instead of the context.$shapes graph) - which seems like a bug ?  Or a lack of understanding from our part.
- split up shapes into concept-shape.ttl, instance-shape.ttl and common-shapes.ttl  + prefixed the specific ones with Concept / Instance xxx Shape

#### Code Lists
- For the _fixed_ code lists, we chose to not have an explicit validation which are valid ones. We reference the possible values via a rdfs:seeAlso predicate, with a link to the possible values 
  example: rdfs:seeAlso  "vocabulary values found at: https://raw.githubusercontent.com/Informatievlaanderen/ipdc-lpdc/main/codelijsten/bevoegd-bestuursniveau.ttl";
- code lijsten voor bestuurseenheid voorzien? --> instructie geven : welke lijst for this?
- code lijsten voor spatial voorzien ? --> instructie geven : welke lijst for this?
- code lijsten voor andere: verwijzen vanuit de shacl + mee in validatie context nemen -> geeft netjes een fout indien er niet aan voldoet. -> instructie geven waar codelijst te vinden via rdfs:seeAlso

#### Fields that are sent from LPDC -> IPDC that are not in vocabularium, nor shacl shape; and should be added?
- ADDED - but using http://schema.org/dateCreated (to make it in sync with concepts) - #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://purl.org/dc/terms/created> "2023-11-30T12:25:18.623Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
- ADDED - but using <http://schema.org/dateModified> (to make it in sync with concepts) - (#<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://purl.org/dc/terms/modified> "2023-11-30T12:25:55.789Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
- ADDED - #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://purl.org/pav/createdBy> <http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589> .
- ADDED - #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://mu.semte.ch/vocabularies/core/uuid> "4102816b-9cee-4698-8b7d-4bcb60f2dba9" .


#### Fields that are sent from LPDC -> IPDC that are not in vocabularium, nor shacl shape; but should not be added ? 
- #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/50fd7f03-276f-403e-ad39-152dba4e39be> .
- #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/9bd8d86d-bb10-4456-a84e-91e9507c374c> .
- #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/YourEuropeVerplicht> .
- #<http://data.lblod.info/id/public-service/45769c3c-0fa0-476e-b90e-0d5f1f49355a> <http://schema.org/productID> "1502" .
- 
#### json ld parsing of concepts
- included in the concept-from-ldes-stream examples, the @context tag, containing the full context document (ConceptJsonLdContext.json)

#### Concept fields that are in data, but are missing
- ADDED - <http://purl.org/dc/terms/isVersionOf> op het implementatie model ; en ook op shacl validatie 
- ADDED - <http://schema.org/dateCreated> op het implementatie model ; en ook op shacl validatie
- ADDED - <http://schema.org/dateModified> op het implementatie model ; en ook op shacl validatie
- ADDED - <http://schema.org/productID> op het implementatie model ; en ook op shacl validatie
- ADDED - <http://www.w3.org/ns/prov#generatedAtTime> op het implementatie model ; en ook op shacl validatie
- ADDED - https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> to indicate if the concept was archived.
- REMOVED<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType> op vocabularium, op het implementatie model ; en ook op shacl validatie; 
 <https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/Create> en andere ? geen code lijst gedefinieerd ?
 => of geen lijst toevoegen, vervangen door archived vlag ... (create / update : impliciet, archived kan aan en af gezet worden).
- pera:language - <https://publications.europa.eu/resource/authority/language> op het implementatie model ? en ook op shacl validatie ; bij instantie wordt er dc:linguisticSystem gebruikt ?  
- <http://publications.europa.eu/resource/authority/language/ENG> de vermelde waarden bestaan als concept in codelijst [20230627161047-taal-codelist.ttl]; wordt niet naar verwezen vanuit implementatie model documentatie
  ==> talen functioneel qua type: ok; maar moet dit wel op een concept staan ?
  ==> talen worden nu niet doorgestuurd naar IPDC
 => http://publications.europa.eu/resource/authority/language ipv https://publications.europa.eu/resource/authority/language
 instance shape:
-  [
   shacl:class dc:LinguisticSystem;
   shacl:description "This property represents the language(s) in which the Public Service is available. This could be one language or multiple languages, for instance in countries with more than one official language. The possible values for this property are described in a controlled vocabulary. The recommended controlled vocabularies are listed in section 4."@nl;
   shacl:name "language"@nl;
   shacl:path pera:language
   ], => skos:Concept
- 
- NIET NODIG - <http://schema.org/identifier> op het implementatie model ; en ook op shacl validatie


#### Incorrect Concept Fields ?
- <http://data.europa.eu/eli/ontology/#LegalResource> type is incorrect =>  should be <http://data.europa.eu/eli/ontology#LegalResource> ? is an error in jsonld context file
  <https://ipdc.be/regelgeving> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/eli/ontology/#LegalResource> .
- What is required in a Website ? is a description required if a title is also present ? e.g. in concept 2 : <http://mu.semte.ch/blank#741bd782-900e-41fa-9ceb-dbaa8b7e457b> does not have any description ? ==> According to the implementatie model doc, the description is optional ...
  => updated for concept shape and instantie shape as well 


# TODO
- the explanations in the shacl are sometimes in english, sometimes in nl; but the language string is always nl
- keywords: moeten we de talen beperken ? nl / en ? 
- verify all kardinaliteiten ... 
- publicationMedium: also add RechtenVerkenner ? / and others ? currently only YourEurope is in 'official code list'
- how to do / document these fields ?
- locn:adminUnitL2 : no example in instance-published.ttl
- eli:LegalResource 1/ our publish code does not add a type of eli:LegalResource when publishing instantie to ipdc (or we don't inject it into our concept / instantie) 
  eli:LegalResource 2/ our publish code does not add the order of eli:LegalResource when publishing instantie to ipdc (or we don't inject it into our concept / instantie)
  eli:LegalResource : should we add a title / description as well ? LPDC-781 , LPDC-786, 
- hasRequirement: een of meerdere ?  want als slechts een, dan mag ook order weg ...
- instantieTag wordt niet gebruikt (er zijn gedefinieerde waarden in code lijst ) + lpdc stuurt concept tag op in de plaats
- Fix this non meaningful validation error by reintroducing a list of all languages (then at least it prints the list in the message)?
- maybe ?? split shapes into cardinaliteiten en structure/types : so we can use structure in domain saving, and cardinalities in publish (on top of extra publish validation e.g. in english: title / description)
- maybe create an official shacl shape for the form structure + expand with our own shacl semantic form shape stuff. Normally it should be possible to automatically merge it by loading both parts and then getting an official form tree.
  it would maybe then also be possible to in a strategy kind of mode, to load other components for each of the leaves ... 
  is it possible to seperate the 1/ form structure 2/ the data structure + validation rules about it 3/ the rendering of the components (e.g. compare components or left nederlands, right engels + other labels)

# DONE
- should we restrict all the concept types ? and not just be a concept ? but be one of the code lists we have -> and restrict it to that type ? Otherwise, how will we restrict the values ? I don't think that code lists are enough?
  => just reference a code list in rdfs:seeAlso
- ??           shacl:class dc:LinguisticSystem;
  shacl:description "This property represents the language(s) in which the Public Service is available. This could be one language or multiple languages, for instance in countries with more than one official language. The possible values for this property are described in a controlled vocabulary. The recommended controlled vocabularies are listed in section 4."@nl;
  shacl:name "language"@nl;
  shacl:path pera:language
  why not just use one of the pera.ttl file?
  => do not use dc:LinguisticSystem, use pera:language
- we should add all shacl:description for each shacl property we restrict ...  (see warnings in the file) => DONE
- pera:language ontbreekt bij concept ? = DONE
- question: should conceptTag be present on an instance ? or should it be instance tag => INSTANCE TAG
- dc:type ontbreekt bij concept ? = DONE 
- concept: publicationMedium ontbreekt? = DONE
- instance > follows > lpdcExt:hasWebsite vs lpdcExt:hasWebsites ? De shape verwacht lpdcExt:hasWebsite, maar de implementatie die we naar ipdc sturen is lpdcExt:hasWebsites; we are not using a context object when generating the json-ld; so this seems incorrect ...

