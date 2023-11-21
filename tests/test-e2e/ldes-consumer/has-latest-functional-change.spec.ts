import {expect, test} from "@playwright/test";

import {virtuosoUrl} from "../../test-api/test-helpers/test-options";

test(`Latest functional changes is added between concept and concept-snapshot `, async ({request}) => {

    const query = `
      SELECT ?s ?o WHERE {
            ?s <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasLatestFunctionalChange> ?o .
        }
    `;

    const response = await request.get(`${virtuosoUrl}/sparql`, {
        params: {
            query: query,
            format: 'application/sparql-results+json'
        }
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    const json = await response.json();
    expect(json.results.bindings).toHaveLength(3);
    expect(json.results.bindings).toEqual(expect.arrayContaining([
        {
            s: {type: 'uri', value: 'https://ipdc.tni-vlaanderen.be/id/concept/705d401c-1a41-4802-a863-b22499f71b84'},
            o: {type: 'uri', value: 'https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/50fd7f03-276f-403e-ad39-152dba4e39be'}
        },
        {
            s: {type: 'uri', value: 'https://ipdc.tni-vlaanderen.be/id/concept/9adcd3db-3acc-4707-867f-e82a8b6429f8'},
            o: {type: 'uri', value: 'https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/f23a4afa-5d92-4331-8f1d-a2b17382b6e9'}
        },
        {
            s: {type: 'uri', value: 'https://ipdc.tni-vlaanderen.be/id/concept/9a69eb39-c6c2-4244-aedd-1847d4f72586'},
            o: {type: 'uri', value: 'https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/ad6635b9-6259-414b-968e-458e7e4a38e1'}
        }
    ]));

});
