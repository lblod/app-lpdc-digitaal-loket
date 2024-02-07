# Fully reload ipdc ldes stream, the concept data, and instance review statuses

**A word of caution**
Manual process that cannot be done while users are working on the system. We need to provide a maintenance page for this ...

First delete all the concept data from the public graph
```
DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>.
        ?s ?p ?o.
    }
};

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <http://purl.org/vocab/cpsv#Rule>.
        ?s ?p ?o.
    }
};

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <http://schema.org/WebSite>.
        ?s ?p ?o.
    }
};

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <http://data.europa.eu/m8g/Requirement>.
        ?s ?p ?o.
    }
};

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <http://data.europa.eu/m8g/Cost>.
        ?s ?p ?o.
    }
};

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <http://data.europa.eu/m8g/Evidence>.
        ?s ?p ?o.
    }
};

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>.
        ?s ?p ?o.
    }
};
```

Then delete all the data from the ipdc ldes consumer graph:
```
DELETE WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
        ?s ?p ?o
    }
}
```

Wait till reading of ldes stream from ipdc is fully processed again (verify lpdc-management service log and lpdc-ldes consumer logs).

Then run script to delete all instance review statuses from database
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

   FILTER (?instantieConceptSnapshot != ?laatsteFunctioneelGewijzigdeConceptSnapshot)
 
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

   FILTER (?instantieConceptSnapshot != ?laatsteFunctioneelGewijzigdeConceptSnapshot)
}

```