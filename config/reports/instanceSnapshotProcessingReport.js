    const query = `
    select distinct ?dateProcessed ?ldesGraph ?bestuurseenheidLabel ?classificatieLabel ?snapshotVersionOfInstanceId ?snapshotId ?snapshotTitle ?processedId ?processedStatus ?processedError ?snapshotGeneratedAtTime ?bestuurseenheidId ?instanceTitle {
    graph ?ldesGraph {
        ?processedId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> ;
            <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ?snapshotId;
            <http://schema.org/dateCreated> ?dateProcessed;
            <http://schema.org/status> ?processedStatus.
        ?snapshotId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot>;
            <http://www.w3.org/ns/prov#generatedAtTime> ?snapshotGeneratedAtTime;
            <http://purl.org/dc/terms/isVersionOf> ?snapshotVersionOfInstanceId;
            <http://purl.org/pav/createdBy> ?bestuurseenheidId.

        OPTIONAL {
            ?snapshotId <http://purl.org/dc/terms/title> ?snapshotTitle.
        }

        OPTIONAL {
            ?processedId <http://schema.org/error> ?processedError.
        }
    }
    graph ?instanceGraph {
        OPTIONAL {
            ?snapshotVersionOfInstanceId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> ;
                <http://purl.org/dc/terms/title> ?instanceTitle.
        }
    }
    graph <http://mu.semte.ch/graphs/public> {
        ?bestuurseenheidId a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>;
            <http://www.w3.org/2004/02/skos/core#prefLabel> ?bestuurseenheidLabel;
            <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatie.
        ?classificatie <http://www.w3.org/2004/02/skos/core#prefLabel> ?classificatieLabel .
    }
}
order by DESC(?dateProcessed) ?ldesGraph ?bestuurseenheidLabel ?classificatieLabel ?snapshotVersionOfInstanceId
`;
