import {expect, test} from "@playwright/test";
import {deleteAll} from "../test-helpers/sparql";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {dispatcherUrl} from "../test-helpers/test-options";
import fs from "fs";
import {Predicates, TripleArray} from "../test-helpers/triple-array";

const CONTENT_FORM_ID = 'cd0b5eba-33c1-45d9-aed9-75194c3728d3';
const CHARACTERISTICS_FORM_ID = '149a7247-0294-44a5-a281-0a4d3782b4fd';

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});

test.describe('Saving forms for instances', () => {

    //TODO LPDC-917: when updating the code for saving, finish this test ( have meaningful updates and removals)
    test('Can put content form for public service', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/${CONTENT_FORM_ID}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        responseBody.toString();

        const formUpdate = {
            additions: '',
            graph: responseBody.source,
            removals: ''
        }

        const updateResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {
            data: formUpdate,
            headers: {cookie: loginResponse.cookie}
        });
        expect(updateResponse.ok()).toBeTruthy();
    });

    test('When trying to put content form for public service when user is not logged in, returns http 401 Unauthenticated', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/${CONTENT_FORM_ID}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        responseBody.toString();

        const formUpdate = {
            additions: '',
            graph: responseBody.source,
            removals: ''
        };

        const updateResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {
            data: formUpdate,
            headers: {cookie: 'abc'}
        });
        expect(updateResponse.status()).toEqual(401);
    });

    test('When trying to put content form for public service when when user has no rights on lpdc, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/${CONTENT_FORM_ID}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        responseBody.toString();

        const loginResponseNoRights = await loginAsPepingenButRemoveLPDCRightsFromSession(request);

        const formUpdate = {
            additions: '',
            graph: responseBody.source,
            removals: ''
        };

        const updateResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {
            data: formUpdate,
            headers: {cookie: loginResponseNoRights.cookie}
        });
        expect(updateResponse.status()).toEqual(403);
    });

});