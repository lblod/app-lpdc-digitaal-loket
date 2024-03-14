import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {Uri} from "../test-helpers/triple-array";
import {ContactPointTestBuilder} from "../test-helpers/contact-point-test.builder";
import {AddressTestBuilder} from "../test-helpers/address.test-builder";

test(`Submit form: validate publicService valid form`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([]);
});

test(`Submit form: validate publicService invalid form - competentAutority is required`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([{
        formId: "149a7247-0294-44a5-a281-0a4d3782b4fd",
        formUri: "http://data.lblod.info/id/forms/149a7247-0294-44a5-a281-0a4d3782b4fd",
        message: "Er zijn fouten opgetreden in de tab \"eigenschappen\". Gelieve deze te verbeteren!",
    }]);
});

test(`Submit form: validate publicService with valid address`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address = await AddressTestBuilder.anAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('116')
        .withPostcode('1670')
        .withLand('België')
        .withAddressregisterId('https://data.vlaanderen.be/id/adres/659808')
        .buildAndPersist(request, pepingenId);

    const contactPoint = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint.getSubject())
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.ok(), `Error ${response.status()}, ${await response.text()}`).toBeTruthy();
});

test(`Submit form: validate publicService with invalid address`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address = await AddressTestBuilder.anEmptyAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('xxx')
        .buildAndPersist(request, pepingenId);

    const contactPoint = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint.getSubject())
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([{
        message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!",
    }]);
});

test(`Submit form: validate publicService with address that has not enough fields filled in to validate`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address = await AddressTestBuilder.anEmptyAddress()
        .buildAndPersist(request, pepingenId);

    const contactPoint = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint.getSubject())
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([{
        message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!",
    }]);
});

test(`Submit form: validate publicService with multiple address - both valid`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address1 = await AddressTestBuilder.anAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('116')
        .withPostcode('1670')
        .withLand('België')
        .buildAndPersist(request, pepingenId);

    const contactPoint1 = await ContactPointTestBuilder.aContactPoint()
        .withOrder(1)
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withOrder(2)
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.ok()).toBeTruthy();
});

test(`Submit form: validate publicService with multiple address - one invalid`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address1 = await AddressTestBuilder.anEmptyAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('116')
        .withPostcode('1670')
        .withLand('België')
        .buildAndPersist(request, pepingenId);

    const address2 = await AddressTestBuilder.anEmptyAddress()
        .buildAndPersist(request, pepingenId);

    const contactPoint1 = await ContactPointTestBuilder.aContactPoint()
        .withOrder(1)
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withOrder(2)
        .withAddress(address2.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([{
        message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!"
    }]);
});

test(`Submit form: validate publicService with multiple address - both invalid`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address1 = await AddressTestBuilder.anEmptyAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('xxx')
        .withPostcode('1670')
        .withLand('België')
        .buildAndPersist(request, pepingenId);

    const address2 = await AddressTestBuilder.anEmptyAddress()
        .buildAndPersist(request, pepingenId);

    const contactPoint1 = await ContactPointTestBuilder.aContactPoint()
        .withOrder(1)
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withOrder(2)
        .withAddress(address2.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([{
        message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!"
    }]);
});

test(`Submit form: validate publicService with errors on inhoud tab and invalid address show first only form error`, async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const address = await AddressTestBuilder.anEmptyAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('xxx')
        .withPostcode('1670')
        .withLand('België')
        .buildAndPersist(request, pepingenId);

    const contactPoint = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withNoTitle()
        .withContactPoint(contactPoint.getSubject())
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual([
        {
            formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
            formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
            message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
        }]);
});

test(`Submit form: validate publicService valid form when user is not logged in, returns http 401 Unauthenticated`, async ({request}) => {
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const apiResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: undefined}});

    expect(apiResponse.status()).toEqual(401);
});

test(`Submit form: validate publicService valid form when user has no rights on lpdc, returns http 403 Forbidden`, async ({request}) => {
    const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const apiResponse = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/validate-for-publish`, {headers: {cookie: loginResponse.cookie}});

    expect(apiResponse.status()).toEqual(403);
});
