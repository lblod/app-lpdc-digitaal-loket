import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {TripleValue} from "./triple-value";
import {Language} from "./language";

export const PublicServiceType = 'http://purl.org/vocab/cpsv#PublicService';
export class PublicServiceTestBuilder {

    private id = `http://data.lblod.info/id/public-service/${uuid()}`;
    private type: TripleValue;
    private uuid: TripleValue;
    private title: TripleValue;
    private description: TripleValue;
    private dateCreated: TripleValue;
    private dateModified: TripleValue;
    private startDate: TripleValue;
    private endDate: TripleValue;
    private productId: TripleValue;
    private yourEuropeCategory: TripleValue;
    private publicationMedium: TripleValue;

    static aPublicService() {
        return new PublicServiceTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitle('Instance title', Language.NL)
            .withDescription('Instance description', Language.NL)
            .withDateCreated(new Date())
            .withDateModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withProductID(1000)
    }

    private withType() {
        this.type = new TripleValue(
            'PublicService',
            '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
            `<${PublicServiceType}>`
        )
        return this;
    }

    withUUID(uuid: string): PublicServiceTestBuilder {
        this.uuid = new TripleValue(
            uuid,
            "<http://mu.semte.ch/vocabularies/core/uuid>",
            `"${uuid}"`
        );
        return this;
    }

    withTitle(title: string, language: Language) {
        this.title = new TripleValue(
            title,
            "<http://purl.org/dc/terms/title>",
            `"${title}"@${language}`
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

    withDateCreated(date: Date) {
        this.dateCreated = new TripleValue(
            date.toISOString(),
            "<http://purl.org/dc/terms/created>",
            `"${date.toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
        );
        return this;
    }

    withDateModified(date: Date) {
        this.dateModified = new TripleValue(
            date.toISOString(),
            "<http://purl.org/dc/terms/modified>",
            `"${date.toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
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

    withYourEuropeCategory() {
        this.yourEuropeCategory = new TripleValue(
            "GezondheidszorgPreventieveOpenbareGezondheidsmaatregelen",
            "<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory>",
            "<https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgPreventieveOpenbareGezondheidsmaatregelen>"
        );
        return this;
    }

    withPublicationMedium(publicationMedium = 'YourEurope') {
        this.publicationMedium = new TripleValue(
            publicationMedium,
            "<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium>",
            `<https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/${publicationMedium}>`
        );
        return this;
    }

    withNoPublicationMedium() {
        this.publicationMedium = undefined;
        return this;
    }

    build() {
        return {
            id: this.id,
            type: this.type,
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            dateCreated: this.dateCreated,
            dateModified: this.dateModified,
            startDate: this.startDate,
            endDate: this.endDate,
            productId: this.productId,
            yourEuropeCategory: this.yourEuropeCategory,
            publicationMedium: this.publicationMedium,
            triples: this.buildTriples()
        }
    }

    buildTriples(): string[] {
        const values = [
            this.type,
            this.uuid,
            this.title,
            this.description,
            this.dateCreated,
            this.dateModified,
            this.startDate,
            this.endDate,
            this.productId,
            this.yourEuropeCategory,
            this.publicationMedium
        ];
        return values.filter(item => !!item).map(value => value.toTriple(this.id));
    }

    async buildAndPersist(request, organisationId: string): Promise<any> {
        const publicService = this.build();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, publicService.triples);
        return publicService;
    }

}
