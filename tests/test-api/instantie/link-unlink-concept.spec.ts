import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {
    bilzenId,
    loginAsPepingen,
    loginAsPepingenButRemoveLPDCRightsFromSession,
    pepingenId
} from "../test-helpers/login";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchType} from "../test-helpers/sparql";
import {Predicates, Uri} from "../test-helpers/triple-array";
import {
    ConceptDisplayConfigurationTestBuilder,
    ConceptDisplayConfigurationType
} from "../test-helpers/concept-display-configuration.test-builder";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {v4 as uuid} from "uuid";
import {ReviewStatus} from "../test-helpers/codelists";

test.describe('unlink', () => {

    test('unlink a concept from an instance, should remove the source triple from instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);
    });

    test('unlink a concept from an instance, should remove hasVersionedSource triple from instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);
    });

    test('unlink a concept from an instance, should remove reviewStatus conceptUpdated if exists', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withVersionedSource(conceptSnapshot.getSubject())
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.reviewStatus)).toEqual([]);
    });

    test('unlink a concept from an instance, should remove reviewStatus conceptArchived if exists', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withVersionedSource(conceptSnapshot.getSubject())
            .withReviewStatus(ReviewStatus.conceptArchived)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.reviewStatus)).toEqual([]);
    });

    test('unlink a concept from an instance, both source and versionedSource on instance should be removed', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);
        const first = new Date(2023, 1, 12);

        const conceptSnapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withGeneratedAtTime(first)
            .withIsVersionOf(conceptId)
            .buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(conceptSnapshot1.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withVersionedSource(conceptSnapshot1.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);
    });

    test('unlink a concept from an instance, already unlinked', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);

    });

    test('unlink a concept from an instance, should update modified date of instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withModified(modified)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.modified)).toHaveLength(1);
        expect(updatedInstance.findTriple(Predicates.modified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('unlink a concept from an instance, should update the isInstantiated flag of displayConfiguration to false, if no other instance from the same bestuurseenheid is linked to this concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const displayConfigurationPepingen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(true)
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const displayConfigurationBilzen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(true)
            .withBestuurseenheid(bilzenId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withConceptDisplayConfigurations([
                displayConfigurationPepingen.getSubject(),
                displayConfigurationBilzen.getSubject(),
            ])
            .buildAndPersist(request);

        const instanceFromPepingen = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, bilzenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

        const updatedDisplayConfigurationBilzen = await fetchType(request, displayConfigurationBilzen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationBilzen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });

    test('unlink a concept from an instance, the isInstantiated flag of displayConfiguration should remain true, if one or more instances are linked to this concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const displayConfigurationPepingen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(true)
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const displayConfigurationBilzen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(true)
            .withBestuurseenheid(bilzenId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withConceptDisplayConfigurations([
                displayConfigurationPepingen.getSubject(),
                displayConfigurationBilzen.getSubject()
            ])
            .buildAndPersist(request);

        const instanceFromPepingen = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, bilzenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

        const updatedDisplayConfigurationBilzen = await fetchType(request, displayConfigurationBilzen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationBilzen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')
    });

    test('unlink a concept from an instance without a concept, the isInstantiated flag of displayConfiguration should remain true, and no error is thrown', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const displayConfigurationPepingen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(false)
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const instanceFromPepingen = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

        const response2 = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response2.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen2 = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen2.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

    });

    test('unlink a concept without login returns http 401 Unauthorized', async ({request}) => {
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: undefined}});
        expect(response.status()).toEqual(401);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findAllTriples(Predicates.source)).toHaveLength(1);
    });

    test('unlink a concept with a user that has no access rights on lpdc returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: loginResponse.cookie}});
        expect(response.status()).toEqual(403);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findAllTriples(Predicates.source)).toHaveLength(1);
    });
});

test.describe('link', () => {

    test('link a concept with an instance, should add the source triple', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toHaveLength(1);
        expect(updatedInstance.findAllTriples(Predicates.source)[0].object.getValue()).toBe(concept.getSubject().getValue());
    });

    test('link a concept to an instance, should add hasVersionedSource triple', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withIsVersionOf(conceptId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toHaveLength(1);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)[0].object.getValue()).toEqual(conceptSnapshot.getSubject().getValue());
    });

    test('link a concept to an instance, should update modified date of instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withModified(modified)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.modified)).toHaveLength(1);
        expect(updatedInstance.findTriple(Predicates.modified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('link a concept to an instance, should update the isInstantiated flag of displayConfiguration to true', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const displayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(false)
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withConceptDisplayConfigurations([
                displayConfiguration.getSubject(),
            ])
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfiguration = await fetchType(request, displayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfiguration.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });

    test('link a concept to an instance, should update the isNewConcept flag of displayConfiguration to false', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const displayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptIsNew(true)
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withConceptDisplayConfigurations([
                displayConfiguration.getSubject(),
            ])
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfiguration = await fetchType(request, displayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfiguration.findTriple(Predicates.conceptIsNew).getObjectValue()).toEqual('false')

    });

    test('link a concept to an instance that is already linked to a concept, should update the source triple to the new concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptOld = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const conceptNew = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptOld.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${conceptNew.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toHaveLength(1);
        expect(updatedInstance.findAllTriples(Predicates.source)[0].subject.getValue()).toBe(instance.getSubject().getValue())
        expect(updatedInstance.findAllTriples(Predicates.source)[0].object.getValue()).toBe(conceptNew.getSubject().getValue())
    });

    test('link a concept with an instance without login, returns http 401 Unauthorized', async ({request}) => {
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: undefined}});
        expect(response.status()).toEqual(401);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findAllTriples(Predicates.source)).toHaveLength(0);
    });

    test('link a concept with an instance with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: loginResponse.cookie}});
        expect(response.status()).toEqual(403);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findAllTriples(Predicates.source)).toHaveLength(0);
    });
});

