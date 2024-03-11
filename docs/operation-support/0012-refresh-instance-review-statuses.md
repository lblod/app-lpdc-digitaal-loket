# Scripts to refresh the instance review statuses.

You might need to run this after you [reloaded the entire concept snapshot ldes stream](0006-reload-ipdc-ldes-stream-and-concept-data.md) and the implementation of conceptsnapshot>isfunctionallychanged was updated significantly.

It consists of three scripts to run.

First run script to delete all instance review statuses from database

```
DELETE {
    GRAPH ?g {
        ?s <http://mu.semte.ch/vocabularies/ext/reviewStatus> ?o .
    }
} WHERE {
    GRAPH ?g {
        ?s <http://mu.semte.ch/vocabularies/ext/reviewStatus> ?o
    }
}
```

Then run script to set the instance review statuses correct for non archived concepts
```
PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
PREFIX adms: <http://www.w3.org/ns/adms#>
PREFIX prov: <http://www.w3.org/ns/prov#>

INSERT {
    GRAPH ?bestuurseenheidsGraph {
       ?instantie ext:reviewStatus <http://lblod.data.gift/concepts/review-status/concept-gewijzigd>
    }
}
WHERE {
    GRAPH ?bestuurseenheidsGraph {
      ?instantie a cpsv:PublicService .
      ?instantie ext:hasVersionedSource ?instantieConceptSnapshot .
      ?instantie dcterms:source ?concept .
      FILTER NOT EXISTS {
          ?instantie ext:reviewStatus ?reviewStatus .
      }
    }
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?concept lpdcExt:hasLatestFunctionalChange ?laatsteFunctioneelGewijzigdeConceptSnapshot .
        FILTER NOT EXISTS {
            ?concept adms:status ?conceptStatus .
        }
    }
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        ?instantieConceptSnapshot prov:generatedAtTime ?instantieConceptSnapshotGeneratieTijdstip .
        ?laatsteFunctioneelGewijzigdeConceptSnapshot prov:generatedAtTime ?laatsteFunctioneelGewijzigdeConceptSnapshotGeneratieTijdstip .
    }

    FILTER (?laatsteFunctioneelGewijzigdeConceptSnapshotGeneratieTijdstip > ?instantieConceptSnapshotGeneratieTijdstip)
}

```

Lastly, run script to set the instance review statuses correct for archived concepts:
```
PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
PREFIX adms: <http://www.w3.org/ns/adms#>
PREFIX prov: <http://www.w3.org/ns/prov#>

INSERT {
    GRAPH ?bestuurseenheidsGraph {
       ?instantie ext:reviewStatus <http://lblod.data.gift/concepts/review-status/concept-gearchiveerd>
    }
}
WHERE {
    GRAPH ?bestuurseenheidsGraph {
      ?instantie a cpsv:PublicService .
      ?instantie ext:hasVersionedSource ?instantieConceptSnapshot .
      ?instantie dcterms:source ?concept .
      FILTER NOT EXISTS {
          ?instantie ext:reviewStatus ?reviewStatus .
      }
    }
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?concept lpdcExt:hasLatestFunctionalChange ?laatsteFunctioneelGewijzigdeConceptSnapshot .
        FILTER EXISTS {
            ?concept adms:status ?conceptStatus .
        }
    }
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        ?instantieConceptSnapshot prov:generatedAtTime ?instantieConceptSnapshotGeneratieTijdstip .
        ?laatsteFunctioneelGewijzigdeConceptSnapshot prov:generatedAtTime ?laatsteFunctioneelGewijzigdeConceptSnapshotGeneratieTijdstip .
    }

    FILTER (?laatsteFunctioneelGewijzigdeConceptSnapshotGeneratieTijdstip > ?instantieConceptSnapshotGeneratieTijdstip)
}

```