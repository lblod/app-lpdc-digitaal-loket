import {expect, test} from "@playwright/test";
import {PublicServiceTestBuilder, PublicServiceType, TombstoneType} from "../test-helpers/public-service.test-builder";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {dispatcherUrl} from "../test-helpers/test-options";
import {fetchType} from "../test-helpers/sparql";
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

test.describe('delete instance', () => {

    test('should remove triples and create tombstone', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const {publicService} = await new TestDataFactory().createFullPublicService(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const tombstoneTriples = await fetchType(request, publicService.getSubject().getValue(), TombstoneType);
        expect(tombstoneTriples.getTriples()).toHaveLength(3);
        expect(tombstoneTriples.getSubject()).toEqual(publicService.getSubject());
        expect(tombstoneTriples.findTriple(Predicates.type).getObjectValue()).toEqual(TombstoneType);
        expect(tombstoneTriples.findTriple(Predicates.formerType).getObjectValue()).toEqual(PublicServiceType);
        expect(tombstoneTriples.findTriple(Predicates.deleteTime)).toBeDefined();
    });

    test('should remove reviewStatus', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const tombstoneTriples = await fetchType(request, publicService.getSubject().getValue(), TombstoneType);
        expect(tombstoneTriples.findTriple(Predicates.reviewStatus)).not.toBeDefined();
    });

    test('should remove requirement', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const requirement = await RequirementTestBuilder.aRequirement()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withRequirement(requirement.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const requirementTriples = await fetchType(request, requirement.getSubject().getValue(), RequirementType);
        expect(requirementTriples.getTriples()).toHaveLength(0);
    });

    test('should remove requirement with supportingEvidence', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const evidence = await EvidenceTestBuilder.anEvidence()
            .buildAndPersist(request, pepingenId)

        const requirement = await RequirementTestBuilder.aRequirement()
            .withSupportingEvidence(evidence.getSubject())
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withRequirement(requirement.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
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

        const procedure = await ProcedureTestBuilder.aProcedure()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withProcedure(procedure.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const procedureTriples = await fetchType(request, procedure.getSubject().getValue(), ProcedureType);
        expect(procedureTriples.getTriples()).toHaveLength(0);
    });

    test('should remove procedure with Website', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const website = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request, pepingenId)

        const procedure = await ProcedureTestBuilder.aProcedure()
            .withWebsite(website.getSubject())
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withProcedure(procedure.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
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

        const website = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withMoreInfo(website.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const websiteTriples = await fetchType(request, website.getSubject().getValue(), WebsiteType);
        expect(websiteTriples.getTriples()).toHaveLength(0);
    });

    test('should remove cost', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const cost = await CostTestBuilder.aCost()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withCost(cost.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.ok(), await response.text()).toBeTruthy();

        const triples = await fetchType(request, publicService.getSubject().getValue(), PublicServiceType);
        expect(triples.getTriples()).toHaveLength(0);
        const costTriples = await fetchType(request, cost.getSubject().getValue(), CostType);
        expect(costTriples.getTriples()).toHaveLength(0);
    });

    test('should remove financialAdvantage', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantage()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withFinancialAdvantage(financialAdvantage.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
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

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
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

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: undefined}});
        expect(response.status()).toEqual(401);
    });

    test('Creating a new instance with a user that has no access rights on lpdc returns http 403 Forbidden ', async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .buildAndPersist(request, pepingenId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withContactPoint(contactPoint.getSubject())
            .buildAndPersist(request, pepingenId);

        const response = await request.delete(`${dispatcherUrl}/public-services/${publicService.getUUID()}`, {params: {cookie: loginResponse.cookie}});
        expect(response.status()).toEqual(403);
    });

})
