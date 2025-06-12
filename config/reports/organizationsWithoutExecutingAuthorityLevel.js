import { generateReportFromQueryResult } from "./util/report-helpers";
import { querySudo } from "@lblod/mu-auth-sudo";

export default {
  cronPattern: "0 26 6 * * *",
  name: "organizationsWithoutExecutingAuthorityLevel",
  execute: async () => {
    const reportInfo = {
      title: "List of organisations without an executing authority level",
      description:
        "An overview of all organizations in the IPDCOrganisaties code list that are not linked to an executing authority level",
      filePrefix: "organizationsWithoutExecutingAuthorityLevel",
    };

    const queryString = `
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX lpdc: <http://data.lblod.info/vocabularies/lpdc/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

      SELECT DISTINCT ?name ?classification ?uri
      WHERE {
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?uri skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties>.
          FILTER NOT EXISTS { ?uri lpdc:organizationExecutingLevel ?level. }
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
