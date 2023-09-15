import {v4 as uuid} from 'uuid';
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";

export const AddressType = 'http://www.w3.org/ns/location#Address';

export class AddressTestBuilder {

    private id: Uri = new Uri(`http://data.lblod.info/form-data/nodes/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private order: Literal;
    private straat: Literal;
    private huisnummer: Literal;
    private busnummer: Literal;
    private gemeente: Literal;
    private postcode: Literal;
    private land: Literal

    static anAddress() {
        return new AddressTestBuilder()
            .withType()
            .withUUID(uuid())
            .withOrder(1)
            .withStraat('Professor Roger Van Overstraetenplein')
            .withHuisnummer('1')
            .withBusnummer('')
            .withPostcode('3000')
            .withGemeente('Leuven')
            .withLand('België')
    }

    private withType() {
        this.type = new Uri(AddressType);
        return this;
    }

    withUUID(uuid: string) {
        this.uuid = new Literal(uuid);
        return this;
    }

    withOrder(value: number) {
        this.order = new Literal(value.toString());
        return this;
    }

    withStraat(straat: string) {
        this.straat = new Literal(straat);
        return this;
    }

    withHuisnummer(huisnummer: string) {
        this.huisnummer = new Literal(huisnummer);
        return this;
    }

    withBusnummer(bus: string) {
        this.busnummer = new Literal(bus);
        return this;
    }

    withGemeente(gemeente: string) {
        this.gemeente = new Literal(gemeente);
        return this;
    }

    withPostcode(postcode: string) {
        this.postcode = new Literal(postcode);
        return this;
    }

    withLand(land: string) {
        this.land = new Literal(land);
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            new Triple(this.id, Predicates.order, this.order),
            new Triple(this.id, Predicates.straatnaam, this.straat),
            new Triple(this.id, Predicates.huisnummer, this.huisnummer),
            new Triple(this.id, Predicates.busnummer, this.busnummer),
            new Triple(this.id, Predicates.postcode, this.postcode),
            new Triple(this.id, Predicates.gemeentenaam, this.gemeente),
            new Triple(this.id, Predicates.land, this.land),

        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext, organisationId: string): Promise<TripleArray> {
        const address = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${organisationId}/LoketLB-LPDCGebruiker`, address.asStringArray());
        return address;
    }
}