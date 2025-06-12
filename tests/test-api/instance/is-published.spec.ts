import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {dispatcherUrl} from "../test-helpers/test-options";
import {InstanceStatus} from "../test-helpers/codelists";
import {PublishedPublicServiceTestBuilder} from "../test-helpers/published-public-service.test-builder";


test.describe('isPublished', () => {

    test('get is published for not send instance, returns false', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/is-published`, {
            headers: {
                cookie: loginResponse.cookie,
            }
        });
        expect(response.status()).toEqual(200);
        expect(await response.json()).toEqual({isPublished: false});
    });

    test('get is published for send instance but not yet published, returns false', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const sendDate = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withDateSent(sendDate)
            .withInstanceStatus(InstanceStatus.verzonden)
            .buildAndPersist(request, pepingenId);

        await PublishedPublicServiceTestBuilder.aMinimalPublishedService()
            .withIsPublishedVersionOf(instance.getId())
            .withGeneratedAtTime(sendDate)
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/is-published`, {
            headers: {
                cookie: loginResponse.cookie,
            }
        });
        expect(response.status()).toEqual(200);
        expect(await response.json()).toEqual({isPublished: false});
    });

    test('get is published for send instance and published, returns true', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const sendDate = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withDateSent(sendDate)
            .withInstanceStatus(InstanceStatus.verzonden)
            .buildAndPersist(request, pepingenId);

        await PublishedPublicServiceTestBuilder.aMinimalPublishedService()
            .withDatePublished(new Date())
            .withIsPublishedVersionOf(instance.getId())
            .withGeneratedAtTime(sendDate)
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/is-published`, {
            headers: {
                cookie: loginResponse.cookie,
            }
        });
        expect(response.status()).toEqual(200);
        expect(await response.json()).toEqual({isPublished: true});
    });

    test('get is published without login, returns http 401 Unauthorized', async ({request}) => {
        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/is-published`, {
            headers: {
                cookie: undefined,
            }
        });
        expect(response.status()).toEqual(401);
    });

    test('get is published with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/is-published`, {
            headers: {
                cookie: loginResponse.cookie,
            }
        });
        expect(response.status()).toEqual(403);
    });

});