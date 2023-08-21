import {expect, test} from "@playwright/test";
import fs from "fs";
import {loginAsPepingen} from "../test-helpers/login";
import {ChosenForm, FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";
import {deleteAll} from "../test-helpers/sparql";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {Language} from "../test-helpers/language";

const CONTENT_FORM_ID = 'cd0b5eba-33c1-45d9-aed9-75194c3728d3';

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});

test('When chosenForm informal and concept in unknown version then language in form should be @nl-be-x-generated-informal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ]).buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-generated-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in unknown versions then language in form should be @nl', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in unknown versions then language in form should be @nl', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept in informal version then language in form should be @nl-be-x-informal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.INFORMAL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in informal version then language in form should be @nl-be-x-generated-formal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.INFORMAL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-generated-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in informal version then language in form should be @nl-be-x-generated-formal', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.INFORMAL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-generated-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept in formal version then language in form should be @nl-be-x-generated-informal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-generated-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in formal version then language in form should be @nl-be-x-formal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in formal version then language in form should be @nl-be-x-formal', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept in both version then language in form should be @nl-be-x-informal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in both versions then language in form should be @nl-be-x-formal', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in both versions then language in form should be @nl-be-x-formal', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept only in nl version then language in form should be @nl', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept only in nl then language in form should be @nl', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`http://localhost:91/lpdc-management/${concept.getUUID()}/form/${CONTENT_FORM_ID}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync('../config/lpdc-management/content/form.ttl', 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept only in nl then language in form should be @nl', async ({request}) => {
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
});