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

The shape for 2022-0-15 can be found [here](instances-concepts%2Fshapes%2F2022-06-15-ipdc-lpdc-im-SHACL.ttl.old)

*Notes*: 
- The changes mentioned here are **Work In Progress**, and **subject to change**.
- The changes are described in the form of an updated SHACL shape, when final, they will be documented in [IPDC - LPDC (implementatiemodel)](https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/) as well.

## Updated shapes
- Updated [concept-shape.ttl](instances-concepts%2Fshapes%2Fconcept-shape.ttl).
- Updated [instance-shape.ttl](instances-concepts%2Fshapes%2Finstance-shape.ttl).
- Includes [common-shapes.ttl](instances-concepts%2Fshapes%2Fcommon-shapes.ttl).

## Concept Shape Additions
- `schema:dateModified`
- `schema:dateCreated`
- `schema:productID`
- `dc:isVersionOf`
- `prov:generatedAtTime`
- `lpdcExt:isArchived`
- `pera:language`

## Concept Shape Changes
- `closed:true` is set during design phase
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

## Instance Shape Additions
- `schema:dateModified`
- `schema:dateCreated`

## Instance Shape Changes
- `closed:true` is set during design phase
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

# Other info

- Referenced schema's or ontologies are found under `schemas-ontologies`
- The (current) remaining tasks in this process are found [here](instances-concepts%2Fquestions.md#todo)


# Executing the code

Using [rdf-validate-shacl](https://github.com/zazuko/rdf-validate-shacl), and [RDF-JS](https://rdf.js.org/), we've created some example code in typescript for instance validation, concept validation.

Compile first using `tsc`, run concept examples: `npm run start-concepts`, run instance examples: `npm run start-instances`.
