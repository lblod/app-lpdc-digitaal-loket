import {v4 as uuid} from 'uuid';
import {insertTriples} from "./sparql";
import {pepingenId} from "./login";
import {TripleValue} from "./triple-value";
import type {APIRequestContext} from "@playwright/test";

export const FormalInformalChoiceType = 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FormalInformalChoice';

export class FormalInformalChoiceTestBuilder {

    private id = `http://data.lblod.info/id/formalInformalChoice/${uuid()}`;
    private type: TripleValue;
    private uuid: TripleValue;
    private chosenForm: TripleValue;
    private dateCreated: TripleValue;
    private bestuurseenheid: TripleValue;

    static aChoice() {
        return new FormalInformalChoiceTestBuilder()
            .withType()
            .withUUID(uuid())
            .withChosenForm('formal')
            .withDateCreated(new Date())
            .withBestuurseenheid(pepingenId)
    }

    private withType() {
        this.type = new TripleValue(
            'FormalInformalChoice',
            '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
            `<${FormalInformalChoiceType}>`
        )
        return this;
    }

    withUUID(uuid: string): FormalInformalChoiceTestBuilder {
        this.uuid = new TripleValue(
            uuid,
            "<http://mu.semte.ch/vocabularies/core/uuid>",
            `"${uuid}"`
        );
        return this;
    }

    withChosenForm(chosenForm: 'formal' | 'informal'): FormalInformalChoiceTestBuilder {
        this.chosenForm = new TripleValue(
            chosenForm,
            "<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#chosenForm>",
            `"${chosenForm}"`
        );
        return this;
    }

    withDateCreated(date: Date) {
        this.dateCreated = new TripleValue(
            date.toISOString(),
            "<http://schema.org/dateCreated>",
            `"${date.toISOString()}"`
        );
        return this;
    }

    withBestuurseenheid(bestuurseenheidId: string) {
        this.bestuurseenheid = new TripleValue(
            bestuurseenheidId,
            "<http://purl.org/dc/terms/relation>",
            `<http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidId}>`
        );
        return this;
    }

    build() {
        return {
            id: this.id,
            type: this.type,
            uuid: this.uuid,
            chosenForm: this.chosenForm,
            dateCreated: this.dateCreated,
            bestuurseenheid: this.bestuurseenheid,
            triples: this.buildTriples()
        }
    }

    buildTriples(): string[] {
        const values = [
            this.type,
            this.uuid,
            this.chosenForm,
            this.dateCreated,
            this.bestuurseenheid,
        ];
        return values.filter(item => !!item).map(value => value.toTriple(this.id));
    }

    async buildAndPersist(request: APIRequestContext): Promise<any> {
        const formalInformalChoice = this.build();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${this.bestuurseenheid.value}/LoketLB-LPDCGebruiker`, formalInformalChoice.triples);
        return formalInformalChoice;
    }

}
