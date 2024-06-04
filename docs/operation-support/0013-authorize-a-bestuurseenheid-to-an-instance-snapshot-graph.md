# Context

- @see [Integrerende gemeentes](../integrerende-gemeentes.md)
- `lpdc-management` runs an INSTANCE_SNAPSHOT_PROCESSING cronjob that reads all `<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot>` from the database, located in a (sub)graph of: `<http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/some-sub-graph>`.
- For each integrating partner a new `<http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/some-sub-graph>` will be set up.
- Each `<http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/some-sub-graph>` can contain `<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot>`s from multiple bestuurseenheden, identified by `<http://purl.org/pav/createdBy>`.
- Each integrating partner needs to be authorized. We only allow in each configured `<http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/some-sub-graph>` one or more allowed bestuurseenheden. 

# How to authorize a bestuurseenheid to an instance snapshot graph

Add a migration script similar to:

```sparql
INSERT DATA {
    GRAPH <http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/authorization> {
        <http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5> <http://data.lblod.info/vocabularies/lpdc/canPublishInstancesToGraph> <http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/gent>.
    }
}
```

which details the bestuurseenheid (`<http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5>`), and the graph `<http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/gent>` to which the ldes consumer is writing to.


