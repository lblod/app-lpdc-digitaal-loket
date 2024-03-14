import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {pepingenId} from "./login";
import type {APIRequestContext} from "@playwright/test";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";

export const FormalInformalChoiceType = 'http://data.lblod.info/vocabularies/lpdc/FormalInformalChoice';

export enum ChosenForm {
    FORMAL = 'formal',
    INFORMAL = 'informal',
}

export class FormalInformalChoiceTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/formalInformalChoice/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private chosenForm: Literal;
    private dateCreated: Literal;
    private bestuurseenheid: Uri;
    private bestuurseenheidId = pepingenId;

    static aChoice() {
        return new FormalInformalChoiceTestBuilder()
            .withType()
            .withUUID(uuid())
            .withChosenForm(ChosenForm.FORMAL)
            .withDateCreated(new Date())
            .withBestuurseenheid(pepingenId)
    }

    private withType() {
        this.type = new Uri(FormalInformalChoiceType);
        return this;
    }

    withUUID(uuid: string) {
        this.uuid = new Literal(uuid);
        return this;
    }

    withChosenForm(chosenForm: ChosenForm): FormalInformalChoiceTestBuilder {
        this.chosenForm = new Literal(chosenForm);
        return this;
    }

    withDateCreated(date: Date) {
        this.dateCreated = new Literal(date.toISOString());
        return this;
    }

    withBestuurseenheid(bestuurseenheidId: string) {
        this.bestuurseenheidId = bestuurseenheidId;
        this.bestuurseenheid = new Uri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidId}`);
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            new Triple(this.id, Predicates.chosenForm, this.chosenForm),
            new Triple(this.id, Predicates.dateCreated, this.dateCreated),
            new Triple(this.id, Predicates.relation, this.bestuurseenheid),
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext): Promise<any> {
        const formalInformalChoice = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${this.bestuurseenheidId}/LoketLB-LPDCGebruiker`, formalInformalChoice.asStringArray());
        return formalInformalChoice;
    }
}
