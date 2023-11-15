//@ts-ignore
import SparqlClient from "sparql-client-2";
// @ts-ignore
import fs from "fs";

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function instantiesNietGekoppeldAanLaatsteConceptSnapshot(): Promise<InstantieNietGekoppeldAanLaatsteConceptSnapshot[]> {
    const response = await executeQuery(`
PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
PREFIX adms: <http://www.w3.org/ns/adms#>

select distinct ?bestuurseenheidGraph ?instantie ?instantieConceptSnapshot ?concept ?recentsteConceptSnapshot where {

    GRAPH ?bestuurseenheidGraph {
        ?instantie a cpsv:PublicService .
        ?instantie ext:hasVersionedSource ?instantieConceptSnapshot .
        ?instantie dcterms:source ?concept .
        OPTIONAL {
            ?instantie ext:reviewStatus ?reviewStatus .
        }
        FILTER(!bound(?reviewStatus)) # neem instanties met een reviewStatus niet mee
    }

    GRAPH ?conceptGraph {
        ?concept ext:hasVersionedSource ?recentsteConceptSnapshot .
        OPTIONAL {
            ?concept adms:status ?conceptStatus .
        }
        FILTER(!bound(?conceptStatus)) # neem concepten met status gearchiveerd niet mee
    }

    FILTER(?instantieConceptSnapshot != ?recentsteConceptSnapshot)
}`);
    return response.map((item: any) => ({
        bestuurseenheidGraph: item.bestuurseenheidGraph.value,
        instantie: item.instantie.value,
        instantieConceptSnapshot: item.instantieConceptSnapshot.value,
        concept: item.concept.value,
        recentsteConceptSnapshot: item.recentsteConceptSnapshot.value
    }));
}

async function zijnConceptSnapshotsFunctioneelVerschillend(ene: string, andere: string): Promise<boolean> {
    const queryParams = new URLSearchParams({
        currentSnapshotUri: ene,
        newSnapshotUri: andere
    });

    const response = await fetch(`${process.env.LPDC_MANAGEMENT_URL}/concept-snapshot-compare?${queryParams}`);
    if (!response.ok) {
        console.log(await response.text());
        throw Error(`Error ${response.status}: ${await response.text()}`);
    }
    const jsonResponse: any = await response.json();
    return jsonResponse['isChanged'];
}

async function instantiesWaarvoorGekoppeldConceptSnapshotInhoudelijkVerschillendVanLaatsteConceptSnapshot(instantiesTeControleren: InstantieNietGekoppeldAanLaatsteConceptSnapshot[]): Promise<InstantieNietGekoppeldAanLaatsteConceptSnapshot[]> {

    const result: InstantieNietGekoppeldAanLaatsteConceptSnapshot[] = [];
    for (let instantieTeControleren of instantiesTeControleren) {
        const conceptSnapshotsFunctioneelVerschillend = await zijnConceptSnapshotsFunctioneelVerschillend(instantieTeControleren.instantieConceptSnapshot, instantieTeControleren.recentsteConceptSnapshot);
        console.log(`${instantieTeControleren.instantie} review nodig (${conceptSnapshotsFunctioneelVerschillend})`);
        if(conceptSnapshotsFunctioneelVerschillend) {
            result.push(instantieTeControleren);
        }
    }

    return result;
}

function reviewStatusHerzieningNodigVoorInstantieQuad(instantie: InstantieNietGekoppeldAanLaatsteConceptSnapshot): string {
    return `<${instantie.instantie}> <http://mu.semte.ch/vocabularies/ext/reviewStatus> <http://lblod.data.gift/concepts/5a3168e2-f39b-4b5d-8638-29f935023c83> <${instantie.bestuurseenheidGraph}> .`;
}

async function main() {
    const instantiesTeControleren = await instantiesNietGekoppeldAanLaatsteConceptSnapshot();
    console.log(`"${instantiesTeControleren.length}" instanties te controleren`);
//    console.log(JSON.stringify(instantiesTeControleren, null, 2));

    const instantiesWaarvoorReviewStatusNodigIs = await instantiesWaarvoorGekoppeldConceptSnapshotInhoudelijkVerschillendVanLaatsteConceptSnapshot(instantiesTeControleren);
    console.log(`"${instantiesWaarvoorReviewStatusNodigIs.length}" instanties waarvoor review nodig is`);
//    console.log(JSON.stringify(instantiesWaarvoorReviewStatusNodigIs, null, 2));

    const quads: String[] = instantiesWaarvoorReviewStatusNodigIs.map(reviewStatusHerzieningNodigVoorInstantieQuad);
    fs.writeFileSync(`./migration-results/reviewStatussen.ttl`, quads.join('\n'));

}

type InstantieNietGekoppeldAanLaatsteConceptSnapshot = {
    bestuurseenheidGraph: string
    instantie: string
    instantieConceptSnapshot: string
    concept: string
    recentsteConceptSnapshot: string
};

main();

