import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
    cronPattern: '*/5 * * * *',
    name: 'feedbackReport',

    execute: async () => {
        const reportData = {
            title: 'Overview feedback',
            description: 'Overview of feedback ingested from ipdc',
            filePrefix: 'feedbackReport'
        };

        console.log('Generate feedback report');

        const queryString = `
            PREFIX schema2: <https://schema.org/>
            PREFIX adms2: <https://www.w3.org/ns/adms#>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>

            SELECT DISTINCT ?feedbackUri ?feedbackText ?feedbackStatus ?feedbackStatusIPDC ?feedbackProcessingStatus ?bestuurseenheidUri ?bestuurseenheidName ?instanceUri ?instanceName ?dateCreated ?datePublished {
                GRAPH ?orgGraph {
                    ?feedbackUri a schema2:Conversation ;
                        adms2:status ?feedbackStatusIPDCConcept;
                        lpdcExt:receiverBestuurseenheid ?bestuurseenheidUri;
                        skos:primarySubject ?instanceUri;
                        schema2:dateCreated ?dateCreated.
                     
                    ?feedbackUri schema2:question ?question.   
                    ?question schema2:question ?feedbackText.
                     
                    OPTIONAL {
                        ?instanceUri dct:title ?instanceName.
                    }

                    OPTIONAL {
                        ?feedbackUri schema2:datePublished ?datePublished.
                    }
                }

                FILTER (?orgGraph NOT IN (
                    <http://mu.semte.ch/graphs/lpdc/feedbacksnapshot-ldes-data>,
                    <http://mu.semte.ch/graphs/lpdc/feedbacksnapshot-ldes-data/unknown-receiver>
                ))

                GRAPH <http://mu.semte.ch/graphs/public> {
                    ?bestuurseenheidUri skos:prefLabel ?bestuurseenheidName.
                    ?feedbackStatusIPDCConcept skos:prefLabel ?feedbackStatusIPDC.
                }

                OPTIONAL {
                    GRAPH ?orgGraph {
                        ?feedbackUri schema2:actionStatus ?feedbackStatusConcept.
                    }
                    GRAPH <http://mu.semte.ch/graphs/public> {
                        ?feedbackStatusConcept skos:prefLabel ?feedbackStatus.
                    }
                }

                OPTIONAL {
                    GRAPH ?orgGraph {
                        ?feedbackUri schema2:result ?feedbackProcessingStatusConcept.
                    }
                    GRAPH <http://mu.semte.ch/graphs/public> {
                        ?feedbackProcessingStatusConcept skos:prefLabel ?feedbackProcessingStatus.
                    }
                }
            }
            ORDER BY DESC(?dateCreated)
        `;

        const queryResponse = await query(queryString);
        const data = queryResponse.results.bindings.map((row) => {
            return {
                feedbackUri: getSafeValue(row, 'feedbackUri'),
                feedbackText: getSafeValue(row, 'feedbackText'),
                feedbackStatus: getSafeValue(row, 'feedbackStatus'),
                feedbackStatusIPDC: getSafeValue(row, 'feedbackStatusIPDC'),
                feedbackProcessingStatus: getSafeValue(row, 'feedbackProcessingStatus'),
                bestuurseenheidUri: getSafeValue(row, 'bestuurseenheidUri'),
                bestuurseenheidName: getSafeValue(row, 'bestuurseenheidName'),
                instanceUri: getSafeValue(row, 'instanceUri'),
                instanceName: getSafeValue(row, 'instanceName'),
                dateCreated: getSafeValue(row, 'dateCreated'),
                datePublished: getSafeValue(row, 'datePublished'),
            };
        });

        await generateReportFromData(data, [
            'feedbackUri',
            'feedbackText',
            'feedbackStatus',
            'feedbackStatusIPDC',
            'feedbackProcessingStatus',
            'bestuurseenheidUri',
            'bestuurseenheidName',
            'instanceUri',
            'instanceName',
            'dateCreated',
            'datePublished',
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


