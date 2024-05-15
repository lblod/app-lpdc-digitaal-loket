import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {
    loginAsPepingen,
    loginAsPepingenButRemoveLPDCRightsFromSession,
    pepingenId
} from "../test-helpers/login";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {Predicates, Uri} from "../test-helpers/triple-array";
import {v4 as uuid} from "uuid";
import {ReviewStatus} from "../test-helpers/codelists";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchType} from "../test-helpers/sparql";

test.describe('confirm up to date till concept snapshot', () => {

    test('when confirm up to date till concept snapshot then herziening nodig should be turned off and conceptSnapshot should be updated', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot2.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withVersionedSource(snapshot1.getSubject())
            .withProductId('100')
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/confirm-up-to-date-till`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {upToDateTillConceptSnapshot: snapshot2.getSubject().getValue()}
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot2.getSubject());
        expect(updatedInstance.findTriple(Predicates.reviewStatus)).not.toBeDefined();
    });

    test('when concept has newer latestFunctionalChanged snapshot then herzieningNodig flag should not be removed',  async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot3 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot3.getSubject())
            .withLatestFunctionalChange(snapshot3.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withVersionedSource(snapshot1.getSubject())
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .withProductId('100')
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/confirm-up-to-date-till`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {upToDateTillConceptSnapshot: snapshot2.getSubject().getValue()}
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();


        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findObject(Predicates.reviewStatus).getValue()).toEqual(ReviewStatus.conceptUpdated);
        expect(updatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot2.getSubject());
    });

    test('when concept versionedSource is not equal to hasLatestFunctionalChange',  async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot3 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot3.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withVersionedSource(snapshot1.getSubject())
            .withProductId('100')
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/confirm-up-to-date-till`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {upToDateTillConceptSnapshot: snapshot2.getSubject().getValue()}
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();


        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findTriple(Predicates.reviewStatus)).not.toBeDefined();
        expect(updatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot2.getSubject());
    });

    test('confirm up to date till concept snapshot without login, returns http 401 Unauthorized', async ({request}) => {
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot2.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withVersionedSource(snapshot1.getSubject())
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/confirm-up-to-date-till`, {
            headers: {
                cookie: undefined,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {upToDateTillConceptSnapshot: snapshot2.getSubject().getValue()}
        });
        expect(response.status()).toEqual(401);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot1.getSubject());
        expect(notUpdatedInstance.findTriple(Predicates.reviewStatus)).toBeDefined();
    });

    test('confirm up to date till concept snapshot with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot2.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withVersionedSource(snapshot1.getSubject())
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/confirm-up-to-date-till`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {upToDateTillConceptSnapshot: snapshot2.getSubject().getValue()}
        });
        expect(response.status()).toEqual(403);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot1.getSubject());
        expect(notUpdatedInstance.findTriple(Predicates.reviewStatus)).toBeDefined();
    });

});
