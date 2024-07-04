import {expect, test} from "@playwright/test";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {dispatcherUrl} from "../test-helpers/test-options";
import {Predicates, Uri} from "../test-helpers/triple-array";
import {ChosenForm, FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";
import {InstanceStatus} from "../test-helpers/codelists";
import {Language} from "../test-helpers/language";
import {fetchType} from "../test-helpers/sparql";
import moment from "moment";
import {PublishedPublicServiceTestBuilder} from "../test-helpers/published-public-service.test-builder";

test.describe('confirm instance is already informal', () => {

    test('should transform instance language strings to informal and set dutchLanguageVariant to informal and republish', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        await FormalInformalChoiceTestBuilder.aChoice()
            .withBestuurseenheid(pepingenId)
            .withChosenForm(ChosenForm.INFORMAL)
            .buildAndPersist(request)

        const sendDate = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withTitle('Instance title', Language.FORMAL)
            .withDescription('Instance description', Language.FORMAL)
            .withDateSent(sendDate)
            .withInstanceStatus(InstanceStatus.verzonden)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withSpatial(new Uri('http://data.europa.eu/nuts/code/BE24224001'))
            .buildAndPersist(request, pepingenId);

        await PublishedPublicServiceTestBuilder.aMinimalPublishedService()
            .withGeneratedAtTime(sendDate)
            .withIsPublishedVersionOf(instance.getId())
            .withDatePublished(new Date())
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/confirm-instance-is-already-informal`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findObject(Predicates.dutchLanguageVariant).getValue()).toEqual(Language.INFORMAL);
        expect(updatedInstance.findObject(Predicates.needsConversionFromFormalToInformal).getValue()).toEqual("0");
    });

    test('confirm instance is already informal without login, returns http 401 Unauthorized', async ({request}) => {
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withDateSent(moment().subtract(1, 'minute'))
            .withInstanceStatus(InstanceStatus.verzonden)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/confirm-instance-is-already-informal`, {
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

    test('confirm instance with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withDateSent(moment().subtract(1, 'minute'))
            .withInstanceStatus(InstanceStatus.verzonden)
            .withNeedsConversionFromFormalToInformal(true)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/confirm-instance-is-already-informal`, {
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