import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {loginAsPepingen, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {InstanceStatus} from "../test-helpers/codelists";
import {fetchType} from "../test-helpers/sparql";
import {Predicates} from "../test-helpers/triple-array";


test.describe('Reopen instance', () =>  {


    test('Reopen sent instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withInstanceStatus(InstanceStatus.verstuurd)
            .withDateSent(new Date())
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/reopen`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findTriple(Predicates.instanceStatus).getObjectValue()).toBe('http://lblod.data.gift/concepts/instance-status/ontwerp');
        expect(updatedInstance.findTriple(Predicates.dateModified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('Reopen draft instance should throw error', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withInstanceStatus(InstanceStatus.ontwerp)
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/reopen`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeFalsy();
        expect(response.status()).toEqual(400);
        expect(await response.json()).toEqual(expect.objectContaining({
            'correlationId': expect.anything(),
            'message': "Instantie is al in status ontwerp"
        }));

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findTriple(Predicates.instanceStatus).getObjectValue()).toBe('http://lblod.data.gift/concepts/instance-status/ontwerp');
        expect(updatedInstance.findTriple(Predicates.dateModified).getObjectValue()).toEqual(modified.toISOString());
    });

});