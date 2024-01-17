import {APIRequestContext, expect, test} from "@playwright/test";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {loginAsPepingen} from "../test-helpers/login";
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

        const response = await getConceptLanguageVersion(request, concept.getUUID())

        const expectedConceptLanguageVersion = {
            [ChosenForm.FORMAL]: 'nl',
            [ChosenForm.INFORMAL]: 'nl-be-x-generated-informal'
        };

        expect(response.languageVersion).toEqual(expectedConceptLanguageVersion[chosenForm]);
    });
}

async function getConceptLanguageVersion(request: APIRequestContext, conceptUUID: string) {
    const loginResponse = await loginAsPepingen(request);
    const response = await request.get(`${dispatcherUrl}/lpdc-management/conceptual-public-services/${conceptUUID}/language-version`, {headers: {cookie: loginResponse.cookie}});
    expect(response.ok()).toBeTruthy();
    return response.json();
}
