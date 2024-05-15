import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {Language} from "./language";
import {ConceptType} from "./concept.test-builder";
import {v4 as uuid} from 'uuid';
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";
import {
    CompetentAuthorityLevel,
    ConceptTag,
    ExecutingAuthorityLevel,
    ProductType, PublicationMedium,
    TargetAudience,
    Theme, YourEuropeCategory
} from "./codelists";

export const ConceptSnapshotType = 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot';

export class ConceptSnapshotTestBuilder {

    private id = new Uri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);
    private type: Uri;
    private titles: Literal[] = [];
    private descriptions: Literal[] = [];
    private additionalDescriptions: Literal[] = [];
    private exceptions: Literal[] = [];
    private regulations: Literal[] = [];
    private startDate: Literal;
    private endDate: Literal;
    private productId: Literal;
    private targetAudiences: Uri[] = [];
    private themes: Uri[] = [];
    private competentAuthorityLevels: Uri[] = [];
    private competentAuthorities: Uri[] = [];
    private executingAuthorityLevels: Uri[] = [];
    private executingAuthorities: Uri[] = [];
    private conceptTags: Uri[] = [];
    private publicationMedium: Uri[] = [];
    private yourEuropeCategories: Uri[] = [];
    private requirementIds: Uri[] = [];
    private requirements: ConceptRequirement[] = [];
    private procedureIds: Uri[] = [];
    private procedures: ConceptProcedure[] = [];
    private costIds: Uri[] = [];
    private costs: ConceptCost[] = [];
    private financialAdvantageIds: Uri[] = [];
    private financialAdvantages: ConceptFinancialAdvantage[] = [];
    private moreInfoIds: Uri[] = [];
    private moreInfo: ConceptWebsite[] = [];
    private keywords: Literal[] = [];
    private productType: Uri;
    private isVersionOf: Uri;
    private dateCreated: Literal;
    private dateModified: Literal;
    private generatedAtTime: Literal;
    private isArchived: Literal;

    static aConceptSnapshot():ConceptSnapshotTestBuilder {
        return new ConceptSnapshotTestBuilder()
            .withType()
            .withProductID('1000')
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
            .withDateCreated(new Date())
            .withDateModified(new Date())
            .withGeneratedAtTime(new Date())
            .withIsArchived()
            .withIsVersionOf(new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`))
    }

    private withType() {
        this.type = new Uri(ConceptSnapshotType);
        return this;
    }

    withProductID(productId: string) {
        this.productId = new Literal(productId, undefined, 'http://www.w3.org/2001/XMLSchema#string')
        return this;
    }

    withTitles(titles: { value: string, language: Language }[]) {
        this.titles = titles.map(item => new Literal(item.value, item.language));
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

    withExceptions(exceptions: { value: string, language: Language }[]) {
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

    withProductType(productType: ProductType) {
        this.productType = new Uri(productType);
        return this;
    }

    withTargetAudiences(targetAudiences: TargetAudience[]) {
        this.targetAudiences = targetAudiences.map(targetAudience => new Uri(targetAudience));
        return this;
    }

    withThemes(themes: Theme[]) {
        this.themes = themes.map(theme => new Uri(theme));
        return this;
    }

    withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevel[]) {
        this.competentAuthorityLevels = competentAuthorityLevels.map(competentAuthorityLevel => new Uri(competentAuthorityLevel));
        return this;
    }

    withCompetentAuthorities(competentAuthorities: Uri[]) {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevel[]) {
        this.executingAuthorityLevels = executingAuthorityLevels.map(executingAuthorityLevel => new Uri(executingAuthorityLevel));
        return this;
    }

    withExecutingAuthorities(executingAuthorities: Uri[]) {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    withConceptTags(conceptTags: ConceptTag[]) {
        this.conceptTags = conceptTags.map(conceptTag => new Uri(conceptTag));
        return this;
    }

    withKeywords(keywords: {value: string, language: Language}[]) {
        this.keywords = keywords.map(keyword => new Literal(keyword.value, keyword.language))
        return this;
    }

    withPublicationMedium(publicationMedia: PublicationMedium[]) {
        this.publicationMedium = publicationMedia.map(publicationMedium => new Uri(publicationMedium));
        return this;
    }

    withYourEuropeCategory(yourEuropeCategories: YourEuropeCategory[]) {
        this.yourEuropeCategories = yourEuropeCategories.map(yourEuropeCategory => new Uri(yourEuropeCategory));
        return this;
    }

    withRequirements(requirements: ConceptRequirement[]) {
        this.requirements = requirements;
        this.requirementIds = requirements.map(requirement => requirement.getId())
        return this;
    }

    withProcedures(procedures: ConceptProcedure[]) {
        this.procedures = procedures;
        this.procedureIds = procedures.map(procedure => procedure.getId())
        return this;
    }

    withCosts(costs: ConceptCost[]) {
        this.costs = costs;
        this.costIds = costs.map(cost => cost.getId())
        return this;
    }

    withFinancialAdvantages(financialAdvantages: ConceptFinancialAdvantage[]) {
        this.financialAdvantages = financialAdvantages;
        this.financialAdvantageIds = financialAdvantages.map(financialAdvantage => financialAdvantage.getId())
        return this;
    }

    withMoreInfo(websites: ConceptWebsite[]) {
        this.moreInfo = websites;
        this.moreInfoIds = websites.map(website => website.getId())
        return this;
    }

    withIsArchived(value:boolean =false) {
        this.isArchived = new Literal(value.toString(), undefined, 'http://mu.semte.ch/vocabularies/typed-literals/boolean');
        return this;
    }

    withDateCreated(date: Date) {
        this.dateCreated = new Literal(date.toISOString());
        return this;
    }

    withDateModified(date: Date) {
        this.dateModified = new Literal(date.toISOString());
        return this;
    }

    withGeneratedAtTime(date: Date) {
        this.generatedAtTime = new Literal(date.toISOString());
        return this;
    }

    withIsVersionOf(concept: Uri) {
        this.isVersionOf = concept;
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.productId, this.productId),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, description)),
            ...this.additionalDescriptions.map(additionalDescription => new Triple(this.id, Predicates.additionalDescription, additionalDescription)),
            ...this.exceptions.map(exception => new Triple(this.id, Predicates.exception, exception)),
            ...this.regulations.map(regulation => new Triple(this.id, Predicates.regulation, regulation)),
            new Triple(this.id, Predicates.startDate, this.startDate),
            new Triple(this.id, Predicates.endDate, this.endDate),
            new Triple(this.id, Predicates.productType, this.productType),
            ...this.targetAudiences.map(targetAudience => new Triple(this.id, Predicates.targetAudience, targetAudience)),
            ...this.themes.map(theme => new Triple(this.id, Predicates.thematicArea, theme)),
            ...this.competentAuthorityLevels.map(competentAuthorityLevel => new Triple(this.id, Predicates.competentAuthorityLevel, competentAuthorityLevel)),
            ...this.competentAuthorities.map(competentAuthority => new Triple(this.id, Predicates.hasCompetentAuthority, competentAuthority)),
            ...this.executingAuthorityLevels.map(executingAuthorityLevel => new Triple(this.id, Predicates.executingAuthorityLevel, executingAuthorityLevel)),
            ...this.executingAuthorities.map(executingAuthority => new Triple(this.id, Predicates.hasExecutingAuthority, executingAuthority)),
            ...this.conceptTags.map(conceptTag => new Triple(this.id, Predicates.conceptTag, conceptTag)),
            ...this.publicationMedium.map(publicationMedium => new Triple(this.id, Predicates.publicationMedium, publicationMedium)),
            ...this.yourEuropeCategories.map(yourEuropeCategory => new Triple(this.id, Predicates.yourEuropeCategory, yourEuropeCategory)),
            ...this.requirementIds.map(requirementId => new Triple(this.id, Predicates.hasRequirement, requirementId)),
            ...this.requirements.map(requirement => requirement.toTriples().getTriples()).flat(),
            ...this.procedureIds.map(procedureId => new Triple(this.id, Predicates.hasProcedure, procedureId)),
            ...this.procedures.map(procedure => procedure.toTriples().getTriples()).flat(),
            ...this.costIds.map(costId => new Triple(this.id, Predicates.hasCost, costId)),
            ...this.costs.map(cost => cost.toTriples().getTriples()).flat(),
            ...this.financialAdvantageIds.map(financialAdvantageId => new Triple(this.id, Predicates.hasFinancialAdvantage, financialAdvantageId)),
            ...this.financialAdvantages.map(financialAdvantage => financialAdvantage.toTriples().getTriples()).flat(),
            ...this.moreInfoIds.map(moreInfoId => new Triple(this.id, Predicates.hasMoreInfo, moreInfoId)),
            ...this.moreInfo.map(website => website.toTriples().getTriples()).flat(),
            ...this.keywords.map(keyword => new Triple(this.id, Predicates.keyword, keyword)),
            new Triple(this.id, Predicates.isVersionOf, this.isVersionOf),
            new Triple(this.id, Predicates.isArchived, this.isArchived),
            new Triple(this.id, Predicates.dateCreated, this.dateCreated),
            new Triple(this.id, Predicates.dateModified, this.dateModified),
            new Triple(this.id, Predicates.generatedAtTime, this.generatedAtTime),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext): Promise<TripleArray> {
        const conceptSnapshot = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc`, conceptSnapshot.asStringArray());
        return conceptSnapshot;
    }

}

