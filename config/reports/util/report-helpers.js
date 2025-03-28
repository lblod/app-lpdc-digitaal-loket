import { generateReportFromData } from "../../helpers.js";

/**
 * Generates a CSV for the given SPARQL query-result
 *
 * @param queryResults - the results from the query
 * @param metadata - metadata for the resulting CSV file
 */
export async function generateReportFromQueryResult(queryResults, metadata) {
  const bindings = queryResults.results?.bindings;
  const header = queryResults.head?.vars;

  if (bindings && bindings.length && header) {
    const data = bindings.map((row) => {
      const obj = {};
      header.forEach((variable) => {
        obj[variable] = getSafeValue(row, variable);
      });
      return obj;
    });

    await generateReportFromData(data, header, metadata);
  } else {
    console.warn("[WARN] nothing to report on ...");
  }
}

/**
 * Translate a query-result row variable to a CSV safe value
 *
 * Some values might contain comas, wrapping them in escapes quotes doesn't disturb the columns
 *
 * @param row
 * @param variable
 * @returns {string|null}
 */
export function getSafeValue(row, variable) {
  return row[variable] ? `\"${row[variable].value}\"` : null;
}
