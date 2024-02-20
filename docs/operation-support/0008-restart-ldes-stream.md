# Restart LDES stream

## Test

Query to clear state in database
```shell
DELETE { 
	GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> { 
		<https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state. 
	} 
} 
WHERE { 
	GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> { 
		<https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state. 
	} 
}
```

restart ldes docker container
```shell
docker restart app-lpdc-digitaal-loket-test-lpdc-ldes-consumer-1
```

## PROD

Query to clear state in database
```shell
DELETE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
          <https://ipdc.vlaanderen.be/id/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state.
    }
} WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        <https://ipdc.vlaanderen.be/id/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state.
    }
}
```

restart ldes docker container
```shell
docker restart app-lpdc-digitaal-loket-lpdc-ldes-consumer-1
```
