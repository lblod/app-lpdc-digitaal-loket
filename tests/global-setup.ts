import {APIRequestContext, type FullConfig, request} from '@playwright/test';
import {
    dispatcherUrl,
    lpdcManagementUrl,
    migrationsUrl,
    mockLoginUrl,
    reportGenerationUrl,
    virtuosoUrl
} from './test-api/test-helpers/test-options';

async function globalSetup(config: FullConfig) {
    console.log('verify services running');
    const isE2e = config[Object.getOwnPropertySymbols(config)[0].valueOf()].cliArgs[0].includes('test-e2e')
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

    if (isE2e) {
        const expectedNumberOfConcepts = 2;
        const expectedNumberOfBestuurseenheden = 1288;
        await waitTillInitialConceptsAreLoaded(apiRequest, expectedNumberOfConcepts);
        await waitTillInitialBestuurseenhedenAreLoaded(apiRequest, expectedNumberOfBestuurseenheden);
        await waitTillInitialDisplayConfigurationsAreLoaded(apiRequest, expectedNumberOfConcepts, expectedNumberOfBestuurseenheden);
    }
}

async function waitTillServiceRunning(apiRequest: APIRequestContext, service: {
    httpStatus: number;
    description: string;
    url: string
}) {
    let waitTurn = 0;
    while (true) {
        waitTurn++;
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

async function waitTillInitialConceptsAreLoaded(apiRequest: APIRequestContext, expectedNrOfConcepts: number) {
    let waitTurn = 0;

    const query = `
        SELECT COUNT(?concept) as ?count WHERE {
            ?concept a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .
            ?concept <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?versionedSource .
        }`;
    while (true) {
        waitTurn++;
        const response = await apiRequest.get(`${virtuosoUrl}/sparql`, {
            params: {
                query: query,
                format: 'application/sparql-results+json'
            }
        });
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

async function waitTillInitialBestuurseenhedenAreLoaded(apiRequest: APIRequestContext, expectedNrOfBestuurseenheden: number) {
    let waitTurn = 0;
    const query = `
        SELECT COUNT(?bestuurseenheid) as ?count WHERE {
            ?bestuurseenheid a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid> .
        }`;
    while (true) {
        waitTurn++;
        const response = await apiRequest.get(`${virtuosoUrl}/sparql`, {
            params: {
                query: query,
                format: 'application/sparql-results+json'
            }
        });
        const result = await response.json();
        const nrOfBestuurseenheden = result.results.bindings[0].count.value;
        if (nrOfBestuurseenheden >= expectedNrOfBestuurseenheden) {
            console.log(`${new Date()} - Processing bestuurseenheden finished, there are ${nrOfBestuurseenheden} bestuurseenheden`)
            break;
        }
        console.log(`${new Date()} - There are ${nrOfBestuurseenheden} bestuurseenheden, while expected nr of bestuurseenheden is ${expectedNrOfBestuurseenheden}, retrying ...`)
        await wait(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - There are ${nrOfBestuurseenheden} bestuurseenheden, while expected nr of bestuurseenheden is ${expectedNrOfBestuurseenheden}, stopped waiting after ${waitTurn} tries ... `)
            break;
        }
    }
}

async function waitTillInitialDisplayConfigurationsAreLoaded(apiRequest: APIRequestContext, concepts: number, bestuurseenheden: number) {
    let waitTurn = 0;
    const expectedNrOfDisplayConfigurations = concepts * bestuurseenheden;
    const query = `
        SELECT COUNT(?displayConfiguration) as ?count WHERE {
            ?displayConfiguration a <http://data.lblod.info/vocabularies/lpdc/ConceptDisplayConfiguration> .
        }`;

    while (true) {
        waitTurn++;
        const response = await apiRequest.get(`${virtuosoUrl}/sparql`, {
            params: {
                query: query,
                format: 'application/sparql-results+json'
            }
        });
        const result = await response.json();
        const nrOfDisplayConfigurations = result.results.bindings[0].count.value;
        if (nrOfDisplayConfigurations >= expectedNrOfDisplayConfigurations) {
            console.log(`${new Date()} - Processing display configurations finished, there are ${nrOfDisplayConfigurations} display configurations`)
            break;
        }
        console.log(`${new Date()} - There are ${nrOfDisplayConfigurations} display configurations, while expected nr of display configurations is ${expectedNrOfDisplayConfigurations}, retrying ...`)
        await wait(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - There are ${nrOfDisplayConfigurations} display configurations, while expected nr of display configurations is ${expectedNrOfDisplayConfigurations}, stopped waiting after ${waitTurn} tries ... `)
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