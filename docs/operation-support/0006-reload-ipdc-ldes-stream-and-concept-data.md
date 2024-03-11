# Fully reload ipdc ldes stream and concept data

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

DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?p ?o.
    }
}
WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a <http://data.europa.eu/eli/ontology#LegalResource>.
        ?s ?p ?o.
    }
};
```

Then delete all the data from the ipdc ldes consumer graph:
```
DELETE WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        ?s ?p ?o
    }
}
```

Wait till reading of ldes stream from ipdc is fully processed again (verify lpdc-management service log and lpdc-ldes consumer logs).

