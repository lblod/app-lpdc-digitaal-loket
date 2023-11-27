import {v4 as uuid} from 'uuid';
import {Language} from "./language";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";

export const EvidenceType = 'http://data.europa.eu/m8g/Evidence';

export default class EvidenceTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/evidence/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private titles: Literal[] = [];
    private descriptions: Literal[] = [];
    private source: Uri;
    private order: Literal;

    static anEvidence() {
        return new EvidenceTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitles([
                {value: 'evidence title nl', language: Language.NL},
                {value: 'evidence title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'evidence title generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withDescriptions([
                {value: 'evidence description nl', language: Language.NL},
                {value: 'evidence description generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'evidence description generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withOrder(1)
    }

    private withType() {
        this.type = new Uri(EvidenceType);
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

    withTitles(titles: {value: string, language: Language}[]) {
        this.titles = titles.map(item => new Literal(item.value, item.language));
        return this;
    }

    withDescription(description: string, language: Language) {
        this.descriptions = [new Literal(description, language)];
        return this;
    }

    withDescriptions(descriptions: {value: string, language: Language}[]) {
        this.descriptions = descriptions.map(item => new Literal(item.value, item.language));
        return this;
    }

    withSource(sourceEvidenceUri: string) {
        this.source = new Uri(sourceEvidenceUri);
        return this;
    }

    withOrder(value: number) {
        this.order = new Literal(value.toString());
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, description)),
            new Triple(this.id, Predicates.source, this.source),
            new Triple(this.id, Predicates.order, this.order),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext, organisatieId: string): Promise<TripleArray> {
        const graph = organisatieId ?
            `http://mu.semte.ch/graphs/organizations/${organisatieId}/LoketLB-LPDCGebruiker`
            : 'http://mu.semte.ch/graphs/public';
        const evidence = this.buildTripleArray();
        await insertTriples(request, graph, evidence.asStringArray());
        return evidence;
    }

}