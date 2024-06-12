import {APIRequestContext} from "@playwright/test";
import {Language} from "./language";
import {RequirementTestBuilder} from "./requirement.test-builder";
import {ConceptTestBuilder} from "./concept.test-builder";
import EvidenceTestBuilder from "./evidence.test-builder";
import ProcedureTestBuilder from "./procedure.test-builder";
import {WebsiteTestBuilder} from "./website.test-builder";
import {CostTestBuilder} from "./cost.test-builder";
import {FinancialAdvantageTestBuilder} from "./financial-advantage.test-builder";
import {
    CompetentAuthorityLevel,
    ConceptTag,
    ExecutingAuthorityLevel,
    InstancePublicationStatusType,
    InstanceStatus,
    ProductType,
    PublicationMedium,
    ResourceLanguage,
    TargetAudience,
    Theme,
    YourEuropeCategory
} from "./codelists";
import {PublicServiceTestBuilder} from "./public-service.test-builder";
import {ContactPointTestBuilder} from "./contact-point-test.builder";
import {pepingenId} from "./login";
import {AddressTestBuilder} from "./address.test-builder";
import {Uri} from "./triple-array";


export class TestDataFactory {

    async createFullConcept(request: APIRequestContext) {
        const supportingEvidence = await EvidenceTestBuilder.anEvidenceForInstance()
            .buildAndPersist(request);

        const requirement = await RequirementTestBuilder.aRequirementForInstance()
            .withSupportingEvidence(supportingEvidence.getSubject())
            .buildAndPersist(request);

        const websiteOfProcedure = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request);

