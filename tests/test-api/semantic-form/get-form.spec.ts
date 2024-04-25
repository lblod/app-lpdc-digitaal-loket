import {expect, test} from '@playwright/test';
import fs from 'fs';
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {deleteAll} from "../test-helpers/sparql";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {Language} from "../test-helpers/language";
import {TripleArray, Uri} from "../test-helpers/triple-array";
import {dispatcherUrl} from "../test-helpers/test-options";
import {TestDataFactory} from "../test-helpers/test-data-factory";

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});


test.describe('Loading forms for concepts', () => {

    test('Can get content form for concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withTitle('Concept title', Language.NL)
            .withDescription('Concept description', Language.NL)
            .buildAndPersist(request);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        const expectedForm = fs.readFileSync(`${__dirname}/form-nl.ttl`, 'utf8');
        expect(responseBody.form).toStrictEqual(expectedForm);
        expect(responseBody.serviceUri).toStrictEqual(concept.getSubject().getValue());
        const triplesWithoutUuidAndhasLatestFunctionalChange = new TripleArray(concept.getTriples()).asStringArray();
        expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUuidAndhasLatestFunctionalChange.sort());
    });

    test('Can get characteristics form for concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withTitle('Concept title', Language.NL)
            .withDescription('Concept description', Language.NL)
            .buildAndPersist(request);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/eigenschappen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        const expectedForm = fs.readFileSync(`${__dirname}/form-characteristics.ttl`, 'utf8');
        expect(responseBody.form).toStrictEqual(expectedForm);
        expect(responseBody.serviceUri).toStrictEqual(concept.getSubject().getValue());
        const triplesWithoutUuidAndhasLatestFunctionalChange = new TripleArray(concept.getTriples()).asStringArray();
        expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUuidAndhasLatestFunctionalChange.sort());
    });

    test('Can get content form for full concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const {concept, triples} = await new TestDataFactory().createFullConcept(request);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        const triplesWithoutUuidAndHasLatestFunctionalChange = new TripleArray(triples).asStringArray();
        expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUuidAndHasLatestFunctionalChange.sort());
    });

    test('When trying to get content form for concept when user is not logged in, returns http 401 Unauthenticated', async ({request}) => {
        const concept = await ConceptTestBuilder.aConcept()
            .withTitle('Concept title', Language.NL)
            .withDescription('Concept description', Language.NL)
            .buildAndPersist(request);

        const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: undefined}});
        expect(apiResponse.status()).toEqual(401);
    });

    test('When trying to get content form for concept when user has no rights on lpdc, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withTitle('Concept title', Language.NL)
            .withDescription('Concept description', Language.NL)
            .buildAndPersist(request);

        const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(apiResponse.status()).toEqual(403);
    });

});

