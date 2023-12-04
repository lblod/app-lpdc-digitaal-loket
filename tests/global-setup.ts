import {type FullConfig, request, APIRequestContext} from '@playwright/test';
import {
    dispatcherUrl,
    virtuosoUrl,
    mockLoginUrl,
    migrationsUrl,
    lpdcManagementUrl,
    dashboardUrl,
    reportGenerationUrl
} from './test-api/test-helpers/test-options';

async function globalSetup(config: FullConfig) {
    console.log('verify services running');

    const apiRequest = await request.newContext();

    const services =
        [
            {description: 'identifier-dispatcher', url: dispatcherUrl, httpStatus: 404},
            {description: 'virtuoso', url: virtuosoUrl, httpStatus: 200},
            {description: 'mock-login', url: mockLoginUrl, httpStatus: 404},
            {description: 'migrations', url: migrationsUrl, httpStatus: 404},
            {description: 'lpdc-management', url: lpdcManagementUrl, httpStatus: 200},
            {description: 'report-generation', url: reportGenerationUrl, httpStatus: 200}
        ];
    for (const service of services) {
        await waitTillServiceRunning(apiRequest, service);
    }

    await waitTillInitialConceptsAreLoaded(apiRequest);
}

async function waitTillServiceRunning(apiRequest: APIRequestContext, service: {
    httpStatus: number;
    description: string;
    url: string
}) {
    let waitTurn = 0;
    while (true) {
        waitTurn ++;
        try {
            const result = await apiRequest.get(service.url)
            if (result.status() === service.httpStatus) {
                console.log(`${new Date()} - ${service.description} running`);
                break;
            } else {
                console.log(`${new Date()} - ${service.description} running on status code ${result.status()}`);
            }
        } catch (error) {
            //console.log(error);
        }
        console.log(`${new Date()} - ${service.description} not running on ${service.url} with expected status code ${service.httpStatus}, retrying ... `)
        await wait(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - ${service.description} not running on ${service.url} with expected status code ${service.httpStatus}, stopped waiting after ${waitTurn} tries ... `)
            break;
        }
    }
}

async function waitTillInitialConceptsAreLoaded(apiRequest: APIRequestContext) {
    let waitTurn = 0;
    const expectedNrOfConcepts = 2;
    const query = `
        SELECT COUNT(?concept) as ?count WHERE {
            ?concept a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .
            ?concept <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?versionedSource .
        }`;
    while (true) {
        waitTurn++;
        const response = await apiRequest.get(`${virtuosoUrl}/sparql`, {params: {query: query, format: 'application/sparql-results+json'}});
        const result = await response.json();
        const nrOfConcepts = result.results.bindings[0].count.value;
        if (nrOfConcepts >= expectedNrOfConcepts) {
            console.log(`${new Date()} - Processing concepts finished, there are ${nrOfConcepts} concepts`)
            break;
        }
        console.log(`${new Date()} - There are ${nrOfConcepts} concepts, while expected nr of concepts is ${expectedNrOfConcepts}, retrying ...`)
        await wait(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - There are ${nrOfConcepts} concepts, while expected nr of concepts is ${expectedNrOfConcepts}, stopped waiting after ${waitTurn} tries ... `)
            break;
        }
    }
}


function wait(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export default globalSetup;