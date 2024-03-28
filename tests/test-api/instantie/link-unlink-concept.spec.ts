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
        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);
        const concept = await ConceptTestBuilder.aConcept()
            .withProductID('1000')
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('1000')
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                        cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                    }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);
    });

    test('unlink a concept from an instance, should remove hasVersionedSource triple from instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withProductID('1000')
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('1000')
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                        cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                    }
            }
        );
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);
    });

    test('unlink a concept from an instance, should remove reviewStatus conceptUpdated if exists', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withProductID('100')
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                        cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.reviewStatus)).toEqual([]);
    });

    test('unlink a concept from an instance, should remove reviewStatus conceptArchived if exists', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withProductID('100')
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .withReviewStatus(ReviewStatus.conceptArchived)
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.reviewStatus)).toEqual([]);
    });

    test('unlink a concept from an instance, both source and versionedSource on instance should be removed', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);
        const first = new Date(2023, 1, 12);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withGeneratedAtTime(first)
            .withIsVersionOf(conceptId)
            .buildAndPersist(request)

        const concept = await ConceptTestBuilder.aConcept()
            .withProductID('100')
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request)

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);
    });

    test('unlink a concept from an instance, already unlinked', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.source)).toEqual([]);
        expect(updatedInstance.findAllTriples(Predicates.hasVersionedSource)).toEqual([]);

    });

    test('unlink a concept from an instance, should update modified date of instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withProductID('100')
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const modified = new Date();
        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/ontkoppelen`,
            {headers: {
                cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.dateModified)).toHaveLength(1);
        expect(updatedInstance.findTriple(Predicates.dateModified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('unlink a concept from an instance, should update the isInstantiated flag of displayConfiguration to false, if no other instance from the same bestuurseenheid is linked to this concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);
        const concept = await ConceptTestBuilder.aConcept().buildAndPersist(request);

        const displayConfigurationPepingen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptIsNew(false)
            .withConceptInstantiated(true)
            .withBestuurseenheid(pepingenId)
            .withConcept(concept.getId())
            .buildAndPersist(request);

        const displayConfigurationBilzen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptIsNew(false)
            .withConceptInstantiated(true)
            .withBestuurseenheid(bilzenId)
            .withConcept(concept.getId())
            .buildAndPersist(request);

        const instanceFromPepingen = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, pepingenId);

        await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, bilzenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instanceFromPepingen.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instanceFromPepingen.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

        const updatedDisplayConfigurationBilzen = await fetchType(request, displayConfigurationBilzen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationBilzen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });

    test('unlink a concept from an instance, the isInstantiated flag of displayConfiguration should remain true, if one or more instances are linked to this concept', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);
        const concept = await ConceptTestBuilder.aConcept().buildAndPersist(request);

        const displayConfigurationPepingen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptIsNew(false)
            .withConceptInstantiated(true)
            .withBestuurseenheid(pepingenId)
            .withConcept(concept.getId())
            .buildAndPersist(request);

        const displayConfigurationBilzen = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptIsNew(false)
            .withConceptInstantiated(true)
            .withBestuurseenheid(bilzenId)
            .withConcept(concept.getId())
            .buildAndPersist(request);

        const instanceFromPepingen = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, pepingenId);

        await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, pepingenId);

        await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, bilzenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instanceFromPepingen.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instanceFromPepingen.findObject(Predicates.dateModified).getValue()
                }
            });
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

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instanceFromPepingen.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instanceFromPepingen.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfigurationPepingen = await fetchType(request, displayConfigurationPepingen.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfigurationPepingen.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('false')

        const response2 = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instanceFromPepingen.getId().getValue())}/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instanceFromPepingen.findObject(Predicates.dateModified).getValue()
                }
            });
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

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/encodeURIComponent(instance.getId().getValue())/ontkoppelen`,
            {headers: {
                cookie: undefined,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
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

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/encodeURIComponent(instance.getId().getValue())/ontkoppelen`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
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

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
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

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
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
            .withDateModified(modified)
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
            }
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findAllTriples(Predicates.dateModified)).toHaveLength(1);
        expect(updatedInstance.findTriple(Predicates.dateModified).getObjectValue()).not.toEqual(modified.toISOString());
    });

    test('link a concept to an instance, should update the isInstantiated flag of displayConfiguration to true', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const concept = await ConceptTestBuilder.aConcept().buildAndPersist(request);

        const displayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptInstantiated(false)
            .withBestuurseenheid(pepingenId)
            .withConcept(concept.getId())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfiguration = await fetchType(request, displayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfiguration.findTriple(Predicates.conceptInstantiated).getObjectValue()).toEqual('true')

    });

    test('link a concept to an instance, should update the isNewConcept flag of displayConfiguration to false', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const concept = await ConceptTestBuilder.aConcept().buildAndPersist(request);

        const displayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
            .withConceptIsNew(true)
            .withBestuurseenheid(pepingenId)
            .withConcept(concept.getId())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedDisplayConfiguration = await fetchType(request, displayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
        expect(updatedDisplayConfiguration.findTriple(Predicates.conceptIsNew).getObjectValue()).toEqual('false')

    });

    test('link a concept to an instance that is already linked to a concept, should throw error', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);
        const conceptOld = await ConceptTestBuilder.aConcept()
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const conceptNew = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptOld.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId('100')
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(conceptOld.getId()).buildAndPersist(request);
        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(conceptNew.getId()).buildAndPersist(request);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(conceptNew.getId().getValue())}`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toEqual(400);
        expect(await response.json()).toEqual(expect.objectContaining({
            message: "Instantie is reeds gekoppeld aan een concept",
            correlationId: expect.anything()
        }))
    });

    test('link a concept with an instance without login, returns http 401 Unauthorized', async ({request}) => {
        const concept = await ConceptTestBuilder.aConcept()
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .buildAndPersist(request, pepingenId);

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                    cookie: undefined,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
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

        const response = await request.put(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/koppelen/${encodeURIComponent(concept.getId().getValue())}`,
            {headers: {
                    cookie: loginResponse.cookie,
                    'instance-version': instance.findObject(Predicates.dateModified).getValue()
                }
            });
        expect(response.status()).toEqual(403);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findAllTriples(Predicates.source)).toHaveLength(0);
    });
});

