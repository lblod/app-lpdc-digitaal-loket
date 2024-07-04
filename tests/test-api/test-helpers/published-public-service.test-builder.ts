import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {v4 as uuid} from 'uuid';
import {Language} from "./language";
import {insertTriples} from "./sparql";

export const PublishedPublicServiceType = 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#PublishedInstancePublicServiceSnapshot';

export class PublishedPublicServiceTestBuilder {
    private id = new Uri(`http://data.lblod.info/id/published-public-service/${uuid()}`);
    private type: Uri;
    private titles: Literal[] = [];
    private description: Literal;
    private dateCreated: Literal;
    private dateModified: Literal;
    private startDate: Literal;
    private endDate: Literal;
    private generatedAtTime: Literal;
    private isPublishedVersionOf: Uri;
    private datePublished: Literal;
    private createdBy: Uri

    static aMinimalPublishedService() {
        const instanceUuid = uuid();
        return new PublishedPublicServiceTestBuilder()
            .withId(new Uri(`http://data.lblod.info/id/published-public-service/${uuid()}`))
            .withType()
            .withTitle('Instance title', Language.INFORMAL)
            .withDescription('Instance description', Language.INFORMAL)
            .withDateCreated(new Date())
            .withDateModified(new Date())
            .withStartDate(new Date())
            .withEndDate(new Date())
            .withGeneratedAtTime(new Date())
            .withIsPublishedVersionOf(new Uri(`http://data.lblod.info/id/public-service/${instanceUuid}`))
    }

    private withType(): PublishedPublicServiceTestBuilder {
        this.type =  new Uri(PublishedPublicServiceType);
        return this;
    }

    withId(id: Uri): PublishedPublicServiceTestBuilder {
        this.id = id;
        return this;
    }

    withTitle(title: string, language: Language): PublishedPublicServiceTestBuilder {
        this.titles = [new Literal(title, language)];
        return this;
    }

    withDescription(description: string, language: Language): PublishedPublicServiceTestBuilder {
        this.description = new Literal(description, language);
        return this;
    }

    withDateCreated(date: Date): PublishedPublicServiceTestBuilder {
        this.dateCreated = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withDateModified(date: Date): PublishedPublicServiceTestBuilder {
        this.dateModified = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withStartDate(date: Date): PublishedPublicServiceTestBuilder {
        this.startDate = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withEndDate(date: Date): PublishedPublicServiceTestBuilder {
        this.endDate = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withGeneratedAtTime(date: Date): PublishedPublicServiceTestBuilder {
        this.generatedAtTime = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withIsPublishedVersionOf(instanceId: Uri): PublishedPublicServiceTestBuilder {
        this.isPublishedVersionOf = instanceId;
        return this;
    }

    withDatePublished(date: Date): PublishedPublicServiceTestBuilder {
        this.datePublished = new Literal(date.toISOString(), undefined, 'http://www.w3.org/2001/XMLSchema#dateTime');
        return this;
    }

    withCreatedBy(bestuurseenheidId: string){
        this.createdBy = new Uri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidId}`);
        return this;
    }

    buildTripleArray(organisationId: string): TripleArray {
        if(!this.createdBy) {
            this.withCreatedBy(organisationId);
        }

        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            new Triple(this.id, Predicates.description, this.description),
            new Triple(this.id, Predicates.dateCreated, this.dateCreated),
            new Triple(this.id, Predicates.dateModified, this.dateModified),
            new Triple(this.id, Predicates.startDate, this.startDate),
            new Triple(this.id, Predicates.endDate, this.endDate),
            new Triple(this.id, Predicates.createdBy, this.createdBy),
            new Triple(this.id, Predicates.datePublished, this.datePublished),
            new Triple(this.id, Predicates.isPublishedVersionOf, this.isPublishedVersionOf),
            new Triple(this.id, Predicates.generatedAtTime, this.generatedAtTime),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request, organisationId: string): Promise<TripleArray> {
        const publishedPublicService = this.buildTripleArray(organisationId);
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, publishedPublicService.asStringArray());
        return publishedPublicService;
    }
}