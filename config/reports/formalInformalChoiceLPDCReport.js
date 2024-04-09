import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
  cronPattern: '0 30 23 * * *',
  name: 'formalInformalChoiceLPDCReport',
  execute: async () => {
    const reportData = {
      title: 'List of formal informal',
      description: 'The amount of instances that are formal informal or undetermined for each local authority',
      filePrefix: 'formalInformalChoiceLPDCReport'
    };

    console.log('Generate formalInformalChoiceLPDCReport');

    const queryString = `SELECT DISTINCT ?localAuthority
       (COALESCE(?chosenForm , "-") AS ?formalInformalChoice)
       (COALESCE(?formalInformalChoiceDateTime , "-") AS ?dateTimeChoiceMade)
       (COUNT(?formalLanguage) AS ?formalLanguageCount)
       (COUNT(?informalLanguage) AS ?informalLanguageCount)
       (COUNT(?nlLanguage) AS ?nlLanguageCount)

WHERE {
  {
    GRAPH ?g {
      ?bestuurseenheid <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid> .
      ?bestuurseenheid <http://www.w3.org/2004/02/skos/core#prefLabel> ?localAuthorityPrefLabel.
      ?bestuurseenheid <http://data.vlaanderen.be/ns/besluit#classificatie> ?classificatieCode.
      ?classificatieCode <http://www.w3.org/2004/02/skos/core#prefLabel> ?classificatiePrefLabel.

      BIND(CONCAT(?classificatiePrefLabel, " ", ?localAuthorityPrefLabel) AS ?localAuthority)

    }
    GRAPH ?g2 {
      ?instance <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
      ?instance <http://purl.org/pav/createdBy> ?bestuurseenheid.

      OPTIONAL {
         ?formalInformal a <http://data.lblod.info/vocabularies/lpdc/FormalInformalChoice>.
         ?formalInformal <http://purl.org/dc/terms/relation> ?bestuurseenheid.
         ?formalInformal <http://data.lblod.info/vocabularies/lpdc/chosenForm> ?chosenForm.
         ?formalInformal <http://schema.org/dateCreated> ?choiceDateTime.
         BIND(REPLACE(REPLACE(STR(?choiceDateTime), "T", " "), "Z", "") AS ?formalInformalChoiceDateTime)
      }
     OPTIONAL {
         ?instance <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> ?formalLanguage.
         FILTER (?formalLanguage = "nl-be-x-formal")
      }

      OPTIONAL {
         ?instance <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> ?informalLanguage.
         FILTER (?informalLanguage = "nl-be-x-informal")
      }
      OPTIONAL {
         ?instance <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> ?nlLanguage.
         FILTER (?nlLanguage = "nl")
      }
    }
  }
}
GROUP BY ?localAuthority ?localAuthorityPrefLabel ?formalInformalChoiceDateTime ?chosenForm
ORDER BY ?localAuthorityPrefLabel`;

    const queryResponse = await query(queryString);
    const data = queryResponse.results.bindings.map((publicService) => {
      return {
        localAuthority: getSafeValue(publicService, 'localAuthority'),
        formalInformalChoice: getSafeValue(publicService, 'formalInformalChoice'),
        dateTimeChoiceMade: getSafeValue(publicService,'dateTimeChoiceMade'),
        informalInstances: getSafeValue(publicService,'informalLanguageCount'),
        formalInstances: getSafeValue(publicService,'formalLanguageCount'),
        nlInstances: getSafeValue(publicService,'nlLanguageCount')
      };
    });

    await generateReportFromData(data, [
      'localAuthority',
      'formalInformalChoice',
      'dateTimeChoiceMade',
      'informalInstances',
      'formalInstances',
      'nlInstances',
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
