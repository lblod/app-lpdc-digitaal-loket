# Reset snapshot processing

## InstanceSnapshots of Gent

Remove SnapshotProcessed markers of failed processed markers to retry processing
```
DELETE WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/gent> {
        ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> .
        ?s <http://schema.org/status> "failed" .
        ?s ?p ?o .
    }
}
```

## ConceptSnapshots

Remove SnapshotProcessed markers of failed processed markers to retry processing
```
DELETE WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> .
        ?s <http://schema.org/status> "failed" .
        ?s ?p ?o .
    }
}
```

