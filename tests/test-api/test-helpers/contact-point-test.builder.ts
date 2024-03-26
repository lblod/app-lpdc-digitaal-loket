import {v4 as uuid} from 'uuid';
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";

export const ContactpointType = 'http://schema.org/ContactPoint';

export class ContactPointTestBuilder {

    private id: Uri = new Uri(`http://data.lblod.info/form-data/nodes/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private order: Literal;
    private email: Literal;
    private url: Literal;
    private telephone: Literal;
    private openingHours: Literal;
    private address: Uri

    static aContactPoint() {
        return new ContactPointTestBuilder()
            .withType()
            .withUUID(uuid())
            .withEmail('test@example.com')
            .withTelephone('016123123')
            .withOpeningHours('Everyday')
            .withUrl('https://leuven.be')
            .withOrder(1)
    }

    private withType() {
        this.type = new Uri(ContactpointType);
        return this;
    }

    withUUID(uuid: string) {
        this.uuid = new Literal(uuid);
        return this;
    }

    withOrder(value: number) {
        this.order = new Literal(value.toString(), undefined, 'http://www.w3.org/2001/XMLSchema#integer');
        return this;
    }

    withEmail(value: string) {
        this.email = new Literal(value);
        return this;
    }

    withTelephone(value: string) {
        this.telephone = new Literal(value);
        return this;
    }

    withOpeningHours(value: string) {
        this.openingHours = new Literal(value);
        return this;
    }

    withUrl(value: string) {
        this.url = new Literal(value);
        return this;
    }

    withAddress(addressUri: Uri) {
        this.address = addressUri;
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            new Triple(this.id, Predicates.order, this.order),
            new Triple(this.id, Predicates.email, this.email),
            new Triple(this.id, Predicates.telephone, this.telephone),
            new Triple(this.id, Predicates.url, this.url),
            new Triple(this.id, Predicates.openingHours, this.openingHours),
            new Triple(this.id, Predicates.address, this.address),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext, organisationId: string): Promise<TripleArray> {
        const contactPoint = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, contactPoint.asStringArray());
        return contactPoint;
    }

}