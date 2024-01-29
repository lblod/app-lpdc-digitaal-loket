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
        const supportingEvidence = await EvidenceTestBuilder.anEvidence()
            .buildAndPersist(request);

        const requirement = await RequirementTestBuilder.aRequirement()
            .withSupportingEvidence(supportingEvidence.getSubject())
            .buildAndPersist(request);

        const websiteOfProcedure = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request);

        const seeAlsoWebsite = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request);

        const procedure = await ProcedureTestBuilder.aProcedure()
            .withWebsite(websiteOfProcedure.getSubject())
            .buildAndPersist(request);

        const cost = await CostTestBuilder.aCost()
            .buildAndPersist(request);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantage()
            .buildAndPersist(request);

        const concept = await ConceptTestBuilder.aConcept()
            .withAdditionalDescriptions([
                {value: 'additional description nl', language: Language.NL},
                {value: 'additional description informal', language: Language.GENERATED_INFORMAL},
                {value: 'additional description formal', language: Language.GENERATED_FORMAL},
            ])
            .withException([
                {value: 'exception nl', language: Language.NL},
                {value: 'exception generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'exception generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withRegulations([
                {value: 'regulation nl', language: Language.NL},
                {value: 'regulation generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'regulation generated formal', language: Language.GENERATED_FORMAL},
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
        const supportingEvidence = await EvidenceTestBuilder.anEvidence()
            .buildAndPersist(request, organisatieId);

        const requirement = await RequirementTestBuilder.aRequirement()
            .withSupportingEvidence(supportingEvidence.getSubject())
            .buildAndPersist(request,organisatieId);

        const websiteOfProcedure = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request, organisatieId);

        const seeAlsoWebsite = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request, organisatieId);

        const procedure = await ProcedureTestBuilder.aProcedure()
            .withWebsite(websiteOfProcedure.getSubject())
            .buildAndPersist(request, organisatieId);

        const cost = await CostTestBuilder.aCost()
            .buildAndPersist(request, organisatieId);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantage()
            .buildAndPersist(request, organisatieId);

        const address = await AddressTestBuilder.anAddress()
            .buildAndPersist(request, organisatieId);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .withAddress(address.getSubject())
            .buildAndPersist(request, organisatieId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withTitle('Instance title', Language.NL)
            .withDescription('Instance description', Language.NL)
            .withAdditionalDescriptions('additional description nl', Language.NL)
            .withException('exception nl', Language.NL)
            .withRegulation('regulation', Language.NL)
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
            .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/23064'))
            .withCreated(new Date())
            .withModified(new Date())
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
        const supportingEvidence = await EvidenceTestBuilder.anEvidence()
            .buildAndPersist(request, organisatieId);

        const requirement = await RequirementTestBuilder.aRequirement()
            .withSupportingEvidence(supportingEvidence.getSubject())
            .buildAndPersist(request,organisatieId);

        const websiteOfProcedure = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request, organisatieId);

        const seeAlsoWebsite = await WebsiteTestBuilder.aWebsite()
            .buildAndPersist(request, organisatieId);

        const procedure = await ProcedureTestBuilder.aProcedure()
            .withWebsite(websiteOfProcedure.getSubject())
            .buildAndPersist(request, organisatieId);

        const cost = await CostTestBuilder.aCost()
            .buildAndPersist(request, organisatieId);

        const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantage()
            .buildAndPersist(request, organisatieId);

        const address = await AddressTestBuilder.anAddress()
            .buildAndPersist(request, organisatieId);

        const contactPoint = await ContactPointTestBuilder.aContactPoint()
            .withAddress(address.getSubject())
            .buildAndPersist(request, organisatieId);

        const publicService = await PublicServiceTestBuilder.aPublicService()
            .withTitle('Instance title', Language.NL)
            .withDescription('Instance description', Language.NL)
            .withAdditionalDescriptions('additional description nl', Language.NL)
            .withException('exception nl', Language.NL)
            .withRegulation('regulation', Language.NL)
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
            .withSpatial(new Uri('http://vocab.belgif.be/auth/refnis2019/23064'))
            .withCreated(new Date())
            .withModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withExecutingAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withInstanceStatus(InstanceStatus.ontwerp)
            .withPublicationStatus(InstancePublicationStatusType.teHerpubliceren)
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