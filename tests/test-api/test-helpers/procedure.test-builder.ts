import {v4 as uuid} from 'uuid';
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {Language} from "./language";
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";

export const ProcedureType = 'http://purl.org/vocab/cpsv#Rule';

export default class ProcedureTestBuilder {

    private id: Uri = new Uri(`http://data.lblod.info/id/rule/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private titles: Literal[] = [];
    private descriptions: Literal[] = [];
    private website: Uri;
    private source: Uri;
    private order: Literal

    static aProcedure() {
        return new ProcedureTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitles([
                {value: 'procedure title nl', language: Language.NL},
                {value: 'procedure title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'procedure title generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withDescriptions([
                {value: 'procedure description nl', language: Language.NL},
                {value: 'procedure description generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'procedure description generated formal', language: Language.GENERATED_FORMAL},
            ])
    }

    private withType() {
        this.type = new Uri(ProcedureType);
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

    withWebsite(websiteUri: Uri) {
        this.website = websiteUri;
        return this;
    }

    buildTripleArray() {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, description)),
            new Triple(this.id, Predicates.hasWebsite, this.website),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext, graph = 'http://mu.semte.ch/graphs/public'): Promise<TripleArray> {
        const procedure = this.buildTripleArray();
        await insertTriples(request, graph, procedure.asStringArray());
        return procedure;
    }

}