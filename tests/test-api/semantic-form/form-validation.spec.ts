import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {loginAsPepingen, pepingenId} from "../test-helpers/login";
import {Uri} from "../test-helpers/triple-array";
import {ContactPointTestBuilder} from "../test-helpers/contact-point-test.builder";
import {AddressTestBuilder} from "../test-helpers/address.test-builder";

test(`Submit form: validate publicService valid form`, async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(response.ok(), `Error ${response.status()}, ${await response.text()}`).toBeTruthy();
});

test(`Submit form: validate publicService invalid form - competentAutority is required`, async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .buildAndPersist(request, pepingenId);

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(response.status()).toEqual(400);
    expect(await response.json()).toEqual({
        data: {
            errors: [{
                formId: "149a7247-0294-44a5-a281-0a4d3782b4fd",
                formUri: "http://data.lblod.info/id/forms/149a7247-0294-44a5-a281-0a4d3782b4fd",
                message: "Er zijn fouten opgetreden in de tab \"eigenschappen\". Gelieve deze te verbeteren!",
            }]
        }
    });
});

test(`Submit form: validate publicService with valid address`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

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

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(response.ok(), `Error ${response.status()}, ${await response.text()}`).toBeTruthy();
});

test(`Submit form: validate publicService with invalid address`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

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

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(response.status()).toEqual(400);
    expect(await response.json()).toEqual({
        data: {
            errors: [{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!",
            }]
        }
    });
});

test(`Submit form: validate publicService with address that has not enough fields filled in to validate`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

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

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(response.status()).toEqual(400);
    expect(await response.json()).toEqual({
        data: {
            errors: [{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!",
            }]
        }
    });
});

test(`Submit form: validate publicService with multiple address - both valid`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const address1 = await AddressTestBuilder.anEmptyAddress()
        .withGemeente('Pepingen')
        .withStraat('Ninoofsesteenweg')
        .withHuisnummer('116')
        .withPostcode('1670')
        .withLand('België')
        .buildAndPersist(request, pepingenId);

    const address2 = await AddressTestBuilder.anEmptyAddress()
        .withGemeente('Aarschot')
        .withStraat('Kerkstraat')
        .withHuisnummer('2')
        .withPostcode('3200')
        .withLand('België')
        .buildAndPersist(request, pepingenId);

    const contactPoint1 = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(response.ok).toBeTruthy();
});

test(`Submit form: validate publicService with multiple address - one invalid`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

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
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address2.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(await response.json()).toEqual({
        data: {
            errors: [{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!"
            }]
        }
    });
});

test(`Submit form: validate publicService with multiple address - both invalid`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

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
        .withAddress(address1.getSubject())
        .buildAndPersist(request, pepingenId);

    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withAddress(address2.getSubject())
        .buildAndPersist(request, pepingenId);

    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/24001'))
        .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
        .buildAndPersist(request, pepingenId);

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(await response.json()).toEqual({
        data: {
            errors: [{
                formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!"
            }]
        }
    });
});

test(`Submit form: validate publicService with several errors on inhoud tab`, async ({request}) => {
    const cookie = await loginAsPepingen(request);

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

    const response = await request.post(`${dispatcherUrl}/lpdc-management/${publicService.getUUID()}/submit`, {headers: {cookie: cookie}});

    expect(await response.json()).toEqual({
        data: {
            errors: [
                {
                    formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                    formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                    message: "Minstens één van de adressen is niet geldig, Gelieve deze te verbeteren!",
                },
                {
                    formId: "cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                    formUri: "http://data.lblod.info/id/forms/cd0b5eba-33c1-45d9-aed9-75194c3728d3",
                    message: `Er zijn fouten opgetreden in de tab "inhoud". Gelieve deze te verbeteren!`
                }
            ]
        }
    });
});