export class ConceptRequirement {

    private id = new Uri(`http://data.lblod.info/id/requirement/${uuid()}`);
    private type = new Uri('http://data.europa.eu/m8g/Requirement');

    constructor(
        private titles: { value: string, language: Language }[],
        private descriptions: { value: string, language: Language }[],
        private order: string = '0',
        private supportingEvidence?: ConceptEvidence) {
    }

    getId(): Uri {
        return this.id;
    }

    toTriples() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, new Literal(title.value, title.language))),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, new Literal(description.value, description.language))),
            ...this.getSupportingEvidenceTriples(),
            new Triple(this.id, Predicates.order, new Literal(this.order, undefined, ''))
        ];
        return new TripleArray(triples);
    }

    private getSupportingEvidenceTriples(): Triple[] {
        if (!this.supportingEvidence) {
            return [];
        }
        return [
            new Triple(this.id, Predicates.hasSupportingEvidence, this.supportingEvidence.getId()),
            ...this.supportingEvidence.toTriples().getTriples(),
        ];
    }
}

export class ConceptEvidence {

    private id = new Uri(`http://data.lblod.info/id/evidence/${uuid()}`);
    private type = new Uri('http://data.europa.eu/m8g/Evidence');

    constructor(
        private titles: { value: string, language: Language }[],
        private descriptions: { value: string, language: Language }[]) {
    }

