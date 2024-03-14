import {expect, test} from "@playwright/test";
import {deleteAll} from "../test-helpers/sparql";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {dispatcherUrl} from "../test-helpers/test-options";

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});

test.describe('Saving forms for instances', () => {

    test('Can put content form for public service', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        responseBody.toString();

        const formUpdate = {
            additions:
                `@prefix : <#>.
                 @prefix dct: <http://purl.org/dc/terms/>.
                 @prefix pub: <http://data.lblod.info/id/public-service/>.
                 
                 pub:${publicService.getUUID()} dct:title "dit is een titel"@nl-be-x-formal.
             `,
            graph: responseBody.source,
            removals: ''
        }

        const updateResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {
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

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        responseBody.toString();

        const formUpdate = {
            additions: '',
            graph: responseBody.source,
            removals: ''
        };

        const updateResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {
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

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        responseBody.toString();

        const loginResponseNoRights = await loginAsPepingenButRemoveLPDCRightsFromSession(request);

        const formUpdate = {
            additions: '',
            graph: responseBody.source,
            removals: ''
        };

        const updateResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {
            data: formUpdate,
            headers: {cookie: loginResponseNoRights.cookie}
        });
        expect(updateResponse.status()).toEqual(403);
    });

});