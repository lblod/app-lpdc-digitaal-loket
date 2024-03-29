import {expect, test} from "@playwright/test";
import {loginAsPepingen, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {InstanceStatus} from "../test-helpers/codelists";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchType} from "../test-helpers/sparql";
import {Predicates, Uri} from "../test-helpers/triple-array";


test.describe('publish instance', () => {

    test('publish instance', async ({request}) => {
        const modified = new Date();
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withInstanceStatus(InstanceStatus.ontwerp)
            .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/publish`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const updatedInstance = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findTriple(Predicates.instanceStatus).getObjectValue()).toBe('http://lblod.data.gift/concepts/instance-status/verstuurd');
        expect(updatedInstance.findTriple(Predicates.dateModified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('throw error when instance is not valid', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withInstanceStatus(InstanceStatus.ontwerp)
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/publish`, {params: {cookie: loginResponse.cookie}});
        expect(response.status()).toEqual(400);

        expect(await response.json()).toEqual(expect.objectContaining({
            message:"Instantie niet geldig om te publiceren",
            correlationId: expect.anything()
        }))
    });

    test('publish already published instance', async ({request}) => {
        const modified = new Date();
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withInstanceStatus(InstanceStatus.verstuurd)
            .withDateSent(new Date())
            .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/publish`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeFalsy();
        expect(response.status()).toEqual(400);
        expect(await response.json()).toEqual(expect.objectContaining({
            message: "Instantie heeft reeds status verstuurd",
            correlationId: expect.anything()
        }))

        const updatedInstance = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findTriple(Predicates.instanceStatus).getObjectValue()).toBe('http://lblod.data.gift/concepts/instance-status/verstuurd');
        expect(updatedInstance.findTriple(Predicates.dateModified).getObjectValue()).toEqual(modified.toISOString());
    });

});