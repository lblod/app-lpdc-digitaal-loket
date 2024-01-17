import {APIRequestContext, expect, test} from "@playwright/test";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession} from "../test-helpers/login";
import {ChosenForm, FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";
import {deleteAll} from "../test-helpers/sparql";
import {dispatcherUrl} from "../test-helpers/test-options";

test.beforeEach(async ({request}) => {
   await deleteAll(request);
});

for (const chosenForm of [ChosenForm.FORMAL, ChosenForm.INFORMAL]) {
    test(`Get Concept language version: Should return language version of concept for chosenForm ${chosenForm}`, async ({request}) => {
        await FormalInformalChoiceTestBuilder.aChoice()
            .withChosenForm(chosenForm)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const loginResponse = await loginAsPepingen(request);
        const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${concept.getUUID()}/language-version`, {headers: {cookie: loginResponse.cookie}});
        expect(apiResponse.ok()).toBeTruthy();
        const response = await apiResponse.json();

        const expectedConceptLanguageVersion = {
            [ChosenForm.FORMAL]: 'nl',
            [ChosenForm.INFORMAL]: 'nl-be-x-generated-informal'
        };

        expect(response.languageVersion).toEqual(expectedConceptLanguageVersion[chosenForm]);
    });
}

test(`Get Concept language version: Should return http 401 Unauthorized without login`, async ({request}) => {
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .buildAndPersist(request);

    const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${concept.getUUID()}/language-version`, {headers: {cookie: undefined}});
    expect(apiResponse.status()).toEqual(401);
});

test(`Get Concept language version: Should return http 403 Forbidden with a user that has no access rights`, async ({request}) => {
    const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .buildAndPersist(request);

    const apiResponse = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${concept.getUUID()}/language-version`, {headers: {cookie: loginResponse.cookie}});
    expect(apiResponse.status()).toEqual(403);
});


