import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
  cronPattern: '0 0 6 * * *',
  name: 'lpdcBestuurseenheidReport',
  execute: async () =>{
    const reportData = {
      title: 'Overview of LPDC services created so far',
      description: 'Overview of LPDC services created so far',
      filePrefix: 'lpdcBestuurseenheid'
    };
    // We want periodic report, of bestuurseenheid (naam, type, uri), public service instance (title, uri, modified, modifiedBy, status)
    console.log('Generating LPDC Bestuurseenheid Report');
    const queryString  = `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
      PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
      PREFIX adms:    <http://www.w3.org/ns/adms#>
      PREFIX dct:     <http://purl.org/dc/terms/>
      PREFIX schema:  <http://schema.org/>
      PREFIX pav:     <http://purl.org/pav/>
      PREFIX foaf:    <http://xmlns.com/foaf/0.1/>

      SELECT DISTINCT ?uriBestuurseenheid ?naam ?typeUri ?type ?uriPublicService ?title ?modified ?modifiedBy ?status ?statusLabel WHERE {
        ?uriPublicService
          a                     lpdcExt:InstancePublicService ;
            adms:status           ?status ;
            schema:dateModified   ?modified ;
            dct:title             ?title ;
            pav:createdBy         ?uriBestuurseenheid .

        ?uriBestuurseenheid
          a                     besluit:Bestuurseenheid ;
            skos:prefLabel        ?naam ;
            besluit:classificatie ?typeUri .

        ?typeUri skos:prefLabel ?type .

        ?status skos:prefLabel ?statusLabel .

        OPTIONAL {
          ?uriPublicService ext:lastModifiedBy ?modifiedByUri.

          ?modifiedByUri foaf:firstName ?firstName ;
                      foaf:familyName ?familyName .
        }
        BIND(CONCAT(COALESCE(?firstName, ""), " ", COALESCE(?familyName, "")) AS ?modifiedBy)

      }
    `;
    const queryResponse = await query(queryString);
    const data = queryResponse.results.bindings;

    const postProcessedData = data.map(r => ({
      uriBestuurseenheid: r.uriBestuurseenheid.value,
      naam: r.naam.value,
      typeUri: r.typeUri.value,
      type: r.type.value,
      uriPublicService: r.uriPublicService.value,
      title: r.title.value,
      modified: r.modified.value,
      modifiedBy: r.modifiedBy.value,
      status: r.status.value,
      statusLabel: r.statusLabel.value
    }));
    const csvHeaders = Object.keys(postProcessedData[0]);
    await generateReportFromData(postProcessedData, csvHeaders, reportData);
  }
};
