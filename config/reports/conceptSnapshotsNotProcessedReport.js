import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
    cronPattern: '0 56 23 * * *',
    name: 'conceptSnapshotsNotProcessedReport',

    execute: async () => {
        const reportData = {
            title: 'List of concept snapshots not processed',
            description: 'Gives an overview of all the concept snapshots that were not processed, meaning they were read from the LDES, but never processed (failed or successfully)',
            filePrefix: 'conceptSnapshotsNotProcessedReport'
        };

        console.log('Generate concept snapshots not processed report');

        const queryString = `
            select distinct ?snapshotGeneratedAtTime ?ldesGraph ?snapshotId ?snapshotTitle ?snapshotVersionOfConceptId   {
                graph ?ldesGraph {
                    ?snapshotId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>;
                    <http://www.w3.org/ns/prov#generatedAtTime> ?snapshotGeneratedAtTime;
                    <http://purl.org/dc/terms/isVersionOf> ?snapshotVersionOfConceptId.
            
                    OPTIONAL {
                        ?snapshotId <http://purl.org/dc/terms/title> ?snapshotTitle.
                        FILTER(lang(?snapshotTitle) = "nl")
                    }
            
                    FILTER NOT EXISTS {
                        ?processedId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> ;
                        <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ?snapshotId.
                    }
                }
            }
            order by DESC(?snapshotGeneratedAtTime) ?ldesGraph
        `;

        const queryResponse = await query(queryString);
        const data = queryResponse.results.bindings.map((row) => {
            return {
                snapshotGeneratedAtTime: getSafeValue(row, 'snapshotGeneratedAtTime'),
                ldesGraph: getSafeValue(row, 'ldesGraph'),
                snapshotId: getSafeValue(row, 'snapshotId'),
                snapshotTitle: getSafeValue(row, 'snapshotTitle'),
                snapshotVersionOfConceptId: getSafeValue(row, 'snapshotVersionOfConceptId'),
            };
        });

        await generateReportFromData(data, [
            'snapshotGeneratedAtTime',
            'ldesGraph',
            'snapshotId',
            'snapshotTitle',
            'snapshotVersionOfConceptId',
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


