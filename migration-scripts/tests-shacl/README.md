# Introduction

This subproject represents the design process to bring [IPDC - LPDC (implementatiemodel)](https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/) up to date with its current implementation (between ipdc / lpdc). 
Following changes will be made:
  - Classes added
  - Remove unused properties from classes
  - Add properties on classes 
  - Describe any updates to property paths (the predicates used)
  - Code list references + contents
  - Create a more useful [SHACL](https://www.w3.org/TR/shacl/) for concepts, instances
  - Ensure the [JSON-LD](https://json-ld.org/) context reflects all these changes  

The goal is to publish a new version of https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/ontwerpstandaard/2022-06-15 .


# Model changes compared to version 2022-06-15

The shape for 2022-06-15 can be found [here](instances-concepts%2Fshapes%2F2022-06-15-ipdc-lpdc-im-SHACL.ttl.old)

*Notes*: 
- The changes mentioned here are **Work In Progress**, and **subject to change**.
- The changes are described in the form of an updated SHACL shape, when final, they will be documented in [IPDC - LPDC (implementatiemodel)](https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/) as well.

## Updated shapes
- Updated [concept-shape.ttl](instances-concepts%2Fshapes%2Fconcept-shape.ttl).
- Updated [instance-shape.ttl](instances-concepts%2Fshapes%2Finstance-shape.ttl).
- Includes [common-shapes.ttl](instances-concepts%2Fshapes%2Fcommon-shapes.ttl).

## Concept Shape Additions
- `schema:dateModified` existing, add to docu, check
- `schema:dateCreated` existing, add to docu, check
- `schema:productID` existing, add to docu, check
- `dc:isVersionOf` : existing, add to docu, versioning (niet deel van model) (ch 4.1 ldes)
- `prov:generatedAtTime`: existing, add to docu, versioning (niet deel van model) (ch 4.1 ldes)
- `shacl:order`, on all entities where needed, add to docu.

## Concept Shape Removals
- pera:language verwijderen van concept

## Concept Shape Changes
- `lpdcExt:isArchived`: new, to add, add to docu,  is replacement of:  `lpdcExt:snapshot type` (CREATE,UPDATE,DELETE):
- `rdf:type` is ignored
- all properties having `rdf:langString`
  - `shacl:class` => `shacl:datatype`
  - specified 8 allowed languages: `shacl:languageIn ("en" "nl" "fr" "de" "nl-be-x-formal" "nl-be-x-informal" "nl-be-x-generated-formal" "nl-be-x-generated-informal")`;
    Since [SHACL languageIn validation](https://www.w3.org/TR/shacl/#LanguageInConstraintComponent) uses SPARQL langMatches, all the 'nl-' languages can not be fully validated, and should be interpreted as acceptable values
  - language triples should be unique: `shacl:uniqueLang true`;  
- For all code lists (`a skos:Concept`), a list of allowed values is referenced via `rdfs:seeAlso`
- Website shape
  - `schemas:url` specified as `datatype:string`
- On all sub entities that represent a list (procedure, website, rule, etc.), a `shacl:order` is added. This is to ensure an order on these sub entities.
- Legal Resources: Add title, description, separate 'entity', shacl-order

## Instance Shape Additions
- `schema:dateCreated` exists as dcterms:created, should to changed, add to docu, check (instead of http://purl.org/dc/terms/created)
- `schema:dateModified` exists as dcterms:modified, should to changed, check (instead of http://purl.org/dc/terms/modified)
- `dc:isVersionOf` : non existing, add to docu, versioning (niet deel van model) (ch 4.1 ldes)
- `prov:generatedAtTime`: non existing, add to docu, versioning (niet deel van model) (ch 4.1 ldes)
- `shacl:order`, on all entities where needed.
- `<http://purl.org/pav/createdBy>`: non existing, add to docu (points to the bestuurseenheid)

## Instance Shape Changes
- `lpdcExt:isArchived`: new, to add, add to docu,  is replacement of:  `lpdcExt:snapshot type` (CREATE,UPDATE,DELETE):
- `pera:language` : https://raw.githubusercontent.com/Informatievlaanderen/ipdc-lpdc/main/codelijsten/taal.ttl : verwijder lijst -> we gebruiken pera:language lijst pera.ttl (http://publications.europa.eu/resource/authority/language), we ondersteunen hiervan de 4 officiele belgische landstalen (NLD, DEU, ENG, FRA)
- `rdf:type` is ignored
- all properties having `rdf:langString`
  - `shacl:class` => `shacl:datatype`
  - specified 8 allowed languages: `          shacl:languageIn ("en" "nl" "nl-be-x-formal" "nl-be-x-informal")`;
    Since [SHACL languageIn validation](https://www.w3.org/TR/shacl/#LanguageInConstraintComponent) uses SPARQL langMatches, all the 'nl-' languages can not be fully validated, and should be interpreted as acceptable values
  - language triples should be unique: `shacl:uniqueLang true`;
- For all code lists (`a skos:Concept`), a list of allowed values is reference via `rdfs:seeAlso`
- Website shape
  - `schemas:url` specified as `datatype:string`
- On all sub entities that represent a list (procedure, website, rule, etc), a `shacl:order` is added. This is to ensure an order on these sub entities.
- Legal Resources: Add title, description, separate 'entity', shacl-order
- 
## Instance Shape not processed by LPDC
- `addres>administrativeUnitLevel2` : is not processed
- `addres>fullAddress`: is not processed

# Other info

- Referenced schema's or ontologies are found under `schemas-ontologies`
- The (current) remaining tasks in this process are found [here](instances-concepts%2Fquestions.md#todo)
- For the `m8g:PublicOrganisation` references, we expect 'LBLOD URI's . One example is <http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5>, which represents 'Gent'.
  To find all possible, you can query https://data.lblod.info/sparql, using [filter on all bestuurseenheden](https://data.lblod.info/sparql#query=PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0APREFIX%20ns2%3A%09%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fbesluit%23%3E%0APREFIX%20skos%3A%09%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0ASELECT%20%3Fsub%20%3Flabel%20WHERE%20%7B%0A%20%20%3Fsub%20rdf%3Atype%09ns2%3ABestuurseenheid%20.%0A%20%20%3Fsub%20skos%3AprefLabel%20%3Flabel%0A%7D%20%0AORDER%20BY%20%3Flabel&endpoint=%2Fsparql&requestMethod=POST&tabTitle=Query&headers=%7B%7D&contentTypeConstruct=application%2Fn-triples%2C*%2F*%3Bq%3D0.9&contentTypeSelect=application%2Fsparql-results%2Bjson%2C*%2F*%3Bq%3D0.9&outputFormat=table)

# Executing the code

Using [rdf-validate-shacl](https://github.com/zazuko/rdf-validate-shacl), and [RDF-JS](https://rdf.js.org/), we've created some example code in typescript for instance validation, concept validation.

Compile first using `tsc`, run concept examples: `npm run start-concepts`, run instance examples: `npm run start-instances`.
