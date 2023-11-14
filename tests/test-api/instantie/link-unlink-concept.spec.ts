import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {bilzenId, loginAsPepingen, pepingenId} from "../test-helpers/login";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchType} from "../test-helpers/sparql";
import {Predicates} from "../test-helpers/triple-array";
import {
    ConceptDisplayConfigurationTestBuilder,
    ConceptDisplayConfigurationType
} from "../test-helpers/concept-display-configuration.test-builder";

test.describe('unlink', () => {

    test('unlink a concept from an instance, should remove the source triple from instance', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
    });

    test('unlink a concept from an instance, should update modified date of instance', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withModified(modified)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/ontkoppelen`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.modified)).toHaveLength(1);
        expect(updatedInstance.findTriple(Predicates.modified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('unlink a concept from an instance, should update the isInstantiated flag of displayConfiguration to false, if no other instance from the same bestuurseenheid is linked to this concept', async ({request}) => {
        const cookie = await loginAsPepingen(request);
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

        const instanceFromBilzen = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, bilzenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

        const updatedDisplayConfigurationBilzen = await fetchType(request, displayConfigurationBilzen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationBilzen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });

    test('unlink a concept from an instance, the isInstantiated flag of displayConfiguration should remain true, if one or more instances are linked to this concept', async ({request}) => {
        const cookie = await loginAsPepingen(request);
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

        const instanceFromPepingen2 = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, pepingenId);

        const instanceFromBilzen = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .buildAndPersist(request, bilzenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

        const updatedDisplayConfigurationBilzen = await fetchType(request, displayConfigurationBilzen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationBilzen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')
    });

    test('unlink a concept from an instance without a concept, the isInstantiated flag of displayConfiguration should remain true, and no error is thrown', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const displayConfigurationPepingen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(false)
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const instanceFromPepingen = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

        const response2 = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instanceFromPepingen.getUUID()}/ontkoppelen`, {headers: {cookie: cookie}});
        expect(response2.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen2 = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen2.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

    });
});
test.describe('link', () => {

    test('link a concept with an instance, should add the source triple', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toHaveLength(1);
        expect(updatedInstance.findAllTriples(Predicates.source)[0].subject.getValue()).toBe(instance.getSubject().getValue())
        expect(updatedInstance.findAllTriples(Predicates.source)[0].object.getValue()).toBe(concept.getSubject().getValue())
    });

    test('link a concept to an instance, should update modified date of instance', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withModified(modified)
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.modified)).toHaveLength(1);
        expect(updatedInstance.findTriple(Predicates.modified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('link a concept to an instance, should update the isInstantiated flag of displayConfiguration to true', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const displayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withConceptDisplayConfigurations([
                displayConfiguration.getSubject(),
            ])
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfiguration = await fetchType(request, displayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfiguration.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });
    test('link a concept to an instance, should update the isNewConcept flag of displayConfiguration to false', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const displayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withBestuurseenheid(pepingenId)
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withConceptDisplayConfigurations([
                displayConfiguration.getSubject(),
            ])
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${concept.getUUID()}`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfiguration = await fetchType(request, displayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfiguration.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });


    test('link a concept to an instance that is already linked to a concept, should update the source triple to the new concept', async ({request}) => {
        const cookie = await loginAsPepingen(request);
        const conceptOld = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const conceptNew = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptOld.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/koppelen/${conceptNew.getUUID()}`, {headers: {cookie: cookie}});
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toHaveLength(1);
        expect(updatedInstance.findAllTriples(Predicates.source)[0].subject.getValue()).toBe(instance.getSubject().getValue())
        expect(updatedInstance.findAllTriples(Predicates.source)[0].object.getValue()).toBe(conceptNew.getSubject().getValue())
    });
});