test.describe('Loading forms for instances', () => {

    test('Can get content form for public service', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withDutchLanguageVariant(Language.INFORMAL)
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const expectedForm = fs.readFileSync(`${__dirname}/form-informal.ttl`, 'utf8');
        const responseBody = await response.json();
        expect(responseBody.form).toStrictEqual(expectedForm);
        expect(responseBody.serviceUri).toStrictEqual(publicService.getSubject().getValue());
        const triplesWithoutUUID = new TripleArray(publicService.getTriples()).asStringArray();
        expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
    });

    test('Can get characteristics form for public service', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .withCreatedBy(pepingenId)
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/eigenschappen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const expectedForm = fs.readFileSync(`${__dirname}/form-characteristics.ttl`, 'utf8');
        const responseBody = await response.json();
        expect(responseBody.form).toStrictEqual(expectedForm);
        expect(responseBody.serviceUri).toStrictEqual(publicService.getSubject().getValue());
        const triplesWithoutUUID = new TripleArray(publicService.getTriples()).asStringArray();
        expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
    });

    test('When getting characteristics form then meta field contains codelist of all bestuurseenheden', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService().buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/eigenschappen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        const expectedMeta = fs.readFileSync(`${__dirname}/meta.txt`, 'utf8');
        expect(parseToSortedTripleArray(responseBody.meta)).toEqual(parseToSortedTripleArray(expectedMeta, '\n'));
    });

    test('Can get content form for full public service', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const {publicService, triples} = await new TestDataFactory().createFullPublicService(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        const triplesWithoutUUID = new TripleArray(triples).asStringArray();
        expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
        //TODO LPDC-917: this test fails if the date time in micros is exactly 000; then it gets stripped in the json output (we should verify if this then also fails in the application itself)
    });

    test('When getting content form for public service then form language is replaced to language of public service', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withTitle('Instance title', Language.FORMAL)
            .withDescription('Instance description', Language.FORMAL)
            .withDutchLanguageVariant(Language.FORMAL)
            .buildAndPersist(request, pepingenId);


        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
        const responseBody = await response.json();
        expect(responseBody.form).toStrictEqual(expectedForm);
    });


    test('When retrieving an instance that has all types of Bevoegde Overheid filled in we want to see all these types', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const ocmwUri = new Uri('http://data.lblod.info/id/bestuurseenheden/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18');
        const politieZoneUri = new Uri('http://data.lblod.info/id/bestuurseenheden/7cb2089a8c6746d514711908abfd38414a2b01f6ad9a83f28be2e835888b3da7');
        const ocmwVerenigingUri = new Uri('http://data.lblod.info/id/bestuurseenheden/cce1926b-51ff-4b66-a702-ea985f1d250b');
        const agbUri = new Uri('http://data.lblod.info/id/bestuurseenheden/5b6b1771d90a683e65f3473ea76c0d37d80d08a8647fd96783eda9af179a8115');
        const gemeenteUri = new Uri('http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589');
        const opdrachthoudendeVerenigingUri = new Uri('http://data.lblod.info/id/bestuurseenheden/b090b8f36088e8d98a4d1f9ebf43191cefa2b9f84387aa4821835a7b233d2579');
        const autonoomProvincieBedrijfUri = new Uri('http://data.lblod.info/id/bestuurseenheden/59a00f5bf4b00f2bc64c72d3d3a2d645e0659a662f4daca943995cbf2625138d');
        const projectVerenigingUri = new Uri('http://data.lblod.info/id/bestuurseenheden/4f4fb74c49f5d68b4d2e4875bc7daf7f25a565748f89b49e37e41d12ff474f00');
        const dienstverlenendeVerenigingUri = new Uri('http://data.lblod.info/id/bestuurseenheden/71dc3947-975f-4540-bd50-1f50f29d7567');
        const hulpverleningszoneUri = new Uri('http://data.lblod.info/id/bestuurseenheden/b3e202bf5ab9d30f1928f7a1ea8911c60da595819774702eb1745e83c25cf106');
        const provincieUri = new Uri('http://data.lblod.info/id/bestuurseenheden/8b7e7bf05ace5bb1a68f5bc0d870e20c20f147b00bd9a3dcce3a01733d4da744');
        const districtUri = new Uri('http://data.lblod.info/id/bestuurseenheden/fb56bc40ce36390d2f12fc2057c89d4b6bc5b3217eabd41995b6401318ff648a');

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withCompetentAuthority([
                ocmwUri,
                politieZoneUri,
                ocmwVerenigingUri,
                agbUri,
                gemeenteUri,
                opdrachthoudendeVerenigingUri,
                autonoomProvincieBedrijfUri,
                projectVerenigingUri,
                dienstverlenendeVerenigingUri,
                hulpverleningszoneUri,
                provincieUri,
                districtUri
            ])
            .buildAndPersist(request, pepingenId);

        const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${gemeenteUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${provincieUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${ocmwUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${politieZoneUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${ocmwVerenigingUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${agbUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${opdrachthoudendeVerenigingUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${autonoomProvincieBedrijfUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${projectVerenigingUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${dienstverlenendeVerenigingUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${hulpverleningszoneUri} .`);
        expect(parseToSortedTripleArray(responseBody.source)).toContain(`${publicService.getSubject()} <http://data.europa.eu/m8g/hasCompetentAuthority> ${districtUri} .`);

    });

    test('When trying to get content form for public service when user is not logged in, returns http 401 Unauthenticated', async ({request}) => {
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: undefined}});
        expect(apiResponse.status()).toEqual(401);
    });

    test('When trying to get content form for public service when user has no rights on lpdc, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoPublicationMedium()
            .buildAndPersist(request, pepingenId);

        const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(publicService.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
        expect(apiResponse.status()).toEqual(403);
    });

});

function parseToSortedTripleArray(source: string, split = '\r\n') {
    return source
        .split(split)
        .map(triple => triple.trim())
        .map(triple => triple.replaceAll(`"""`, `"`))
        .map(triple => triple.replaceAll(`\t`, ` `))
        .sort();
}
