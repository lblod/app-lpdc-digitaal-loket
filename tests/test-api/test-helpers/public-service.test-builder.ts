import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {Language} from "./language";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {
    CompetentAuthorityLevel,
    ExecutingAuthorityLevel,
    ProductType,
    PublicationMedium,
    ResourceLanguage,
    TargetAudience,
    Theme,
    YourEuropeCategory
} from "./codelists";

export const PublicServiceType = 'http://purl.org/vocab/cpsv#PublicService';
export class PublicServiceTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/public-service/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private title: Literal;
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
    private created: Literal;
    private modified: Literal;
    private startDate: Literal;
    private endDate: Literal;
    private productId: Literal;
    private yourEuropeCategory: Uri;
    private publicationMedium: Uri;
    private requirement: Uri;
    private procedure: Uri;
    private moreInfo: Uri;
    private cost: Uri;
    private financialAdvantage: Uri;
    private contactPoint: Uri;
    private spatial: Uri;

    static aPublicService() {
        return new PublicServiceTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitle('Instance title', Language.NL)
            .withDescription('Instance description', Language.NL)
            .withCreated(new Date())
            .withModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withProductID(1000)
    }

    private withType() {
        this.type =  new Uri(PublicServiceType);
        return this;
    }

    withUUID(uuid: string): PublicServiceTestBuilder {
        this.uuid = new Literal(uuid);
        return this;
    }

    withTitle(title: string, language: Language) {
        this.title = new Literal(title, language);
        return this;
    }

    withNoTitle() {
        this.title = undefined;
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

    withCreated(date: Date) {
        this.created = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withModified(date: Date) {
        this.modified = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
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

    withProductID(productId: number) {
        this.productId = new Literal(productId.toString(), undefined, 'http://www.w3.org/2001/XMLSchema#string');
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
        this.contactPoint = contactPointUri;
        return this;
    }

    withSpatial(geografischToepassingsGebied: Uri) {
        this.spatial = geografischToepassingsGebied;
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            new Triple(this.id, Predicates.title, this.title),
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
            new Triple(this.id, Predicates.created, this.created),
            new Triple(this.id, Predicates.modified, this.modified),
            new Triple(this.id, Predicates.startDate, this.startDate),
            new Triple(this.id, Predicates.endDate, this.endDate),
            new Triple(this.id, Predicates.productId, this.productId),
            new Triple(this.id, Predicates.yourEuropeCategory, this.yourEuropeCategory),
            new Triple(this.id, Predicates.publicationMedium, this.publicationMedium),
            new Triple(this.id, Predicates.hasRequirement, this.requirement),
            new Triple(this.id, Predicates.follows, this.procedure),
            new Triple(this.id, Predicates.hasMoreInfo, this.moreInfo),
            new Triple(this.id, Predicates.hasCost, this.cost),
            new Triple(this.id, Predicates.hasFinancialAdvantage, this.financialAdvantage),
            new Triple(this.id, Predicates.hasContactPoint, this.contactPoint),
            new Triple(this.id, Predicates.spatial, this.spatial),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request, organisationId: string): Promise<any> {
        const publicService = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, publicService.asStringArray());
        return publicService;
    }

}
