import {v4 as uuid} from 'uuid';
import {Language} from "./language";
import {insertTriples} from "./sparql";
import {Literal, Predicates, Triple, TripleArray, Uri} from "./triple-array";
import {APIRequestContext} from "@playwright/test";

export const RequirementType = 'http://data.europa.eu/m8g/Requirement';

export class RequirementTestBuilder {

    private id = new Uri(`http://data.lblod.info/id/requirement/${uuid()}`);
    private type: Uri;
    private uuid: Literal;
    private titles: Literal[] = [];
    private descriptions: Literal[] = [];
    private supportingEvidence: Uri;
    private source: Uri;
    private order: Literal;

    static aRequirementForConcept() {
        return new RequirementTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitles([
                {value: 'requirement title nl', language: Language.NL},
                {value: 'requirement title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'requirement title generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withDescriptions([
                {value: 'requirement description nl', language: Language.NL},
                {value: 'requirement description generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'requirement description generated formal', language: Language.GENERATED_FORMAL},
            ])
            .withOrder(0)
    }
    static aRequirementForInstance() {
        return new RequirementTestBuilder()
            .withType()
            .withUUID(uuid())
            .withTitle('requirement title',Language.INFORMAL)
            .withDescription(
             'requirement description',Language.INFORMAL,
            )
            .withOrder(0)
    }

    private withType() {
        this.type = new Uri(RequirementType);
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

    withTitles(titles: { value: string, language: Language }[]) {
        this.titles = titles.map(item => new Literal(item.value, item.language));
        return this;
    }

    withDescription(description: string, language: Language) {
        this.descriptions = [new Literal(description, language)];
        return this;
    }

    withDescriptions(descriptions: { value: string, language: Language }[]) {
        this.descriptions = descriptions.map(item => new Literal(item.value, item.language));
        return this;
    }

    withSupportingEvidence(evidence: Uri) {
        this.supportingEvidence = evidence;
        return this;
    }

    withSource(conceptRequirementURI: Uri) {
        this.source = conceptRequirementURI;
        return this;
    }

    withOrder(value: number) {
        this.order = new Literal(value.toString(), undefined, 'http://www.w3.org/2001/XMLSchema#integer');
        return this;
    }

    buildTripleArray(): TripleArray {
        const triples = [
            new Triple(this.id, Predicates.type, this.type),
            new Triple(this.id, Predicates.uuid, this.uuid),
            ...this.titles.map(title => new Triple(this.id, Predicates.title, title)),
            ...this.descriptions.map(description => new Triple(this.id, Predicates.description, description)),
            new Triple(this.id, Predicates.hasSupportingEvidence, this.supportingEvidence),
            new Triple(this.id, Predicates.order, this.order)
        ];
        return new TripleArray(triples);
    }

    async buildAndPersist(request: APIRequestContext, organisatieId?: string): Promise<any> {
        const graph = organisatieId ?
            `http://mu.semte.ch/graphs/organizations/${organisatieId}/LoketLB-LPDCGebruiker`
            : 'http://mu.semte.ch/graphs/public';
        const requirement = this.buildTripleArray();
        await insertTriples(request, graph, requirement.asStringArray());
        return requirement;
    }

}