        const seeAlsoWebsite = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request);

        const procedure = await ProcedureTestBuilder.aProcedureForInstance()
            .withWebsite(websiteOfProcedure.getSubject())
            .buildAndPersist(request);

        const cost = await CostTestBuilder.aCostForInstance()
            .buildAndPersist(request);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantageForInstance()
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withAdditionalDescriptions([
                {value: 'additional description informal', language: Language.INFORMAL}
            ])
            .withException([
                {value: 'exception informal', language: Language.INFORMAL}
            ])
            .withRegulations([
                {value: 'regulation informal', language: Language.INFORMAL}
            ])
            .withTheme(Theme.BouwenWonen)
            .withTargetAudience(TargetAudience.LokaalBestuur)
            .withCompetentAuthorityLevel(CompetentAuthorityLevel.Lokaal)
            .withExecutingAuthorityLevel(ExecutingAuthorityLevel.Lokaal)
            .withKeywords(['keyword 1', 'keyword 2'])
            .withPublicationMedium(PublicationMedium.YourEurope)
            .withYourEuropeCategory(YourEuropeCategory.Bedrijf)
            .withConceptTag(ConceptTag.YourEuropeVerplicht)
            .withProductType(ProductType.Bewijs)
            .withRequirement(requirement.getSubject())
            .withProcedure(procedure.getSubject())
            .withMoreInfo(seeAlsoWebsite.getSubject())
            .withCost(cost.getSubject())
            .withFinancialAdvantage(financialAdvantage.getSubject())
            .buildAndPersist(request);

        return {
            concept: concept,
            triples: [
                ...concept.getTriples(),
                ...requirement.getTriples(),
                ...procedure.getTriples(),
                ...seeAlsoWebsite.getTriples(),
                ...supportingEvidence.getTriples(),
                ...websiteOfProcedure.getTriples(),
                ...cost.getTriples(),
                ...financialAdvantage.getTriples(),
            ]
        };
    }

    async createFullPublicService(request: APIRequestContext, organisatieId: string) {
        const supportingEvidence = await EvidenceTestBuilder.anEvidenceForInstance()
            .buildAndPersist(request, organisatieId);

        const requirement = await RequirementTestBuilder.aRequirementForInstance()
            .withSupportingEvidence(supportingEvidence.getSubject())
            .buildAndPersist(request,organisatieId);

        const websiteOfProcedure = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request, organisatieId);

        const seeAlsoWebsite = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request, organisatieId);

        const procedure = await ProcedureTestBuilder.aProcedureForInstance()
            .withWebsite(websiteOfProcedure.getSubject())
            .buildAndPersist(request, organisatieId);

        const cost = await CostTestBuilder.aCostForInstance()
            .buildAndPersist(request, organisatieId);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantageForInstance()
            .buildAndPersist(request, organisatieId);

        const address = await AddressTestBuilder.anAddress()
            .buildAndPersist(request, organisatieId);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .withAddress(address.getSubject())
            .buildAndPersist(request, organisatieId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withTitle('Instance title', Language.INFORMAL)
            .withDescription('Instance description', Language.INFORMAL)
            .withAdditionalDescriptions('additional description', Language.INFORMAL)
            .withException('exception', Language.INFORMAL)
            .withRegulation('regulation', Language.INFORMAL)
            .withTheme(Theme.BouwenWonen)
            .withTargetAudience(TargetAudience.LokaalBestuur)
            .withLanguage(ResourceLanguage.NLD)
            .withCompetentAuthorityLevel(CompetentAuthorityLevel.Lokaal)
            .withExecutingAuthorityLevel(ExecutingAuthorityLevel.Lokaal)
            .withKeywords(['keyword 1', 'keyword 2'])
            .withPublicationMedium(PublicationMedium.YourEurope)
            .withYourEuropeCategory(YourEuropeCategory.Bedrijf)
            .withProductType(ProductType.Bewijs)
            .withRequirement(requirement.getSubject())
            .withProcedure(procedure.getSubject())
            .withMoreInfo(seeAlsoWebsite.getSubject())
            .withCost(cost.getSubject())
            .withFinancialAdvantage(financialAdvantage.getSubject())
            .withContactPoint(contactPoint.getSubject())
            .withSpatial(new Uri('http://data.europa.eu/nuts/code/BE24123064'))
            .withDateCreated(new Date())
            .withDateModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withExecutingAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .buildAndPersist(request, organisatieId);

        return {
            publicService: publicService,
            triples: [
                ...publicService.getTriples(),
                ...requirement.getTriples(),
                ...procedure.getTriples(),
                ...seeAlsoWebsite.getTriples(),
                ...supportingEvidence.getTriples(),
                ...websiteOfProcedure.getTriples(),
                ...cost.getTriples(),
                ...financialAdvantage.getTriples(),
                ...contactPoint.getTriples(),
                ...address.getTriples(),
            ]
        };
    }
    async createFullToRepublishPublicService(request: APIRequestContext, organisatieId: string) {
        const supportingEvidence = await EvidenceTestBuilder.anEvidenceForInstance()
            .buildAndPersist(request, organisatieId);

        const requirement = await RequirementTestBuilder.aRequirementForInstance()
            .withSupportingEvidence(supportingEvidence.getSubject())
            .buildAndPersist(request,organisatieId);

        const websiteOfProcedure = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request, organisatieId);

        const seeAlsoWebsite = await WebsiteTestBuilder.aWebsiteForInstance()
            .buildAndPersist(request, organisatieId);

        const procedure = await ProcedureTestBuilder.aProcedureForInstance()
            .withWebsite(websiteOfProcedure.getSubject())
            .buildAndPersist(request, organisatieId);

        const cost = await CostTestBuilder.aCostForInstance()
            .buildAndPersist(request, organisatieId);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantageForInstance()
            .buildAndPersist(request, organisatieId);

        const address = await AddressTestBuilder.anAddress()
            .buildAndPersist(request, organisatieId);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .withAddress(address.getSubject())
            .buildAndPersist(request, organisatieId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withTitle('Instance title', Language.INFORMAL)
            .withDescription('Instance description', Language.INFORMAL)
            .withAdditionalDescriptions('additional description', Language.INFORMAL)
            .withException('exception', Language.INFORMAL)
            .withRegulation('regulation', Language.INFORMAL)
            .withTheme(Theme.BouwenWonen)
            .withTargetAudience(TargetAudience.LokaalBestuur)
            .withLanguage(ResourceLanguage.NLD)
            .withCompetentAuthorityLevel(CompetentAuthorityLevel.Lokaal)
            .withExecutingAuthorityLevel(ExecutingAuthorityLevel.Lokaal)
            .withKeywords(['keyword 1', 'keyword 2'])
            .withPublicationMedium(PublicationMedium.YourEurope)
            .withYourEuropeCategory(YourEuropeCategory.Bedrijf)
            .withProductType(ProductType.Bewijs)
            .withRequirement(requirement.getSubject())
            .withProcedure(procedure.getSubject())
            .withMoreInfo(seeAlsoWebsite.getSubject())
            .withCost(cost.getSubject())
            .withFinancialAdvantage(financialAdvantage.getSubject())
            .withContactPoint(contactPoint.getSubject())
            .withSpatial(new Uri('http://data.europa.eu/nuts/code/BE24123064'))
            .withDateCreated(new Date())
            .withDateModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withExecutingAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withInstanceStatus(InstanceStatus.verzonden)
            .withDateSent(new Date())
            .withPublicationStatus(InstancePublicationStatusType.teHerpubliceren)
            .withDatePublished(new Date())
            .buildAndPersist(request, organisatieId);

        return {
            publicService: publicService,
            triples: [
                ...publicService.getTriples(),
                ...requirement.getTriples(),
                ...procedure.getTriples(),
                ...seeAlsoWebsite.getTriples(),
                ...supportingEvidence.getTriples(),
                ...websiteOfProcedure.getTriples(),
                ...cost.getTriples(),
                ...financialAdvantage.getTriples(),
                ...contactPoint.getTriples(),
                ...address.getTriples(),
            ]
        };
    }
}