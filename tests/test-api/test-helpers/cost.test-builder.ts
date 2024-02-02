import {v4 as uuid} from 'uuid';
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {Language} from "./language";
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";

export const CostType = 'http://data.europa.eu/m8g/Cost';

export class CostTestBuilder {

    private id: Uri = new Uri(`http://data.lblod.info/id/cost/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private titles: Literal[] = [];
    private descriptions: Literal[] = [];
    private order: Literal;

    static aCostForConcept() {
        return new CostTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitles([
                {value: 'cost title nl', language: Language.NL},
                {value: 'cost title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'cost title generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withDescriptions([
                {value: 'cost description nl', language: Language.NL},
                {value: 'cost description generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'cost description generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withOrder(1)
    }
    static aCostForInstance() {
        return new CostTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitle('cost title',  Language.INFORMAL)
            .withDescription('cost description',  Language.INFORMAL)
            .withOrder(1)
    }

    private withType() {
        this.type = new Uri(CostType);
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

    withOrder(value: number) {
        this.order = new Literal(value.toString(), undefined, 'http://www.w3.org/2001/XMLSchema#integer');
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, description)),
            new Triple(this.id, Predicates.order, this.order),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext, organisatieId?: string): Promise<TripleArray> {
        const graph = organisatieId ?
            `http://mu.semte.ch/graphs/organizations/${organisatieId}/LoketLB-LPDCGebruiker`
            : 'http://mu.semte.ch/graphs/public';
        const cost = this.buildTripleArray();
        await insertTriples(request, graph, cost.asStringArray());
        return cost;
    }

}