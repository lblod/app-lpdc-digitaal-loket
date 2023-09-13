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
            console.log(error);
        }
        console.log(`${new Date()} - ${service.description} not running on ${service.url} with expected status code ${service.httpStatus}, retrying ... `)
        await delay(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - ${service.description} not running on ${service.url} with expected status code ${service.httpStatus}, stopped waiting after ${waitTurn} tries ... `)
            break;
        }
    }
}


function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export default globalSetup;