import {v4 as uuid} from 'uuid';
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {APIRequestContext} from "@playwright/test";
import {insertTriples} from "./sparql";
import {pepingenId} from "./login";

export const ConceptDisplayConfigurationType = 'http://data.lblod.info/vocabularies/lpdc/ConceptDisplayConfiguration';

export class ConceptDisplayConfigurationTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/conceptual-display-configuration/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private conceptInstantiated: Literal;
    private conceptIsNew: Literal;
    private bestuurseenheidId: string;
    private bestuurseenheid: Uri;
    private concept: Uri;


    static aConceptDisplayConfiguration() {
        return new ConceptDisplayConfigurationTestBuilder()
            .withType()
            .withUUID(uuid())
            .withConceptInstantiated(false)
            .withConceptIsNew(true)
            .withConcept(new Uri(`https://ipdc.tni-vlaanderen.be/id/concept/${uuid()}`))
            .withBestuurseenheid(pepingenId)
    }

    private withType() {
        this.type = new Uri(ConceptDisplayConfigurationType);
        return this;
    }

    withUUID(uuid: string) {
        this.uuid = new Literal(uuid);
        return this;
    }

    withConceptInstantiated(value: boolean) {
        this.conceptInstantiated = new Literal(value.toString(), undefined, 'http://mu.semte.ch/vocabularies/typed-literals/boolean');
        return this;
    }

    withConceptIsNew(value: boolean) {
        this.conceptIsNew = new Literal(value.toString(), undefined, 'http://mu.semte.ch/vocabularies/typed-literals/boolean');
        return this;
    }

    withBestuurseenheid(bestuurseenheidId: string) {
        this.bestuurseenheidId = bestuurseenheidId;
        this.bestuurseenheid = new Uri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidId}`);
        return this;
    }

    withConcept(concept: Uri) {
        this.concept = concept;
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            new Triple(this.id, Predicates.conceptInstantiated, this.conceptInstantiated),
            new Triple(this.id, Predicates.conceptIsNew, this.conceptIsNew),
            new Triple(this.id, Predicates.relation, this.bestuurseenheid),
            new Triple(this.concept, Predicates.hasDisplayConfiguration, this.id)
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext): Promise<TripleArray> {
        const displayConfig = this.buildTripleArray();
        await insertTriples(request, `http://mu.semte.ch/graphs/organizations/${this.bestuurseenheidId}/LoketLB-LPDCGebruiker`, displayConfig.asStringArray());
        return displayConfig;
    }

}