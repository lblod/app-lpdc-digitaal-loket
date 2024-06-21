import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
    cronPattern: '0 55 23 * * *',
    name: 'instanceSnapshotsNotProcessedReport',

    execute: async () => {
        const reportData = {
            title: 'List of instance snapshots not processed',
            description: 'Gives an overview of all the instance snapshots that were not processed, meaning they were read from the LDES, but never processed (failed or successfully)',
            filePrefix: 'instanceSnapshotsNotProcessedReport'
        };

        console.log('Generate instance snapshots not processed report');

        const queryString = `
            select distinct ?snapshotGeneratedAtTime ?ldesGraph ?bestuurseenheidLabel ?classificatieLabel ?snapshotVersionOfInstanceId ?snapshotId ?snapshotTitle ?bestuurseenheidId  {
            graph ?ldesGraph {
                ?snapshotId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot>;
                    <http://www.w3.org/ns/prov#generatedAtTime> ?snapshotGeneratedAtTime;
                    <http://purl.org/dc/terms/isVersionOf> ?snapshotVersionOfInstanceId.
        
                OPTIONAL {
                    ?snapshotId <http://purl.org/pav/createdBy> ?bestuurseenheidId.
                }
        
                OPTIONAL {
                    ?snapshotId <http://purl.org/dc/terms/title> ?snapshotTitle.                    
                }
        
                FILTER NOT EXISTS {
                    ?processedId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> ;
                    <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ?snapshotId.
                }
            }
        
            graph <http://mu.semte.ch/graphs/public> {
                OPTIONAL {
                    ?bestuurseenheidId a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>;
                        <http://www.w3.org/2004/02/skos/core#prefLabel> ?bestuurseenheidLabel;
                        <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatie.
                        ?classificatie <http://www.w3.org/2004/02/skos/core#prefLabel> ?classificatieLabel .
                }
            }
        }
        order by DESC(?snapshotGeneratedAtTime)
        `;

        const queryResponse = await query(queryString);
        const data = queryResponse.results.bindings.map((row) => {
            return {
                snapshotGeneratedAtTime: getSafeValue(row, 'snapshotGeneratedAtTime'),
                ldesGraph: getSafeValue(row, 'ldesGraph'),
                bestuurseenheidLabel: getSafeValue(row, 'bestuurseenheidLabel'),
                classificatieLabel: getSafeValue(row, 'classificatieLabel'),
                snapshotVersionOfInstanceId: getSafeValue(row, 'snapshotVersionOfInstanceId'),
                snapshotId: getSafeValue(row, 'snapshotId'),
                snapshotTitle: getSafeValue(row, 'snapshotTitle'),
                bestuurseenheidId: getSafeValue(row, 'bestuurseenheidId'),
            };
        });

        await generateReportFromData(data, [
            'snapshotGeneratedAtTime',
            'ldesGraph',
            'bestuurseenheidLabel',
            'classificatieLabel',
            'snapshotVersionOfInstanceId',
            'snapshotId',
            'snapshotTitle',
            'bestuurseenheidId',
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


