import { expect, test } from "@playwright/test";

import { virtuosoUrl } from "../../test-api/test-helpers/test-options";

test(`Urls from ipdc ldes stream are saved with datatype <http://www.w3.org/2001/XMLSchema#string> when processed by ldes-consumer but after processing by delta notifier in lpdc-management for conceptsnapshot creation the literal-typing of string is removed `, async ({ request }) => {

    const query = `
        SELECT ?g ?o
            WHERE {
                {
                GRAPH ?g {
                    ?s <http://schema.org/url> ?o .
                }
                FILTER (?g = <http://mu.semte.ch/graphs/public> || ?g = <http://mu.semte.ch/graphs/lpdc/ldes-data>)
            }
            }
            order by str(?o), ?g
            `;
        const response = await request.get(`${virtuosoUrl}/sparql`, {params: {query: query, format: 'application/sparql-results+json'}});
        expect(response.ok(), await response.text()).toBeTruthy();
        const json = await response.json();
        expect(json.results.bindings).toMatchObject([
            {
              g: { type: 'uri', value: 'http://mu.semte.ch/graphs/lpdc/ldes-data' },
              o: {
                type: 'typed-literal',
                datatype: 'http://www.w3.org/2001/XMLSchema#string',
                value: 'https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit'
              }
            },
            {
              g: { type: 'uri', value: 'http://mu.semte.ch/graphs/public' },
              o: {
                type: 'literal',
                value: 'https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit'
              }
            },
            {
              g: { type: 'uri', value: 'http://mu.semte.ch/graphs/lpdc/ldes-data' },
              o: {
                type: 'typed-literal',
                datatype: 'http://www.w3.org/2001/XMLSchema#string',
                value: 'https://procedure-website.com'
              }
            },
            {
              g: { type: 'uri', value: 'http://mu.semte.ch/graphs/public' },
              o: {
                type: 'literal',
                value: 'https://procedure-website.com'
              }
            }]);

});
