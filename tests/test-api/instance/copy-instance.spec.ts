import {expect, test} from "@playwright/test";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {dispatcherUrl} from "../test-helpers/test-options";
import {Predicates} from "../test-helpers/triple-array";

test.describe('copy instance', () => {

    test('should copy the instance and return newly created id', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        //TODO LPDC-1057: expand with is for municipality merger
        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/copy`, {
            headers: {
                cookie: loginResponse.cookie
            }
        });
        expect(response.status()).toEqual(201);

        expect(await response.json()).toEqual(expect.objectContaining({
            data: {
                type: "public-service",
                id: expect.anything(),
                uri: expect.anything(),
            }
        }));

    });

    test('copy instance without login, returns http 401 Unauthorized', async ({request}) => {
        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/copy`, {
            headers: {
                cookie: undefined,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.status()).toEqual(401);
    });

    test('copy instance with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/copy`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.status()).toEqual(403);
    });
});