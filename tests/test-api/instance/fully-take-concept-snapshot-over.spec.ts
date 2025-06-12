import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder, PublicServiceType} from "../test-helpers/public-service.test-builder";
import {
    loginAsPepingen,
    loginAsPepingenButRemoveLPDCRightsFromSession,
    pepingenId
} from "../test-helpers/login";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {Literal, Predicates, Uri} from "../test-helpers/triple-array";
import {v4 as uuid} from "uuid";
import {ReviewStatus} from "../test-helpers/codelists";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchType} from "../test-helpers/sparql";
import {Language} from "../test-helpers/language";

test.describe('fully take concept snapshot over', () => {

    test('when fully take concept snapshot over then herziening nodig should be turned off, conceptSnapshot link should be updated, and data from concept snapshot copied into instance based on the dutch language version of the instance', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 =
            await ConceptSnapshotTestBuilder
                .aConceptSnapshot()
                .withTitles([
                    {value: 'snapshot2 title nl', language: Language.NL},
                    {value: 'snapshot2 title generated informal', language: Language.GENERATED_INFORMAL},
                    {value: 'snapshot2 title generated formal', language: Language.GENERATED_FORMAL},
                ])
                .withIsVersionOf(conceptId)
                .buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot2.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withTitle('title to be updated', Language.INFORMAL)
            .withLinkedConcept(conceptId)
            .withVersionedSource(snapshot1.getSubject())
            .withProductId('100')
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .withDutchLanguageVariant(Language.INFORMAL)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${encodeURIComponent(instance.getId().getValue())}/fully-take-concept-snapshot-over`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {conceptSnapshotId: snapshot2.getSubject().getValue()}
        });
        expect(response.ok(), `${await response.text()}`).toBeTruthy();

        const updatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(updatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot2.getSubject());
        expect(updatedInstance.findTriple(Predicates.reviewStatus)).not.toBeDefined();
        expect((updatedInstance.findTriple(Predicates.title).object as Literal).getValue()).toEqual('snapshot2 title generated informal');
    });

    test('when fully take concept snapshot over without login, returns http 401 Unauthorized', async ({request}) => {
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 =
            await ConceptSnapshotTestBuilder
                .aConceptSnapshot()
                .withTitles([
                    {value: 'snapshot2 title nl', language: Language.NL},
                    {value: 'snapshot2 title generated informal', language: Language.GENERATED_INFORMAL},
                    {value: 'snapshot2 title generated formal', language: Language.GENERATED_FORMAL},
                ])
                .withIsVersionOf(conceptId)
                .buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot2.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withTitle('title not to be updated', Language.INFORMAL)
            .withVersionedSource(snapshot1.getSubject())
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/fully-take-concept-snapshot-over`, {
            headers: {
                cookie: undefined,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {conceptSnapshotId: snapshot2.getSubject().getValue()}
        });
        expect(response.status()).toEqual(401);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot1.getSubject());
        expect(notUpdatedInstance.findTriple(Predicates.reviewStatus)).toBeDefined();
        expect((notUpdatedInstance.findTriple(Predicates.title).object as Literal).getValue()).toEqual('title not to be updated');
    });

    test('when fully take concept snapshot over with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const conceptId = new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`);

        const snapshot1 = await ConceptSnapshotTestBuilder.aConceptSnapshot().withIsVersionOf(conceptId).buildAndPersist(request);
        const snapshot2 =
            await ConceptSnapshotTestBuilder
                .aConceptSnapshot()
                .withTitles([
                    {value: 'snapshot2 title nl', language: Language.NL},
                    {value: 'snapshot2 title generated informal', language: Language.GENERATED_INFORMAL},
                    {value: 'snapshot2 title generated formal', language: Language.GENERATED_FORMAL},
                ])
                .withIsVersionOf(conceptId)
                .buildAndPersist(request);

        await ConceptTestBuilder.aConcept()
            .withId(conceptId)
            .withVersionedSource(snapshot2.getSubject())
            .withLatestFunctionalChange(snapshot2.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(conceptId)
            .withTitle('title not to be updated', Language.INFORMAL)
            .withVersionedSource(snapshot1.getSubject())
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.post(`${dispatcherUrl}/lpdc-management/public-services/${instance.getUUID()}/fully-take-concept-snapshot-over`, {
            headers: {
                cookie: loginResponse.cookie,
                'instance-version': instance.findObject(Predicates.dateModified).getValue()
            },
            data: {conceptSnapshotId: snapshot2.getSubject().getValue()}
        });
        expect(response.status()).toEqual(403);

        const notUpdatedInstance = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(notUpdatedInstance.findObject(Predicates.hasVersionedSource)).toEqual(snapshot1.getSubject());
        expect(notUpdatedInstance.findTriple(Predicates.reviewStatus)).toBeDefined();
        expect((notUpdatedInstance.findTriple(Predicates.title).object as Literal).getValue()).toEqual('title not to be updated');
    });

});