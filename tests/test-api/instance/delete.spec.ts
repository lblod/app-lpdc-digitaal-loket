import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder, PublicServiceType, TombstoneType} from "../test-helpers/public-service.test-builder";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchTombstone, fetchType} from "../test-helpers/sparql";
import {Predicates} from "../test-helpers/triple-array";
import {ReviewStatus} from "../test-helpers/codelists";
import {RequirementTestBuilder, RequirementType} from "../test-helpers/requirement.test-builder";
import ProcedureTestBuilder, {ProcedureType} from "../test-helpers/procedure.test-builder";
import {WebsiteTestBuilder, WebsiteType} from "../test-helpers/website.test-builder";
import {CostTestBuilder, CostType} from "../test-helpers/cost.test-builder";
import {FinancialAdvantageTestBuilder, FinancialAdvantageType} from "../test-helpers/financial-advantage.test-builder";
import {ContactPointTestBuilder, ContactpointType} from "../test-helpers/contact-point-test.builder";
import EvidenceTestBuilder, {EvidenceType} from "../test-helpers/evidence.test-builder";
import {TestDataFactory} from "../test-helpers/test-data-factory";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {ConceptDisplayConfigurationTestBuilder} from "../test-helpers/concept-display-configuration.test-builder";

test.describe('delete instance', () => {

    test('should remove triples and create tombstone', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const {publicService} = await new TestDataFactory().createFullPublicServiceThatIsPublished(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const tombstoneTriples = await fetchTombstone(request, publicService.getSubject().getValue());
        expect(tombstoneTriples.getTriples()).toHaveLength(5);
        expect(tombstoneTriples.findTriple(Predicates.type).getObjectValue()).toEqual(TombstoneType);
        expect(tombstoneTriples.findTriple(Predicates.formerType).getObjectValue()).toEqual(PublicServiceType);
        expect(tombstoneTriples.findTriple(Predicates.isPublishedVersionOf).getObjectValue()).toEqual(publicService.getSubject().getValue())
        expect(tombstoneTriples.findTriple(Predicates.deleteTime)).toBeDefined();
    });

    test('should remove reviewStatus', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const productId ='100'
        const conceptSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot().buildAndPersist(request);

      const concept =  await ConceptTestBuilder.aConcept()
            .withProductID(productId)
            .withVersionedSource(conceptSnapshot.getSubject())
            .buildAndPersist(request);

        const instance = await PublicServiceTestBuilder.aPublicService()
            .withLinkedConcept(concept.getSubject())
            .withVersionedSource(conceptSnapshot.getSubject())
            .withProductId(productId)
            .withReviewStatus(ReviewStatus.conceptArchived)
            .buildAndPersist(request, pepingenId);

        await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration().withConcept(concept.getId()).buildAndPersist(request)


        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(instance.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, instance.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const tombstoneTriples = await fetchType(request, instance.getSubject().getValue(), TombstoneType);
        expect(tombstoneTriples.findTriple(Predicates.reviewStatus)).not.toBeDefined();
    });

    test('should remove requirement', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const requirement = await RequirementTestBuilder.aRequirementForInstance()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withRequirement(requirement.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const requirementTriples = await fetchType(request, requirement.getSubject().getValue(), RequirementType);
        expect(requirementTriples.getTriples()).toHaveLength(0);
    });

    test('should remove requirement with supportingEvidence', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const evidence = await EvidenceTestBuilder.anEvidenceForInstance()
            .buildAndPersist(request, pepingenId)

        const requirement = await RequirementTestBuilder.aRequirementForInstance()
            .withSupportingEvidence(evidence.getSubject())
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withRequirement(requirement.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const requirementTriples = await fetchType(request, requirement.getSubject().getValue(), RequirementType);
        expect(requirementTriples.getTriples()).toHaveLength(0);
        const evidenceTriples = await fetchType(request, evidence.getSubject().getValue(), EvidenceType);
        expect(evidenceTriples.getTriples()).toHaveLength(0);
    });

    test('should remove procedure', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const procedure = await ProcedureTestBuilder.aProcedureForInstance()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withProcedure(procedure.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const procedureTriples = await fetchType(request, procedure.getSubject().getValue(), ProcedureType);
        expect(procedureTriples.getTriples()).toHaveLength(0);
    });

    test('should remove procedure with Website', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const website = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request, pepingenId)

        const procedure = await ProcedureTestBuilder.aProcedureForInstance()
            .withWebsite(website.getSubject())
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withProcedure(procedure.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const procedureTriples = await fetchType(request, procedure.getSubject().getValue(), ProcedureType);
        expect(procedureTriples.getTriples()).toHaveLength(0);
        const websiteTriples = await fetchType(request, website.getSubject().getValue(), WebsiteType);
        expect(websiteTriples.getTriples()).toHaveLength(0);
    });

    test('should remove website', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const website = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withMoreInfo(website.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const websiteTriples = await fetchType(request, website.getSubject().getValue(), WebsiteType);
        expect(websiteTriples.getTriples()).toHaveLength(0);
    });

    test('should remove cost', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const cost = await CostTestBuilder.aCostForInstance()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withCost(cost.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const costTriples = await fetchType(request, cost.getSubject().getValue(), CostType);
        expect(costTriples.getTriples()).toHaveLength(0);
    });

    test('should remove financialAdvantage', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantageForInstance()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withFinancialAdvantage(financialAdvantage.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const financialAdvantageTriples = await fetchType(request, financialAdvantage.getSubject().getValue(), FinancialAdvantageType);
        expect(financialAdvantageTriples.getTriples()).toHaveLength(0);
    });

    test('should remove contactPoint', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withContactPoint(contactPoint.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const contactPointTriples = await fetchType(request, contactPoint.getSubject().getValue(), ContactpointType);
        expect(contactPointTriples.getTriples()).toHaveLength(0);
    });

    test('deleting an instance without login returns http 401 Unauthorized ', async ({request}) => {
        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withContactPoint(contactPoint.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: undefined}});
        expect(response.status()).toEqual(401);
    });

    test('deleting an instance with a user that has no access rights on lpdc returns http 403 Forbidden ', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withContactPoint(contactPoint.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${encodeURIComponent(publicService.getId().getValue())}`, {params: {cookie: loginResponse.cookie}});
        expect(response.status()).toEqual(403);
    });

})
