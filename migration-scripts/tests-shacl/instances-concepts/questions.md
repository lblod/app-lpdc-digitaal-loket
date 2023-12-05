- REMARK: prefix: @prefix oss: <https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/ontwerpstandaard/2022-06-15#> .
- REMARK: prefix: @prefix locn: <http://www.w3.org/ns/locn#> .
- TODO: shacl:path <https://www.w3.org/ns/locn#adminUnitL2> : ? should this not be ? shacl:path <http://www.w3.org/ns/locn#adminUnitL2>
- TODO: why shacl:closed false everywhere ? it allows any other field.
- REMARK: prefix: @prefix adres: <https://data.vlaanderen.be/ns/adres#> .
- REMARK: when in an example for a rdf:langString, specifying it via:

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

- REMARK: prefix: @prefix lpdcExt:  <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#> .
- REMARK: prefix: @prefix cpsv:	<http://purl.org/vocab/cpsv#> .
- REMARK: prefix: @prefix m8g:	<http://data.europa.eu/m8g/> .
- TODO: shacl:class <http://fixme.com#URL>; ???  => (url): xsd:string ??
- REMARK: prefix: @prefix pera: <http://publications.europa.eu/resource/authority/> .
- REMARK: how to limit on the amount of language strings ?
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
- and https://www.w3.org/TR/shacl/#UniqueLangConstraintComponent
- REMARK: when validating a turtle file, and you for instance have a concept -> you have to provide this data as well in the turtle file (at least the type ...)
 otherwise it can not validate it ... (and gives a class type exception)
- REMARK: In the LINK editor, you need to add all the ttl files used ... They then appear under External Libraries - some are already added by default. others custom ones you need to add.
  This allows proper navigation in the editor - AND - proper validation in the editor. Don't know how this works in the shacl library. How to add all these shape definition ttl's as well ?
- REMARK: In the shapes loading in the typescript code, I think you need to add all the ontologies in the form of ttl files which are not standard libraries ...
- REMARK: ask Dieter ipdc for the ontology of ipdc / lpdc contract (turtle representation https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/)
- REMARK: When validating chains of classes. e.g. 
 <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4>
  a besluit:Bestuurseenheid. 
  for which a a besluit:Bestuurseenheid. is defined to be a subclass of rdfs:subClassOf <http://data.europa.eu/m8g/PublicOrganisation> . (in m8g file)., and specified in the shacl shape
  ; we need ... only ... to include the besluit.ttl in the shapes AND merge all shapes also in the data (for this validator?)
  (because internally in the code, strangely the class validation logic happens on the context.$data graph instead of the context.$shapes graph) - which seems like a bug ?  Or a lack of understanding from our part.
- TODO: augment ex:a-full-valid-instance to have multiple languages for each
- TODO: the explanations in the shacl are sometimes in english, sometimes in nl; but the language string is always nl
- REMARK: should we restrict all the concept types ? and not just be a concept ? but be one of the code lists we have -> and restrict it to that type ? Otherwise, how will we restrict the values ? I don't think that code lists are enough?
- TODO: we should add all shacl:description for each shacl property we restrict ...  (see warnings in the file)
- REMARK: concept tag has no restrictions ... ? should we define a type for this?
- ??           shacl:class dc:LinguisticSystem;
          shacl:description "This property represents the language(s) in which the Public Service is available. This could be one language or multiple languages, for instance in countries with more than one official language. The possible values for this property are described in a controlled vocabulary. The recommended controlled vocabularies are listed in section 4."@nl;
          shacl:name "language"@nl;
          shacl:path pera:language
 why not just use one of the pera.ttl file? 
- ontbreekt [
  shacl:class skos:Concept;
  shacl:description "De tags betreffen informatieve aanduidingen van de publieke dienstverlening."@nl;
  shacl:name "conceptTag"@nl;
  shacl:path lpdcExt:conceptTag
  ], 
  niet bij Instance shape?
