import {type FullConfig, request, APIRequestContext} from '@playwright/test';
import {dispatcherUrl, virtuosoUrl, mockLoginUrl, migrationsUrl, lpdcManagementUrl} from './test-api/test-helpers/test-options';

async function globalSetup(config: FullConfig) {
    console.log('verify services running');

    const apiRequest = await request.newContext();

    const services =
        [
            {description: 'identifier-dispatcher', url: dispatcherUrl, port: 404},
            {description: 'virtuoso', url: virtuosoUrl, port: 200},
            {description: 'mock-login', url: mockLoginUrl, port: 404},
            {description: 'migrations', url: migrationsUrl, port: 404},
            {description: 'lpdc-management', url: lpdcManagementUrl, port: 200},
        ];
    for (const service of services) {
        await waitTillServiceRunning(apiRequest, service);
    }
}

async function waitTillServiceRunning(apiRequest: APIRequestContext, service: {
    port: number;
    description: string;
    url: string
}) {
    let waitTurn = 0;
    while (true) {
        waitTurn ++;
        try {
            const result = await apiRequest.get(service.url)
            if (result.status() === service.port) {
                console.log(`${new Date()} - ${service.description} running`);
                break;
            }
        } catch (error) {
            //console.log(error);
        }
        console.log(`${new Date()} - ${service.description} not running on ${service.url} with expected status code ${service.port}, retrying ... `)
        await delay(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - ${service.description} not running on ${service.url} with expected status code ${service.port}, stopped waiting after ${waitTurn} tries ... `)
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