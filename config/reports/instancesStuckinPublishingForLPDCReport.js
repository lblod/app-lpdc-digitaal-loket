import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
  cronPattern: '0 40 23 * * *',
  name: 'instancesStuckinPublishingForLPDCReport',
  execute: async () => {
    const reportData = {
      title: 'List of LPDC instances stuck in publishing',
      description: 'All instances (public services and tombstones) that are sent but stuck in publishing',
      filePrefix: 'instancesStuckinPublishingForLPDCReport'
    };

    console.log('Generate list of stuck LPDC instances');

    const queryString = `
      PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
      PREFIX schema:  <http://schema.org/>
      PREFIX adms:    <http://www.w3.org/ns/adms#>
      PREFIX as:      <https://www.w3.org/ns/activitystreams#>
      PREFIX dct:     <http://purl.org/dc/terms/>
      PREFIX pav:     <http://purl.org/pav/>
      PREFIX rdfs-ns: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX http:    <http://www.w3.org/2011/http#>
      PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
      
      SELECT DISTINCT ?instanceIri ?type ?title ?bestuurseenheidLabel ?classificatieLabel ?errorCode ?errorMessage ?dateCreated ?dateSent ?datePublished WHERE {
            GRAPH <http://mu.semte.ch/graphs/lpdc/ipdc-publication-errors> {
                ?publicationError a <http://data.lblod.info/vocabularies/lpdc/instance-publication-error> .
                ?publicationError http:statusCode ?errorCode .
                ?publicationError schema:error ?errorMessage .
                ?publicationError dct:source ?instanceIri .
                OPTIONAL {
                    ?publicationError dct:title ?title .
                }
                ?publicationError foaf:owner ?bestuurseenheidIri .
                ?publicationError schema:dateCreated ?dateCreated .
                OPTIONAL {
                    ?publicationError schema:dateSent ?dateSent .
                }
                OPTIONAL {
                    ?publicationError schema:datePublished ?datePublished .
                }
            }
            
            GRAPH ?g {
              VALUES ?type {
                cpsv:PublicService
                as:Tombstone
              }
                ?instanceIri a ?type .
            }
            
            GRAPH ?graph {
                ?bestuurseenheidIri skos:prefLabel ?bestuurseenheidLabel ;
                    besluit:classificatie ?classificatie . 
                ?classificatie skos:prefLabel ?classificatieLabel .
            }
 
            FILTER(
                (STRSTARTS(STR(?g), "http://mu.semte.ch/graphs/organizations/" ) && STRENDS(STR(?g), "/LoketLB-LPDCGebruiker"))
            )
        }
    `;

    const queryResponse = await query(queryString);
    const data = queryResponse.results.bindings.map((publicService) => {
      return {
        publicService: getSafeValue(publicService, 'instanceIri'),
        type: getSafeValue(publicService, 'type'),
        title: getSafeValue(publicService, 'title'),
        bestuurseenheidLabel: getSafeValue(publicService, 'bestuurseenheidLabel'),
        classificatieLabel: getSafeValue(publicService, 'classificatieLabel'),
        errorCode: getSafeValue(publicService, 'errorCode'),
        errorMessage: getSafeValue(publicService, 'errorMessage'),
        datum: getSafeValue(publicService, 'dateCreated'),
        lastSentDate: getSafeValue(publicService, 'dateSent'),
        lastPublishedDate: getSafeValue(publicService, 'datePublished')
      };
    });

    await generateReportFromData(data, [
      'publicService',
      'type',
      'title',
      'bestuurseenheidLabel',
      'classificatieLabel',
      'errorCode',
      'errorMessage',
      'datum',
      'lastSentDate',
      'lastPublishedDate',
    ], reportData);
  }
};

function getSafeValue(entry, property){
  return entry[property] ? wrapInQuote(entry[property].value) : null;
}

// Some values might contain commas; wrapping them in escape quotes doesn't disrupt the columns.
function wrapInQuote(value) {
  return `\"${value}\"`;
}
