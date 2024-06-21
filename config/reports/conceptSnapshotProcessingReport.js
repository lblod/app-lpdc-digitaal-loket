import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
    cronPattern: '0 51 23 * * *',
    name: 'conceptSnapshotProcessingReport',

    execute: async () => {
        const reportData = {
            title: 'List of concept snapshots processed',
            description: 'The processing data of all the concept snapshots read by an LDES',
            filePrefix: 'conceptSnapshotProcessingReport'
        };

        console.log('Generate concept snapshot processing report');

        const queryString = `
            select distinct ?dateProcessed ?ldesGraph ?snapshotVersionOfConceptId ?snapshotId ?snapshotTitle ?processedId ?processedStatus ?processedError ?snapshotGeneratedAtTime {
                graph ?ldesGraph {
                    ?processedId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> ;
                        <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ?snapshotId;
                        <http://schema.org/dateCreated> ?dateProcessed;
                        <http://schema.org/status> ?processedStatus.
                    ?snapshotId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>;
                        <http://www.w3.org/ns/prov#generatedAtTime> ?snapshotGeneratedAtTime;
                        <http://purl.org/dc/terms/isVersionOf> ?snapshotVersionOfConceptId.
            
                    OPTIONAL {
                        ?snapshotId <http://purl.org/dc/terms/title> ?snapshotTitle.
                        FILTER(lang(?snapshotTitle) = "nl")
                    }
            
                    OPTIONAL {
                        ?processedId <http://schema.org/error> ?processedError.
                    }
                }
            }
            order by DESC(?dateProcessed)
        `;

        const queryResponse = await query(queryString);
        const data = queryResponse.results.bindings.map((row) => {
            return {
                dateProcessed: getSafeValue(row, 'dateProcessed'),
                ldesGraph: getSafeValue(row, 'ldesGraph'),
                snapshotVersionOfConceptId: getSafeValue(row, 'snapshotVersionOfConceptId'),
                snapshotId: getSafeValue(row, 'snapshotId'),
                snapshotTitle: getSafeValue(row, 'snapshotTitle'),
                processedId: getSafeValue(row, 'processedId'),
                processedStatus: getSafeValue(row, 'processedStatus'),
                processedError: getSafeValue(row, 'processedError'),
                snapshotGeneratedAtTime: getSafeValue(row, 'snapshotGeneratedAtTime'),
            };
        });

        await generateReportFromData(data, [
            'dateProcessed',
            'ldesGraph',
            'snapshotVersionOfConceptId',
            'snapshotId',
            'snapshotTitle',
            'processedId',
            'processedStatus',
            'processedError',
            'snapshotGeneratedAtTime',
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


