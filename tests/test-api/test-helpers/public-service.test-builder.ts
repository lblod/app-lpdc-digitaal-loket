import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {Language} from "./language";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";

export const PublicServiceType = 'http://purl.org/vocab/cpsv#PublicService';
export class PublicServiceTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/public-service/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private title: Literal;
    private description: Literal;
    private created: Literal;
    private modified: Literal;
    private startDate: Literal;
    private endDate: Literal;
    private productId: Literal;
    private yourEuropeCategory: Uri;
    private publicationMedium: Uri;

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

    withYourEuropeCategory() {
        this.yourEuropeCategory = new Uri('https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgPreventieveOpenbareGezondheidsmaatregelen');
        return this;
    }

    withPublicationMedium(publicationMedium = 'YourEurope') {
        this.publicationMedium = new Uri(`https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/${publicationMedium}`);
        return this;
    }

    withNoPublicationMedium() {
        this.publicationMedium = undefined;
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            new Triple(this.id, Predicates.title, this.title),
            new Triple(this.id, Predicates.description, this.description),
            new Triple(this.id, Predicates.created, this.created),
            new Triple(this.id, Predicates.modified, this.modified),
            new Triple(this.id, Predicates.startDate, this.startDate),
            new Triple(this.id, Predicates.endDate, this.endDate),
            new Triple(this.id, Predicates.productId, this.productId),
            new Triple(this.id, Predicates.yourEuropeCategory, this.yourEuropeCategory),
            new Triple(this.id, Predicates.publicationMedium, this.publicationMedium),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request, organisationId: string): Promise<any> {
        const publicService = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, publicService.asStringArray());
        return publicService;
    }

}
