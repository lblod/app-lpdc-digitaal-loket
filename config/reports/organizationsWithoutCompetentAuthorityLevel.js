import { generateReportFromQueryResult } from "./util/report-helpers";
import { querySudo } from "@lblod/mu-auth-sudo";

export default {
  cronPattern: "0 23 6 * * *",
  name: "organizationsWithoutCompetentAuthorityLevel",
  execute: async () => {
    const reportInfo = {
      title: "List of organisations without a competent authority level",
      description:
        "An overview of all organizations in the IPDCOrganisaties code list that are not linked to a competent authority level",
      filePrefix: "organizationsWithoutCompetentAuthorityLevel",
    };

    const queryString = `
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX lpdc: <http://data.lblod.info/vocabularies/lpdc/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

      SELECT DISTINCT ?name ?classification ?uri
      WHERE {
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?uri skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties>.
          FILTER NOT EXISTS { ?uri lpdc:organizationCompetencyLevel ?level. }
          ?uri skos:prefLabel ?name.
          OPTIONAL {
            ?uri besluit:classificatie/skos:prefLabel ?classification.
          }
        }
      } ORDER BY ?prefLabel ?classification
      `;

    const queryResponse = await querySudo(queryString);
    await generateReportFromQueryResult(queryResponse, reportInfo);
  },
};
