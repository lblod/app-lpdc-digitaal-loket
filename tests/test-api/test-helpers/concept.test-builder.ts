import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {Language} from "./language";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import type {APIRequestContext} from "@playwright/test";
import {
    CompetentAuthorityLevel,
    ConceptTag,
    ExecutingAuthorityLevel,
    ProductType,
    PublicationMedium,
    TargetAudience,
    Theme,
    YourEuropeCategory
} from "./codelists";

export const ConceptType = 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService';

export class ConceptTestBuilder {

    private id: Uri;
    private type: Uri;
    private uuid: Literal;
    private titles: Literal[] = [];
    private descriptions: Literal[] = [];
    private additionalDescriptions: Literal[] = [];
    private exceptions: Literal[] = [];
    private regulations: Literal[] = [];
    private startDate: Literal;
    private endDate: Literal;
    private productId: Literal;
    private theme: Uri;
    private targetAudience: Uri;
    private competentAuthorityLevel: Uri;
    private executingAuthorityLevel: Uri;
    private keywords: Literal[] = [];
    private publicationMedium: Uri;
    private yourEuropeCategory: Uri;
    private productType: Uri;
    private conceptTag: Uri;
    private requirement: Uri;
    private procedure: Uri;
    private moreInfo: Uri;
    private cost: Uri;
    private financialAdvantage: Uri;
    private conceptDisplayConfigurations: Uri[] = [];
    private versionedSource: Uri;
    private latestFunctionalChange: Uri;

    static aConcept() {
        return new ConceptTestBuilder()
            .withId(new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`))
            .withType()
            .withUUID(uuid())
            .withTitles([
                {value: 'title nl', language: Language.NL},
                {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'title generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withDescriptions([
                {value: 'description', language: Language.NL},
                {value: 'description', language: Language.GENERATED_INFORMAL},
                {value: 'description', language: Language.GENERATED_FORMAL}
            ])
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withProductID('1000')
            .withVersionedSource(new Uri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`))
    }

    private withType() {
        this.type = new Uri(ConceptType);
        return this;
    }

    withId(id: Uri) {
        this.id = id;
        return this;
    }

    withUUID(uuid: string) {
        this.uuid = new Literal(uuid);
        return this;
    }

    withTitle(title: string, language: Language) {
        this.titles = [new Literal(title, language)];
        return this;
    }

    withTitles(titles: { value: string, language: Language }[]) {
        this.titles = titles.map(item => new Literal(item.value, item.language));
        return this;
    }

    withDescription(description: string, language: Language) {
        this.descriptions = [new Literal(description, language)];
        return this;
    }

    withDescriptions(descriptions: { value: string, language: Language }[]) {
        this.descriptions = descriptions.map(item => new Literal(item.value, item.language));
        return this;
    }

    withAdditionalDescriptions(additionalDescriptions: { value: string, language: Language }[]) {
        this.additionalDescriptions = additionalDescriptions.map(item => new Literal(item.value, item.language));
        return this;
    }

    withException(exceptions: { value: string, language: Language }[]) {
        this.exceptions = exceptions.map(item => new Literal(item.value, item.language));
        return this;
    }

    withRegulations(regulations: { value: string, language: Language }[]) {
        this.regulations = regulations.map(item => new Literal(item.value, item.language));
        return this;
    }

    withStartDate(date: Date) {
        this.startDate = new Literal(date.toISOString(), undefined, "http://www.w3.org/2001/XMLSchema#dateTime");
        return this;
    }

    withEndDate(date: Date) {
        this.endDate = new Literal(date.toISOString(), undefined, "http://www.w3.org/2001/XMLSchema#dateTime");
        return this;
    }

    withProductID(productId: string) {
        this.productId = new Literal(productId.toString(), undefined);
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

    withKeywords(keywords: string[]) {
        this.keywords = keywords.map(keyword => new Literal(keyword, Language.NL))
        return this;
    }

    withPublicationMedium(publicationMedium: PublicationMedium) {
        this.publicationMedium = new Uri(publicationMedium);
        return this;
    }

    withYourEuropeCategory(yourEuropeCategory: YourEuropeCategory) {
        this.yourEuropeCategory = new Uri(yourEuropeCategory);
        return this;
    }

    withProductType(productType: ProductType) {
        this.productType = new Uri(productType);
        return this;
    }

    withConceptTag(conceptTag: ConceptTag) {
        this.conceptTag = new Uri(conceptTag);
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

    withConceptDisplayConfiguration(displayConfigUri: Uri) {
        this.conceptDisplayConfigurations = [displayConfigUri];
        return this;
    }

    withConceptDisplayConfigurations(displayConfigUris: Uri[]) {
        this.conceptDisplayConfigurations = displayConfigUris;
        return this;
    }

    withVersionedSource(snapshotUri: Uri) {
        this.versionedSource = snapshotUri;
        return this;
    }

    withLatestFunctionalChange(snapshotUri: Uri) {
        this.latestFunctionalChange = snapshotUri;
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, description)),
            ...this.additionalDescriptions.map(description => new Triple(this.id, Predicates.additionalDescription, description)),
            ...this.exceptions.map(exception => new Triple(this.id, Predicates.exception, exception)),
            ...this.regulations.map(regulation => new Triple(this.id, Predicates.regulation, regulation)),
            new Triple(this.id, Predicates.startDate, this.startDate),
            new Triple(this.id, Predicates.endDate, this.endDate),
            new Triple(this.id, Predicates.productId, this.productId),
            new Triple(this.id, Predicates.thematicArea, this.theme),
            new Triple(this.id, Predicates.targetAudience, this.targetAudience),
            new Triple(this.id, Predicates.competentAuthorityLevel, this.competentAuthorityLevel),
            new Triple(this.id, Predicates.executingAuthorityLevel, this.executingAuthorityLevel),
            ...this.keywords.map(keyword => new Triple(this.id, Predicates.keyword, keyword)),
            new Triple(this.id, Predicates.publicationMedium, this.publicationMedium),
            new Triple(this.id, Predicates.yourEuropeCategory, this.yourEuropeCategory),
            new Triple(this.id, Predicates.productType, this.productType),
            new Triple(this.id, Predicates.conceptTag, this.conceptTag),
            new Triple(this.id, Predicates.hasRequirement, this.requirement),
            new Triple(this.id, Predicates.hasProcedure, this.procedure),
            new Triple(this.id, Predicates.hasMoreInfo, this.moreInfo),
            new Triple(this.id, Predicates.hasCost, this.cost),
            new Triple(this.id, Predicates.hasFinancialAdvantage, this.financialAdvantage),
            ...this.conceptDisplayConfigurations.map(conceptDisplayConfig => new Triple(this.id, Predicates.hasDisplayConfiguration, conceptDisplayConfig)),
            new Triple(this.id, Predicates.hasVersionedSource, this.versionedSource),
            new Triple(this.id, Predicates.hasLatestFunctionalChange, this.latestFunctionalChange),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext): Promise<TripleArray> {
        const concept = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/public`, concept.asStringArray());
        return concept;
    }

}
