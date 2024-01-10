import {Language} from "./language";

export class TripleArray {
    private triples: Triple[] = [];

    constructor(triples: Triple[]) {
        this.triples = triples.filter(triple => triple.object !== undefined);
    }

    static fromSparqlJsonResponse(data: { results: { bindings: [] } }): TripleArray {
        const triples = data.results.bindings.map(binding => Triple.fromSparqlJsonResponse(binding));
        return new TripleArray(triples);
    }

    getTriples(): Triple[] {
        return this.triples;
    }

    getUUID(): string {
        return this.findTriple(Predicates.uuid).getObjectValue();
    }

    getSubject(): Uri {
        return this.findTriple(Predicates.type).subject;
    }

    findObjects(predicate: Uri): (Literal | Uri)[] {
        return this.triples
            .filter(triple => triple.predicate.isEqualTo(predicate.getValue()))
            .map(triple => triple.object);
    }

    findObject(predicate: Uri): Uri | Literal {
        try {
            return this.triples
                .find(triple => triple.predicate.isEqualTo(predicate.getValue()))
                .object;
        } catch (e) {
            throw Error(`Error in findObject: Unable to find object for predicate '${predicate}'`);
        }
    }

    findAllTriples(predicate: Uri): Triple[] {
        return this.triples.filter(triple => triple.predicate.isEqualTo(predicate.getValue()));
    }

    findTriple(predicate: Uri): Triple {
        return this.triples.find(triple => triple.predicate.isEqualTo(predicate.getValue()));
    }

    asStringArray(): string[] {
        return this.triples.map(triple => triple.toString())
    }

}

export class Triple {

    constructor(
        public subject: Uri,
        public predicate: Uri,
        public object: Literal | Uri) {
    }

    toString() {
        return `${this.subject.toString()} ${this.predicate.toString()} ${this.object.toString()} .`
    }

    static fromSparqlJsonResponse(binding: any): Triple {
        return new Triple(
            new Uri(binding.s.value),
            new Uri(binding.p.value),
            binding.o.type === 'uri' ? new Uri(binding.o.value) : new Literal(binding.o.value, binding.o['xml:lang'], binding.o.datatype)
        );
    }

    getSubjectValue() {
        return this.subject.getValue();
    }

    getObjectValue() {
        return this.object.getValue();
    }
}

export class Uri {

    constructor(private value: string) {
    }

    getValue(): string {
        return this.value;
    }

    isEqualTo(value: string): Boolean {
        return this.value === value;
    }

    toString(): string {
        return `<${this.value}>`
    }
}

export class Literal {

    constructor(
        private value: string,
        private language?: Language,
        private dataType?: string,
    ) {
    }

    getValue(): string {
        return this.value;
    }

    getLanguage(): Language {
        return this.language;
    }

    toString(): string {
        if (this.language) {
            return `"${this.value}"@${this.language}`
        } else if (this.dataType) {
            return `"${this.value}"^^<${this.dataType}>`
        } else {
            return `"${this.value}"`
        }
    }
}

export const Predicates = {
    type: new Uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    uuid: new Uri('http://mu.semte.ch/vocabularies/core/uuid'),
    title: new Uri('http://purl.org/dc/terms/title'),
    description: new Uri('http://purl.org/dc/terms/description'),
    additionalDescription: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription'),
    exception: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception'),
    regulation: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation'),
    startDate: new Uri('http://schema.org/startDate'),
    endDate: new Uri('http://schema.org/endDate'),
    productId: new Uri('http://schema.org/productID'),
    created: new Uri('http://purl.org/dc/terms/created'),
    modified: new Uri('http://purl.org/dc/terms/modified'),
    source: new Uri('http://purl.org/dc/terms/source'),
    createdBy: new Uri('http://purl.org/pav/createdBy'),
    hasExecutingAuthority: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority'),
    status: new Uri('http://www.w3.org/ns/adms#status'),
    hasRequirement: new Uri('http://vocab.belgif.be/ns/publicservice#hasRequirement'),
    chosenForm: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#chosenForm'),
    dateCreated: new Uri('http://schema.org/dateCreated'),
    dateModified: new Uri('http://schema.org/dateModified'),
    generatedAtTime: new Uri('http://www.w3.org/ns/prov#generatedAtTime'),
    relation: new Uri('http://purl.org/dc/terms/relation'),
    yourEuropeCategory: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory'),
    publicationMedium: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium'),
    hasSupportingEvidence: new Uri('http://data.europa.eu/m8g/hasSupportingEvidence'),
    hasWebsite: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite'),
    hasProcedure: new Uri('http://purl.org/vocab/cpsv#follows'),
    url: new Uri('http://schema.org/url'),
    hasMoreInfo: new Uri('http://www.w3.org/2000/01/rdf-schema#seeAlso'),
    hasCost: new Uri('http://data.europa.eu/m8g/hasCost'),
    hasFinancialAdvantage: new Uri('http://purl.org/vocab/cpsv#produces'),
    conceptInstantiated: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptInstantiated'),
    conceptIsNew: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptIsNew'),
    hasDisplayConfiguration: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration'),
    thematicArea: new Uri('http://data.europa.eu/m8g/thematicArea'),
    targetAudience: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience'),
    language: new Uri('http://publications.europa.eu/resource/authority/language'),
    competentAuthorityLevel: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel'),
    executingAuthorityLevel: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel'),
    keyword: new Uri('http://www.w3.org/ns/dcat#keyword'),
    productType: new Uri('http://purl.org/dc/terms/type'),
    conceptTag: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag'),
    order: new Uri('http://www.w3.org/ns/shacl#order'),
    hasContactPoint: new Uri('http://data.europa.eu/m8g/hasContactPoint'),
    telephone: new Uri('http://schema.org/telephone'),
    openingHours: new Uri('http://schema.org/openingHours'),
    email: new Uri('http://schema.org/email'),
    address: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address'),
    land: new Uri('https://data.vlaanderen.be/ns/adres#land'),
    gemeentenaam: new Uri('https://data.vlaanderen.be/ns/adres#gemeentenaam'),
    huisnummer: new Uri('https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer'),
    busnummer: new Uri('https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer'),
    postcode: new Uri('https://data.vlaanderen.be/ns/adres#postcode'),
    straatnaam: new Uri('https://data.vlaanderen.be/ns/adres#Straatnaam'),
    addressRegisterId: new Uri('https://data.vlaanderen.be/ns/adres#verwijstNaar'),
    spatial: new Uri('http://purl.org/dc/terms/spatial'),
    hasCompetentAuthority: new Uri('http://data.europa.eu/m8g/hasCompetentAuthority'),
    isVersionOf: new Uri('http://purl.org/dc/terms/isVersionOf'),
    snapshotType: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType'),
    hasVersionedSource: new Uri('http://mu.semte.ch/vocabularies/ext/hasVersionedSource'),
    hasLatestFunctionalChange: new Uri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasLatestFunctionalChange'),
    reviewStatus: new Uri('http://mu.semte.ch/vocabularies/ext/reviewStatus'),
    formerType: new Uri('https://www.w3.org/ns/activitystreams#formerType'),
    deleteTime: new Uri('https://www.w3.org/ns/activitystreams#deleted')
}