- TODO: pera:language ontbreekt bij concept ? 
- TODO: dc:type ontbreekt bij concept ? 
- TODO: concept: publicationMedium ontbreekt?
- REMARK: languages:
    - concept : same as instantie (en, nl, nl-be-x-formal, nl-be-x-informal), nl-be-x-generated-formal, nl-be-x-generated-informal, de, fr
    - instantie : en, nl, nl-be-x-formal, nl-be-x-informal
- <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> is not used as a type -> cpsv:PublicService is used instead ... 
- REMARK: currently, for cost, there is no closed = true present. so we don't validate if any other fields are present ... maybe that is ok ? 
- REMARK: known limitation: langMatches -> formal / informal is not really working ? because of the hierarchical nature of validations ... (and thus a ''known' limitation for all language specified strings) => we should add a note ...  
  ... kan wel opgelost worden met sparql queries
- REMARK: oss:allowedLanguagesOnInstance
  rdf:first "en" ;
  rdf:rest  [ rdf:first "nl" ;
  rdf:rest  [ rdf:first "nl-be-x-formal" ;
  rdf:rest  [ rdf:first "nl-be-x-informal" ;
  rdf:rest  rdf:nil ] ] ] .  => op termijn zal "nl" verdwijnen uit instanties.
- REMARK: known limitation:  the order type has an order ; not easy to deeply validate that on each cost, the orders are unique
  ... kan wel opgelost worden met sparql queries
- REMARK: code lijsten voor bestuurseenheid voorzien? --> instructie geven : welke lijst?
- REMARK: code lijsten voor spatial voorzien ? --> instructie geven : welke lijst ? 
- REMARK: code lijsten voor andere: verwijzen vanuit de shacl + mee in validatie context nemen -> geeft netjes een fout indien er niet aan voldoet. -> instructie geven waar codelijst te vinden via rdfs:seeAlso
- REMARK: schemas -> schema ... (https -> http) 
- TODO: keywords: moeten we de talen beperken ? nl / en ? 
- TODO: verify all kardinaliteiten ... 
- TODO: question: should conceptTag be present on an instance ?
- TODO: publicationMedium: also add RechtenVerkenner ? / and others ? currently only YourEurope is in 'official code list'
- TODO: add a concept.ttl example and validate
- REMARK: since the library we are using (https://github.com/zazuko/rdf-validate-shacl) does not support [shacl - sparql based constraints](https://www.w3.org/TR/shacl/#sparql-constraints) ; more complex validations that talk about the actual data for instance if for a certain type (title) a language en is filled in, then also a description with a language en is filled in; is not possible to express...
- TODO: how to do / document these fields ?
- REMARK: procedure > website : added order
- REMARK: contactpoint > email: pattern
- TODO: contactpoint > url: ipv literal (xsd:string) -> [IRI](https://www.w3.org/TR/shacl/#NodeKindConstraintComponent) _verwijst code wijziging bij lpdc en ipdc
- TODO: locn:adminUnitL2 : no example in instance-published.ttl
- REMARK: AddressShape ? country required?              shacl:minCount 1;
- REMARK: AddressShape > fullAddress verwijderd
- REMARK: Adress : gemeente, straatnaam, land : we beperken nu tot en / nl als taal
- REMARK: Address > startnaam: min count = 1 + taal nl / en
- TODO: eli:LegalResource 1/ our publish code does not add a type of eli:LegalResource when publishing instantie to ipdc (or we don't inject it into our concept / instantie) 
- TODO: eli:LegalResource 2/ our publish code does not add the order of eli:LegalResource when publishing instantie to ipdc (or we don't inject it into our concept / instantie)
- TODO: eli:LegalResource : should we add a title / descrption as well ? LPDC-781 , LPDC-786, 
- REMARK: added <https://ipdc.be/regelgeving> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/eli/ontology#LegalResource> .
  <https://ipdc.be/regelgeving> <http://www.w3.org/ns/shacl#order> "0"^^<http://www.w3.org/2001/XMLSchema#integer> . in output ... 
- REMARK: requirement shape : skos:prefLabel -> dc:title 
- TODO: hasRequirement: een of meerdere ?  want als slechts een, dan mag ook order weg ... 

