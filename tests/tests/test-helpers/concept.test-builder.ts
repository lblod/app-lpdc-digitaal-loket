import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {TripleValue} from "./triple-value";
import {Language} from "./language";

export const ConceptType = 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService';

export class ConceptTestBuilder {

    private id = `https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`;
    private type: TripleValue;
    private uuid: TripleValue;
    private titles: TripleValue[] = [];
    private description: TripleValue;
    private startDate: TripleValue;
    private endDate: TripleValue;
    private productId: TripleValue;

    static aConcept() {
        return new ConceptTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitle('Concept title', Language.NL)
            .withDescription('Concept description', Language.NL)
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withProductID(1000)
    }

    private withType() {
        this.type = new TripleValue(
            'Concept',
            '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
            `<${ConceptType}>`
        )
        return this;
    }

    withUUID(uuid: string) {
        this.uuid = new TripleValue(
            uuid,
            "<http://mu.semte.ch/vocabularies/core/uuid>",
            `"${uuid}"`
        );
        return this;
    }

    withTitle(title: string, language: Language) {
        this.titles = [new TripleValue(
            title,
            "<http://purl.org/dc/terms/title>",
            `"${title}"@${language}`
        )];
        return this;
    }

    withTitles(titles: { title: string, language: Language }[]) {
        this.titles = titles.map(item =>
            new TripleValue(
                item.title,
                "<http://purl.org/dc/terms/title>",
                `"${item.title}"@${item.language}`
            )
        );
        return this;
    }

    withDescription(description: string, language: Language) {
        this.description = new TripleValue(
            description,
            "<http://purl.org/dc/terms/description>",
            `"${description}"@${language}`
        );
        return this;
    }

    withStartDate(date: Date) {
        this.startDate = new TripleValue(
            date.toISOString(),
            "<http://schema.org/startDate>",
            `"${date.toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
        );
        return this;
    }

    withEndDate(date: Date) {
        this.endDate = new TripleValue(
            date.toISOString(),
            "<http://schema.org/endDate>",
            `"${date.toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
        );
        return this;
    }

    withProductID(productId: number) {
        this.productId = new TripleValue(
            productId.toString(),
            "<http://schema.org/productID>",
            `"${productId}"^^<http://www.w3.org/2001/XMLSchema#string>`
        );
        return this;
    }

    build() {
        return {
            id: this.id,
            type: this.type,
            uuid: this.uuid,
            titles: this.titles,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            productId: this.productId,
            triples: this.buildTriples()
        }
    }

    buildTriples(): string[] {
        const values = [
            this.type,
            this.uuid,
            ...this.titles,
            this.description,
            this.startDate,
            this.endDate,
            this.productId,
        ];
        return values.filter(item => !!item).map(value => value.toTriple(this.id));
    }

    async buildAndPersist(request): Promise<any> {
        const concept = this.build();
        await insertTriples(request, `http://mu.semte.ch/graphs/public`, concept.triples);
        return concept;
    }

}
