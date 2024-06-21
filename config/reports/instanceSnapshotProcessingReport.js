import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
    cronPattern: '0 50 23 * * *',
    name: 'instanceSnapshotProcessingReport',

    execute: async () => {
        const reportData = {
            title: 'List of instance snapshots processed',
            description: 'The processing data of all the instance snapshots read by an LDES',
            filePrefix: 'instanceSnapshotProcessingReport'
        };

        console.log('Generate instance snapshot processing report');

        const queryString = `
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

        const queryResponse = await query(queryString);
        const data = queryResponse.results.bindings.map((row) => {
            return {
                dateProcessed: getSafeValue(row, 'dateProcessed'),
                ldesGraph: getSafeValue(row, 'ldesGraph'),
                bestuurseenheidLabel: getSafeValue(row, 'bestuurseenheidLabel'),
                classificatieLabel: getSafeValue(row, 'classificatieLabel'),
                snapshotVersionOfInstanceId: getSafeValue(row, 'snapshotVersionOfInstanceId'),
                snapshotId: getSafeValue(row, 'snapshotId'),
                snapshotTitle: getSafeValue(row, 'snapshotTitle'),
                processedId: getSafeValue(row, 'processedId'),
                processedStatus: getSafeValue(row, 'processedStatus'),
                processedError: getSafeValue(row, 'processedError'),
                snapshotGeneratedAtTime: getSafeValue(row, 'snapshotGeneratedAtTime'),
                bestuurseenheidId: getSafeValue(row, 'bestuurseenheidId'),
                instanceTitle: getSafeValue(row, 'instanceTitle'),
            };
        });

        await generateReportFromData(data, [
            'dateProcessed',
            'ldesGraph',
            'bestuurseenheidLabel',
            'classificatieLabel',
            'snapshotVersionOfInstanceId',
            'snapshotId',
            'snapshotTitle',
            'processedId',
            'processedStatus',
            'processedError',
            'snapshotGeneratedAtTime',
            'bestuurseenheidId',
            'instanceTitle',
        ], reportData);
    }

}

function getSafeValue(entry, property){
    return entry[property] ? wrapInQuote(entry[property].value) : null;
}

// Some values might contain commas; wrapping them in escape quotes doesn't disrupt the columns.
function wrapInQuote(value) {
    return `\"${value}\"`;
}


