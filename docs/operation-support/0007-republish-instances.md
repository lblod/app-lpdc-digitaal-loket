# Republish all instances

```
DELETE {
  GRAPH ?bestuurseenheidGraph {
    ?instance <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd> .
  }
}

INSERT {
  GRAPH ?bestuurseenheidGraph {
    ?instance <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/te-herpubliceren> .
  }
}

 WHERE {
  GRAPH ?bestuurseenheidGraph {
    ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
    ?instance <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verzonden> .
    ?instance <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd> .
    ?instance <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger> "false"^^xsd:boolean .
  }

  FILTER(
    STRSTARTS(STR(?bestuurseenheidGraph), "http://mu.semte.ch/graphs/organizations/") &&
    STRENDS(STR(?bestuurseenheidGraph), "/LoketLB-LPDCGebruiker")
  )
}
```

# Republish a single instance

```
    DELETE {
      GRAPH <my-bestuurseenheidGraph> {
        <my-instance-id> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd> .
      }
    }
    INSERT {
      GRAPH <my-bestuurseenheidGraph> {
        <my-instance-id> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/te-herpubliceren> .
      }
    }
     WHERE {
      GRAPH <my-bestuurseenheidGraph> {
        <my-instance-id> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
        <my-instance-id> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verzonden> .
        <my-instance-id> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd> .
        <my-instance-id> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger> "false"^^xsd:boolean .
      }
    }
```