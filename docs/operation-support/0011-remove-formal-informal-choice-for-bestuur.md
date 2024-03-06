# Remove Formal Informal choice for bestuur from database directly.

In some cases, a member of a bestuur has chosen the incorrect form (formal - informal). They request a reset.

How?
- Find the UUID of the bestuur
- Query in the production database 
```sparql
PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX schema: <http://schema.org/>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT ?formalInformalChoiceId ?uuid ?dateCreated ?chosenForm ?bestuurseenheidId WHERE {
    GRAPH <http://mu.semte.ch/graphs/organizations/<UUID GOES HERE>/LoketLB-LPDCGebruiker> {
        ?formalInformalChoiceId a lpdcExt:FormalInformalChoice ;
            mu:uuid ?uuid ;
            schema:dateCreated ?dateCreated ;
            lpdcExt:chosenForm ?chosenForm ;
            dct:relation ?bestuurseenheidId .
    }
} ORDER BY ASC(?dateCreated) LIMIT 1

```
- Query to remove the choice for that bestuur:
```sparql
PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
DELETE {
    GRAPH <http://mu.semte.ch/graphs/organizations/<UUID GOES HERE>/LoketLB-LPDCGebruiker> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/organizations/<UUID GOES HERE>/LoketLB-LPDCGebruiker> {
        ?s a lpdcExt:FormalInformalChoice.
        ?s ?p ?o.
}
}
```