import {expect, test} from "@playwright/test";
import {loginAsPepingen} from "../test-helpers/login";
import {ChosenForm, FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";
import {deleteAll} from "../test-helpers/sparql";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {Language} from "../test-helpers/language";
import {dispatcherUrl} from "../test-helpers/test-options";
import fs from "fs";

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});

test('When chosenForm informal and concept in unknown version then language in form should be @nl-be-x-generated-informal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ]).buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-generated-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in unknown versions then language in form should be @nl', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-nl.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in unknown versions then language in form should be @nl', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-nl.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept in informal version then language in form should be @nl-be-x-informal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in informal version then language in form should be @nl-be-x-generated-formal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-generated-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in informal version then language in form should be @nl-be-x-generated-formal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.INFORMAL},
            {value: 'Concept title', language: Language.GENERATED_FORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-generated-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept in formal version then language in form should be @nl-be-x-generated-informal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-generated-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in formal version then language in form should be @nl-be-x-formal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in formal version then language in form should be @nl-be-x-formal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.GENERATED_INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept in both version then language in form should be @nl-be-x-informal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-informal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept in both versions then language in form should be @nl-be-x-formal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
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

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept in both versions then language in form should be @nl-be-x-formal', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'Concept title', language: Language.NL},
            {value: 'Concept title', language: Language.FORMAL},
            {value: 'Concept title', language: Language.INFORMAL},
        ])
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-formal.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm informal and concept only in nl version then language in form should be @nl', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-nl.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When chosenForm formal and concept only in nl then language in form should be @nl', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-nl.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});

test('When no chosenForm and concept only in nl then language in form should be @nl', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('Concept title', Language.NL)
        .withDescription('Concept description', Language.NL)
        .buildAndPersist(request);

    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${encodeURIComponent(concept.getId().getValue())}/form/inhoud`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    const expectedForm = fs.readFileSync(`${__dirname}/concept/concept-form-nl.ttl`, 'utf8');
    expect(responseBody.form).toStrictEqual(expectedForm);
});