    getId(): Uri {
        return this.id;
    }

    toTriples() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, new Literal(title.value, title.language))),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, new Literal(description.value, description.language))),
        ];
        return new TripleArray(triples);
    }
}

export class ConceptProcedure {
    private id = new Uri(`http://data.lblod.info/id/rule/${uuid()}`);
    private type = new Uri('http://purl.org/vocab/cpsv#Rule');

    constructor(
        private titles: { value: string, language: Language }[],
        private descriptions: { value: string, language: Language }[],
        private order: string = '0',
        private websites: ConceptWebsite[] = []) {
    }

    getId(): Uri {
        return this.id;
    }

    toTriples() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, new Literal(title.value, title.language))),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, new Literal(description.value, description.language))),
            new Triple(this.id, Predicates.order, new Literal(this.order, undefined, '')),
            ...this.getWebsites()
        ];
        return new TripleArray(triples);
    }

    private getWebsites(): Triple[] {
        return this.websites.map(website => {
            return [
                new Triple(this.id, Predicates.hasWebsite, website.getId()),
                ...website.toTriples().getTriples(),
            ];
        }).flat();
    }
}

export class ConceptWebsite {
    private id = new Uri(`http://data.lblod.info/id/website/${uuid()}`);
    private type = new Uri('http://schema.org/WebSite');

    constructor(
        private titles: { value: string, language: Language }[],
        private descriptions: { value: string, language: Language }[],
        private url: Uri,
        private order: string = '0') {
    }

    getId() {
        return this.id;
    }

    toTriples() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, new Literal(title.value, title.language))),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, new Literal(description.value, description.language))),
            new Triple(this.id, Predicates.url, this.url),
            new Triple(this.id, Predicates.order, new Literal(this.order, undefined, ''))
        ];
        return new TripleArray(triples);
    }
}

export class ConceptCost {
    private id = new Uri(`http://data.lblod.info/id/cost/${uuid()}`);
    private type = new Uri('http://data.europa.eu/m8g/Cost');

    constructor(
        private titles: { value: string, language: Language }[],
        private descriptions: { value: string, language: Language }[],
        private order: string = '0') {
    }

    getId() {
        return this.id;
    }

    toTriples() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, new Literal(title.value, title.language))),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, new Literal(description.value, description.language))),
            new Triple(this.id, Predicates.order, new Literal(this.order, undefined, ''))
        ];
        return new TripleArray(triples);
    }
}

export class ConceptFinancialAdvantage {
    private id = new Uri(`http://data.lblod.info/id/financial-advantage/${uuid()}`);
    private type = new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage');

    constructor(
        private titles: { value: string, language: Language }[],
        private descriptions: { value: string, language: Language }[],
        private order: string = '0') {
    }

    getId() {
        return this.id;
    }

    toTriples() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, new Literal(title.value, title.language))),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, new Literal(description.value, description.language))),
            new Triple(this.id, Predicates.order, new Literal(this.order, undefined, ''))
        ];
        return new TripleArray(triples);
    }
}
