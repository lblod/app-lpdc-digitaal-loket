# Restart LDES stream

## Test

stop ldes docker container
```shell
docker stop app-lpdc-digitaal-loket-test-ldes-consumer-conceptsnapshot-ipdc-1
```

Query to clear state in database
```shell
DELETE WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        ?s ?p ?o .
    }
}
```

restart ldes docker container
```shell
docker restart app-lpdc-digitaal-loket-test-ldes-consumer-conceptsnapshot-ipdc-1
```

## PROD

stop ldes docker container
```shell
docker stop app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1
```

Query to clear state in database
```shell
DELETE WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
        ?s ?p ?o .
    }
}
```

restart ldes docker container
```shell
docker restart app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1
```
