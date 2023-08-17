import {expect, test} from '@playwright/test';
import fs from 'fs';
import {loginAsPepingen, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {deleteAll} from "../test-helpers/sparql";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {Language} from "../test-helpers/language";
import {Predicates, TripleArray} from "../test-helpers/triple-array";
import {FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";

const CONTENT_FORM_ID = 'cd0b5eba-33c1-45d9-aed9-75194c3728d3';
const CHARACTERISTICS_FORM_ID = '149a7247-0294-44a5-a281-0a4d3782b4fd';

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});

test('Can get content form for concept', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(concept.getSubject().getValue());
    const triplesWithoutUUID = new TripleArray(concept.getTriples().filter(triple => triple.predicate !== Predicates.uuid)).asStringArray();
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
    // TODO check if meta field contains the right content
});

test('Can get characteristics form for concept', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CHARACTERISTICS_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/characteristics/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(concept.getSubject().getValue());
    const triplesWithoutUUID = new TripleArray(concept.getTriples().filter(triple => triple.predicate !== Predicates.uuid)).asStringArray();
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
});

test('Can get content form for public service', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    // TODO: create public service with all fields (evidence, requirements, procedure, contactPoints, attachments, ...)
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withNoPublicationMedium()
        .buildAndPersist(request, pepingenId);

    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(publicService.getSubject().getValue());
    const triplesWithoutUUID = new TripleArray(publicService.getTriples().filter(triple => triple.predicate !== Predicates.uuid)).asStringArray();
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
});

test('Can get characteristics form for public service', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withNoPublicationMedium()
        .buildAndPersist(request, pepingenId);

    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.getUUID()}/form/${CHARACTERISTICS_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync('../config/lpdc-management/characteristics/form.ttl', 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(publicService.getSubject().getValue());
    const triplesWithoutUUID = new TripleArray(publicService.getTriples().filter(triple => triple.predicate !== Predicates.uuid)).asStringArray();
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
});

test('English form is only added when publicationMedium is yourEurope and form is content', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withPublicationMedium('YourEurope')
        .buildAndPersist(request, pepingenId);

    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    const expectedEnglishForm = fs.readFileSync('../config/lpdc-management/content/add-english-requirement.ttl', 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm + expectedEnglishForm);
});


test('When getting content form for public service than form language is replaced to language of public service', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withTitle('Instance title', Language.FORMAL)
        .withDescription('Instance description', Language.FORMAL)
        .buildAndPersist(request, pepingenId);


    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm);
});

const chosenForms: ('formal' | 'informal')[] = ['formal', 'informal'];
for (const chosenForm of chosenForms) {
    test(`When getting content form for public service only has no language then chosenform(${chosenForm}) is used in form`, async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withNoTitle()
            .withNoDescription()
            .buildAndPersist(request, pepingenId);

        await FormalInformalChoiceTestBuilder.aChoice()
            .withChosenForm(chosenForm)
            .buildAndPersist(request);

        const response = await request.get(`http://localhost:91/lpdc-management/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
        expect(response.ok()).toBeTruthy();

        const expectedForm = fs.readFileSync(`${__dirname}/form-${chosenForm}.ttl`, 'utf8');
        const responseBody = await response.json();
        expect(responseBody.form).toStrictEqual(expectedForm);
    });

    test(`When getting content form for public service only has english language then chosenform(${chosenForm}) is used in form`, async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withTitle('english title', Language.EN)
            .withDescription('english description', Language.EN)
            .buildAndPersist(request, pepingenId);

        await FormalInformalChoiceTestBuilder.aChoice()
            .withChosenForm(chosenForm)
            .buildAndPersist(request);

        const response = await request.get(`http://localhost:91/lpdc-management/${publicService.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
        expect(response.ok()).toBeTruthy();

        const expectedForm = fs.readFileSync(`${__dirname}/form-${chosenForm}.ttl`, 'utf8');
        const responseBody = await response.json();
        expect(responseBody.form).toStrictEqual(expectedForm);
    });
}

function parseToSortedTripleArray(source: string) {
    return source
        .split('\r\n')
        .map(triple => triple.trim())
        .map(triple => triple.replaceAll(`"""`, `"`))
        .sort();
}
