import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
    cronPattern: '0 45 23 * * *',
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

            SELECT DISTINCT ?feedbackUri ?feedbackText ?feedbackStatus ?feedbackStatusIPDC ?feedbackProcessingStatus ?source ?bestuurseenheidUri ?bestuurseenheidName ?instanceUri ?instanceName ?dateFeedbackSent ?dateFeedbackReply ?datePublished {
                GRAPH ?orgGraph {
                    ?feedbackUri a schema2:Conversation ;
                        adms2:status ?feedbackStatusIPDCConcept;
                        lpdcExt:receiverBestuurseenheid ?bestuurseenheidUri;
                        skos:primarySubject ?instanceUri;
                        schema2:dateCreated ?dateFeedbackSent.
                     
                    ?feedbackUri schema2:question ?question.   
                    ?question schema2:question ?feedbackText.
                    ?question schema2:agent ?source.
                     
                    OPTIONAL {
                        ?instanceUri dct:title ?instanceName.
                    }

                    OPTIONAL {
                        ?feedbackUri schema2:datePublished ?datePublished.
                    }
                    
                    OPTIONAL {
                        ?feedbackUri schema2:suggestedAnswer ?answer.
                        ?answer schema2:startTime ?dateFeedbackReply.
                    }
                }

                FILTER STRSTARTS(str(?orgGraph), "http://mu.semte.ch/graphs/organizations/")
                FILTER STRENDS(str(?orgGraph), "/LoketLB-LPDCGebruiker")

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
            ORDER BY DESC(?dateFeedbackSent)
        `;

        const queryResponse = await query(queryString);
        const data = queryResponse.results.bindings.map((row) => {
            return {
                feedbackUri: getSafeValue(row, 'feedbackUri'),
                feedbackText: getSafeValue(row, 'feedbackText'),
                feedbackStatus: getSafeValue(row, 'feedbackStatus'),
                feedbackStatusIPDC: getSafeValue(row, 'feedbackStatusIPDC'),
                feedbackProcessingStatus: getSafeValue(row, 'feedbackProcessingStatus'),
                source: getSafeValue(row, 'source'),
                bestuurseenheidUri: getSafeValue(row, 'bestuurseenheidUri'),
                bestuurseenheidName: getSafeValue(row, 'bestuurseenheidName'),
                instanceUri: getSafeValue(row, 'instanceUri'),
                instanceName: getSafeValue(row, 'instanceName'),
                dateFeedbackSent: getSafeValue(row, 'dateFeedbackSent'),
                dateFeedbackReply: getSafeValue(row, 'dateFeedbackReply'),
                datePublished: getSafeValue(row, 'datePublished'),
            };
        });

        await generateReportFromData(data, [
            'feedbackUri',
            'feedbackText',
            'feedbackStatus',
            'feedbackStatusIPDC',
            'feedbackProcessingStatus',
            'source',
            'bestuurseenheidUri',
            'bestuurseenheidName',
            'instanceUri',
            'instanceName',
            'dateFeedbackSent',
            'dateFeedbackReply',
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


