import { generateReportFromQueryResult } from "./util/report-helpers";
import { batchedQuery } from "../helpers.js";

export default {
  cronPattern: "0 26 6 * * *",
  name: "organizationsWithoutExecutingAuthorityLevel",
  execute: async () => {
    const reportInfo = {
      title: "List of organisations without an executing authority level",
      description:
        "An overview of all organizations in the IPDCOrganisaties code list that are not linked to a competent authority level",
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

    // NOTE (28/03/2025): Use `batchedQuery` as at the time of writing the
    // levels were not yet added the data and the query just returns all
    // organisations.
    const queryResponse = await batchedQuery(queryString);
    console.log(queryResponse);
    await generateReportFromQueryResult(queryResponse, reportInfo);
  },
};
