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
    ?instance a <http://purl.org/vocab/cpsv#PublicService> .
    ?instance <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verstuurd> .
    ?instance <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd> .
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
        <my-instance-id> a <http://purl.org/vocab/cpsv#PublicService> .
        <my-instance-id> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verstuurd> .
        <my-instance-id> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd> .
      }
    }
```