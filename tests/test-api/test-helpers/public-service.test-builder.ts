import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {Language} from "./language";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {
    CompetentAuthorityLevel,
    ExecutingAuthorityLevel,
    InstancePublicationStatusType,
    InstanceStatus,
    ProductType,
    PublicationMedium,
    ResourceLanguage,
    ReviewStatus,
    TargetAudience,
    Theme,
    YourEuropeCategory
} from "./codelists";
import {pepingenId} from "./login";

export const PublicServiceType = 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService';
export const TombstoneType = 'https://www.w3.org/ns/activitystreams#Tombstone';
export class PublicServiceTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/public-service/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private titles: Literal[] = [];
    private description: Literal;
    private additionalDescription: Literal;
    private exception: Literal;
    private regulation: Literal;
    private theme: Uri;
    private targetAudience: Uri;
    private competentAuthorityLevel: Uri;
    private executingAuthorityLevel: Uri;
    private resourceLanguage: Uri;
    private keywords: Literal[] = [];
    private productType: Uri;
    private dateCreated: Literal;
    private dateModified: Literal;
    private startDate: Literal;
    private endDate: Literal;
    private yourEuropeCategory: Uri;
    private publicationMedium: Uri;
    private requirement: Uri;
    private procedure: Uri;
    private moreInfo: Uri;
    private cost: Uri;
    private financialAdvantage: Uri;
    private contactPoints: Uri[] = [];
    private spatial: Uri;
    private competentAuthority: Uri[] = [];
    private executingAuthority: Uri[] = [];
    private concept: Uri;
    private createdBy: Uri;
    private versionedSource: Uri;
    private productId: Literal;
    private reviewStatus: Uri;
    private instanceStatus: Uri;
    private dateSent: Literal;
    private publicationStatus: Uri; //TODO LPDC-1236 remove
    private datePublished: Literal; //TODO LPDC-1236 remove
    private dutchLanguageVariant: Literal;
    private needsConversionFromFormalToInformal: Literal;
    private forMunicipalityMerger: Literal;

    static aPublicService() {
        const instanceUuid = uuid();
        return new PublicServiceTestBuilder()
            .withId(new Uri(`http://data.lblod.info/id/public-service/${instanceUuid}`))
            .withUUID(instanceUuid)
            .withType()
            .withTitle('Instance title', Language.INFORMAL)
            .withDescription('Instance description', Language.INFORMAL)
            .withDateCreated(new Date())
            .withDateModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withInstanceStatus(InstanceStatus.ontwerp)
            .withDutchLanguageVariant(Language.INFORMAL)
            .withNeedsConversionFromFormalToInformal(false)
            .withForMunicipalityMerger(false);
    }

    static aFullPublicService() {
        return PublicServiceTestBuilder.aPublicService()
            .withAdditionalDescriptions('Additional description', Language.INFORMAL)
            .withException('exception', Language.INFORMAL)
            .withRegulation('regulation', Language.INFORMAL)
            .withTheme(Theme.BurgerOverheid)
            .withTargetAudience(TargetAudience.Onderneming)
            .withCompetentAuthorityLevel(CompetentAuthorityLevel.Europees)
            .withExecutingAuthorityLevel(ExecutingAuthorityLevel.Lokaal)
            .withLanguage(ResourceLanguage.NLD)
            .withKeywords(['Keyword1', 'keyword2'])
            .withProductType(ProductType.Bewijs)
            .withYourEuropeCategory(YourEuropeCategory.Bedrijf)
            .withPublicationMedium(PublicationMedium.YourEurope)
            .withReviewStatus(ReviewStatus.conceptUpdated)
            .withSpatial(new Uri('http://data.europa.eu/nuts/code/BE24224001'))
            .withCompetentAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withExecutingAuthority([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .withForMunicipalityMerger(false)
    }

    private withType() {
        this.type =  new Uri(PublicServiceType);
        return this;
    }

    withId(id: Uri): PublicServiceTestBuilder {
        this.id = id;
        return this;
    }

    withUUID(uuid: string): PublicServiceTestBuilder {
        this.uuid = new Literal(uuid);
        return this;
    }

    withTitle(title: string, language: Language) {
        this.titles = [new Literal(title, language)];
        return this;
    }

    withTitles(titles: {value: string, language: Language}[]) {
        this.titles = titles.map(title => new Literal(title.value, title.language));
        return this;
    }

    withNoTitle() {
        this.titles = [];
        return this;
    }

    withDescription(description: string, language: Language) {
        this.description = new Literal(description, language);
        return this;
    }

    withNoDescription() {
        this.description = undefined;
        return this;
    }

    withAdditionalDescriptions(additionalDescription: string, language: Language) {
        this.additionalDescription = new Literal(additionalDescription, language);
        return this;
    }

    withException(exception: string, language: Language) {
        this.exception = new Literal(exception, language);
        return this;
    }

    withRegulation(regulation: string, language: Language) {
        this.regulation = new Literal(regulation, language);
        return this;
    }

    withTheme(theme: Theme) {
        this.theme = new Uri(theme);
        return this;
    }

    withTargetAudience(targetAudience: TargetAudience) {
        this.targetAudience = new Uri(targetAudience);
        return this;
    }

    withCompetentAuthorityLevel(competentAuthorityLevel: CompetentAuthorityLevel) {
        this.competentAuthorityLevel = new Uri(competentAuthorityLevel);
        return this;
    }

    withExecutingAuthorityLevel(executingAuthorityLevel: ExecutingAuthorityLevel) {
        this.executingAuthorityLevel = new Uri(executingAuthorityLevel);
        return this;
    }

    withLanguage(language: ResourceLanguage) {
        this.resourceLanguage = new Uri(language);
        return this;
    }

    withKeywords(keywords: string[]) {
        this.keywords = keywords.map(keyword => new Literal(keyword, Language.NL))
        return this;
    }

    withProductType(productType: ProductType) {
        this.productType = new Uri(productType);
        return this;
    }

    withDateCreated(date: Date) {
        this.dateCreated = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withDateModified(date: Date) {
        this.dateModified = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withStartDate(date: Date) {
        this.startDate = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withEndDate(date: Date) {
        this.endDate = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withYourEuropeCategory(yourEuropeCategory: YourEuropeCategory) {
        this.yourEuropeCategory = new Uri(yourEuropeCategory);
        return this;
    }

    withPublicationMedium(publicationMedium: PublicationMedium) {
        this.publicationMedium = new Uri(publicationMedium);
        return this;
    }

    withNoPublicationMedium() {
        this.publicationMedium = undefined;
        return this;
    }

    withRequirement(requirementUri: Uri) {
        this.requirement = requirementUri;
        return this;
    }

    withProcedure(procedureUri: Uri) {
        this.procedure = procedureUri;
        return this;
    }

    withMoreInfo(websiteUri: Uri) {
        this.moreInfo = websiteUri;
        return this;
    }

    withCost(costUri: Uri) {
        this.cost = costUri;
        return this;
    }

    withFinancialAdvantage(financialAdvantageUri: Uri) {
        this.financialAdvantage = financialAdvantageUri;
        return this;
    }

    withContactPoint(contactPointUri: Uri) {
        this.contactPoints = [contactPointUri];
        return this;
    }

    withContactPoints(contactPointUris: Uri[]) {
        this.contactPoints = contactPointUris;
        return this;
    }

    withSpatial(geografischToepassingsGebied: Uri) {
        this.spatial = geografischToepassingsGebied;
        return this;
    }

    withCompetentAuthority(competentAuthority: Uri[]) {
        this.competentAuthority = competentAuthority;
        return this;
    }

    withExecutingAuthority(executingAuthority: Uri[]) {
        this.executingAuthority = executingAuthority;
        return this;
    }

    withLinkedConcept(concept: Uri) {
        this.concept = concept;
        return this;
    }

    withVersionedSource(conceptSnapshot: Uri) {
        this.versionedSource = conceptSnapshot;
        return this;
    }

    withProductId(productId: string) {
        this.productId = new Literal(productId);
        return this;
    }

    withCreatedBy(bestuurseenheidId: string){
        this.createdBy = new Uri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidId}`);
        return this;
    }

    withReviewStatus(reviewStatus: ReviewStatus) {
        this.reviewStatus = new Uri(reviewStatus);
        return this;
    }

    withInstanceStatus(instanceStatus: InstanceStatus) {
        this.instanceStatus = new Uri(instanceStatus);
        return this;
    }

    withDateSent(date: Date) {
        this.dateSent = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withDatePublished(date: Date) {
        this.datePublished = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withDutchLanguageVariant(language: Language) {
        this.dutchLanguageVariant = new Literal(language);
        return this;
    }

    withNeedsConversionFromFormalToInformal(needsConversionFromFormalToInformal: boolean) {
        this.needsConversionFromFormalToInformal = new Literal(needsConversionFromFormalToInformal.toString(), undefined, 'http://www.w3.org/2001/XMLSchema#boolean');
        return this;
    }

    withForMunicipalityMerger(forMunicipalityMerger: boolean) {
        this.forMunicipalityMerger = new Literal(forMunicipalityMerger.toString(), undefined, 'http://www.w3.org/2001/XMLSchema#boolean');
        return this;
    }

    private buildTripleArray(organisationId: string): TripleArray {
        if(!this.createdBy) {
            this.withCreatedBy(organisationId);
        }
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            new Triple(this.id, Predicates.description, this.description),
            new Triple(this.id, Predicates.additionalDescription, this.additionalDescription),
            new Triple(this.id, Predicates.exception, this.exception),
            new Triple(this.id, Predicates.regulation, this.regulation),
            new Triple(this.id, Predicates.thematicArea, this.theme),
            new Triple(this.id, Predicates.targetAudience, this.targetAudience),
            new Triple(this.id, Predicates.competentAuthorityLevel, this.competentAuthorityLevel),
            new Triple(this.id, Predicates.executingAuthorityLevel, this.executingAuthorityLevel),
            new Triple(this.id, Predicates.language, this.resourceLanguage),
            ...this.keywords.map(keyword => new Triple(this.id, Predicates.keyword, keyword)),
            new Triple(this.id, Predicates.productType, this.productType),
            new Triple(this.id, Predicates.dateCreated, this.dateCreated),
            new Triple(this.id, Predicates.dateModified, this.dateModified),
            new Triple(this.id, Predicates.startDate, this.startDate),
            new Triple(this.id, Predicates.endDate, this.endDate),
            new Triple(this.id, Predicates.yourEuropeCategory, this.yourEuropeCategory),
            new Triple(this.id, Predicates.publicationMedium, this.publicationMedium),
            new Triple(this.id, Predicates.hasRequirement, this.requirement),
            new Triple(this.id, Predicates.hasProcedure, this.procedure),
            new Triple(this.id, Predicates.hasMoreInfo, this.moreInfo),
            new Triple(this.id, Predicates.hasCost, this.cost),
            new Triple(this.id, Predicates.hasFinancialAdvantage, this.financialAdvantage),
            ...this.contactPoints.map(contactPoint => new Triple(this.id, Predicates.hasContactPoint, contactPoint)),
            new Triple(this.id, Predicates.spatial, this.spatial),
            ...this.competentAuthority.map(aCompetentAuthority => new Triple(this.id, Predicates.hasCompetentAuthority, aCompetentAuthority)),
            ...this.executingAuthority.map(anExecutingAuthority => new Triple(this.id, Predicates.hasExecutingAuthority, anExecutingAuthority)),
            new Triple(this.id, Predicates.source, this.concept),
            new Triple(this.id, Predicates.createdBy, this.createdBy),
            new Triple(this.id, Predicates.hasVersionedSource, this.versionedSource),
            new Triple(this.id, Predicates.productId, this.productId),
            new Triple(this.id, Predicates.reviewStatus, this.reviewStatus),
            new Triple(this.id, Predicates.instanceStatus, this.instanceStatus),
            new Triple(this.id, Predicates.dateSent, this.dateSent),
            new Triple(this.id, Predicates.publicationStatus, this.publicationStatus),
            new Triple(this.id, Predicates.datePublished, this.datePublished),
            new Triple(this.id, Predicates.dutchLanguageVariant, this.dutchLanguageVariant),
            new Triple(this.id, Predicates.needsConversionFromFormalToInformal, this.needsConversionFromFormalToInformal),
            new Triple(this.id, Predicates.forMunicipalityMerger, this.forMunicipalityMerger),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request, organisationId: string): Promise<TripleArray> {
        const publicService = this.buildTripleArray(organisationId);
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, publicService.asStringArray());
        return publicService;
    }
}
