import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession} from "../test-helpers/login";
import {Predicates, Uri} from "../test-helpers/triple-array";
import {v4 as uuid} from "uuid";
import {
    ConceptDisplayConfigurationTestBuilder,
    ConceptDisplayConfigurationType
} from "../test-helpers/concept-display-configuration.test-builder";
import {fetchType} from "../test-helpers/sparql";

test('remove concept is new', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    const conceptDisplayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConceptIsNew(false)
        .buildAndPersist(request);

    const apiResponse = await request.put(`${dispatcherUrl}/lpdc-management/concept-display-configuration/${encodeURIComponent(conceptDisplayConfiguration.getId().getValue())}/remove-is-new-flag`, {headers: {cookie: loginResponse.cookie}});
    expect(apiResponse.ok(), `${apiResponse.statusText()}`).toBeTruthy();

    const updatedConceptDisplayConfig = await fetchType(request, conceptDisplayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
    expect(updatedConceptDisplayConfig.findTriple(Predicates.conceptIsNew).getObjectValue()).toEqual("false");
});

test('When user not logged in, returns http 401 Unauthorized', async({request}) => {
    const conceptDisplayConfigurationId = new Uri(`"http://data.lblod.info/id/conceptual-display-configuration/${uuid()}`);
    const apiResponse = await request.put(`${dispatcherUrl}/lpdc-management/concept-display-configuration/${conceptDisplayConfigurationId}/remove-is-new-flag`, {headers: {cookie: undefined}});
    expect(apiResponse.status()).toEqual(401);
});

test('When user has no access rights, returns http 403 Forbidden', async({request}) => {
    const conceptDisplayConfigurationId = new Uri(`"http://data.lblod.info/id/conceptual-display-configuration/${uuid()}`);
    const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
    const apiResponse = await request.put(`${dispatcherUrl}/lpdc-management/concept-display-configuration/${conceptDisplayConfigurationId}/remove-is-new-flag`, {headers: {cookie: loginResponse.cookie}});
    expect(apiResponse.status()).toEqual(403);
});
