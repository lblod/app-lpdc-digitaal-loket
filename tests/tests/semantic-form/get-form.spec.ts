import {expect, test} from '@playwright/test';
import fs from 'fs';
import {loginAsPepingen, pepingenId} from "../test-helpers/login";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {deleteAllOfType} from "../test-helpers/sparql";
import {ConceptTestBuilder, ConceptType} from "../test-helpers/concept.test-builder";
import {Language} from "../test-helpers/language";

const CONTENT_FORM_ID = 'cd0b5eba-33c1-45d9-aed9-75194c3728d3';
const CHARACTERISTICS_FORM_ID = '149a7247-0294-44a5-a281-0a4d3782b4fd';

test.beforeEach(async ({request}) => {
    await deleteAllOfType(request, ConceptType);
    await deleteAllOfType(request, 'http://purl.org/vocab/cpsv#PublicService');
});

test('Can get content form for concept', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.uuid.value}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(concept.id);
    const triplesWithoutUUID = concept.triples.filter(triple => !triple.includes('<http://mu.semte.ch/vocabularies/core/uuid>'));
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
    // TODO check if meta field contains the right content
});

test('Can get characteristics form for concept', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.uuid.value}/form/${CHARACTERISTICS_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/characteristics/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(concept.id);
    const triplesWithoutUUID = concept.triples.filter(triple => !triple.includes('<http://mu.semte.ch/vocabularies/core/uuid>'));
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
});

test('Can get content form for public service', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    // TODO: create public service with all fields (evidence, requirements, procedure, contactPoints, attachments, ...)
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withNoPublicationMedium()
        .buildAndPersist(request, pepingenId);

    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.uuid.value}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(publicService.id);
    const triplesWithoutUUID = publicService.triples.filter(triple => !triple.includes('<http://mu.semte.ch/vocabularies/core/uuid>'));
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
});

test('Can get characteristics form for public service', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withNoPublicationMedium()
        .buildAndPersist(request, pepingenId);

    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.uuid.value}/form/${CHARACTERISTICS_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync('../config/lpdc-management/characteristics/form.ttl', 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm);
    expect(responseBody.serviceUri).toStrictEqual(publicService.id);
    const triplesWithoutUUID = publicService.triples.filter(triple => !triple.includes('<http://mu.semte.ch/vocabularies/core/uuid>'));
    expect(parseToSortedTripleArray(responseBody.source)).toStrictEqual(triplesWithoutUUID.sort());
});

test('English form is only added when publicationMedium is yourEurope and form is content', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const publicService = await PublicServiceTestBuilder.aPublicService()
        .withPublicationMedium('YourEurope')
        .buildAndPersist(request, pepingenId);

    const response = await request.get(`http://localhost:91/lpdc-management/${publicService.uuid.value}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    const expectedEnglishForm = fs.readFileSync('../config/lpdc-management/content/add-english-requirement.ttl', 'utf8');
    const responseBody = await response.json();
    expect(responseBody.form).toStrictEqual(expectedForm + expectedEnglishForm);
});

function parseToSortedTripleArray(source: string) {
    return source
        .split('\r\n')
        .map(triple => triple.trim())
        .map(triple => triple.replaceAll(`"""`, `"`))
        .sort();
}
