import {expect, test} from "@playwright/test";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {dispatcherUrl} from "../test-helpers/test-options";
import {Predicates, Uri} from "../test-helpers/triple-array";
import {ChosenForm, FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";
import {InstancePublicationStatusType, InstanceStatus} from "../test-helpers/codelists";
import {Language} from "../test-helpers/language";
import {fetchType} from "../test-helpers/sparql";
import {v4 as uuid} from 'uuid';

test.describe('convert instance to informal', () => {

    //TODO LPDC-1139: finish test
    test.skip('should retrieve informal data from ipdc, and update instance with and set dutchLanguageVariant to informal and republish', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        await FormalInformalChoiceTestBuilder.aChoice()
            .withBestuurseenheid(pepingenId)
            .withChosenForm(ChosenForm.INFORMAL)
            .buildAndPersist(request)

        const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
        const id = new Uri(`http://data.lblod.info/id/public-service/${uuid}`)

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withId(id)
            .withUUID(uuid)
            .withTitle('Instance title', Language.FORMAL)
            .withDescription('Instance description', Language.FORMAL)
            .withDateSent(new Date())
            .withInstanceStatus(InstanceStatus.verstuurd)
            .withDatePublished(new Date())
            .withPublicationStatus(InstancePublicationStatusType.gepubliceerd)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/convert-instance-to-informal`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findObject(Predicates.dutchLanguageVariant).getValue()).toEqual(Language.INFORMAL);
        expect(updatedInstance.findObject(Predicates.needsConversionFromFormalToInformal).getValue()).toEqual("0");
        //TODO LPDC-1039 verify some fields (that come from the ipdc stub ...)
    });

    test('convert instance to informal without found in ipdc, returns http 500 Service error ', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        await FormalInformalChoiceTestBuilder.aChoice()
            .withBestuurseenheid(pepingenId)
            .withChosenForm(ChosenForm.INFORMAL)
            .buildAndPersist(request)

        const instanceUuid = uuid();
        const id = new Uri(`http://data.lblod.info/id/public-service/${instanceUuid}`)

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withId(id)
            .withUUID(instanceUuid)
            .withTitle('Instance title', Language.FORMAL)
            .withDescription('Instance description', Language.FORMAL)
            .withDateSent(new Date())
            .withInstanceStatus(InstanceStatus.verstuurd)
            .withDatePublished(new Date())
            .withPublicationStatus(InstancePublicationStatusType.gepubliceerd)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/convert-instance-to-informal`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });

        expect(response.status()).toEqual(404);
    });



    test('convert instance to informal without login, returns http 401 Unauthorized', async ({request}) => {
        const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
        const id = new Uri(`http://data.lblod.info/id/public-service/${uuid}`)

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withId(id)
            .withUUID(uuid)
            .withDateSent(new Date())
            .withInstanceStatus(InstanceStatus.verstuurd)
            .withDatePublished(new Date())
            .withPublicationStatus(InstancePublicationStatusType.gepubliceerd)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/convert-instance-to-informal`, {
            headers: {
                cookie: undefined,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.status()).toEqual(401);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findObject(Predicates.dutchLanguageVariant).getValue()).toEqual(Language.FORMAL);
        expect(notUpdatedInstance.findObject(Predicates.needsConversionFromFormalToInformal).getValue()).toEqual("1");
    });

    test('convert instance to informal with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const uuid = 'e8843fda-b3a8-4334-905c-8e49eb12203b';
        const id = new Uri(`http://data.lblod.info/id/public-service/${uuid}`)

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withId(id)
            .withUUID(uuid)
            .withDateSent(new Date())
            .withInstanceStatus(InstanceStatus.verstuurd)
            .withDatePublished(new Date())
            .withPublicationStatus(InstancePublicationStatusType.gepubliceerd)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/convert-instance-to-informal`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.status()).toEqual(403);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findObject(Predicates.dutchLanguageVariant).getValue()).toEqual(Language.FORMAL);
        expect(notUpdatedInstance.findObject(Predicates.needsConversionFromFormalToInformal).getValue()).toEqual("1");
    });

});