//@ts-ignore
import SparqlClient from "sparql-client-2";
// @ts-ignore
import fs from "fs";

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function instantiesZonderReviewStatus(): Promise<Instantie[]> {
    const response = await executeQuery(`
PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
PREFIX adms: <http://www.w3.org/ns/adms#>

select distinct ?bestuurseenheidGraph ?instantie ?instantieConceptSnapshot ?concept ?recentsteConceptSnapshot ?conceptStatus where {

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
            ?concept adms:status ?conceptStatus.
        }
    }

}`);
    return response.map((item: any) => ({
        bestuurseenheidGraph: item.bestuurseenheidGraph.value,
        instantie: item.instantie.value,
        instantieConceptSnapshot: item.instantieConceptSnapshot.value,
        concept: item.concept.value,
        conceptStatus: item.conceptStatus?.value,
        recentsteConceptSnapshot: item.recentsteConceptSnapshot.value
    }));
}

const cachedConceptSnapshotsFunctioneelVerschillend :{ [key:string]: boolean} = {};

async function zijnConceptSnapshotsFunctioneelVerschillend(ene: string, andere: string): Promise<boolean> {
    const cacheKey = `${ene}_${andere}`;
    if(cacheKey in cachedConceptSnapshotsFunctioneelVerschillend) {
        return cachedConceptSnapshotsFunctioneelVerschillend[cacheKey];
    }
    const queryParams = new URLSearchParams({
        currentSnapshotUri: ene,
        newSnapshotUri: andere
    });

    const response = await fetch(`${process.env.LPDC_MANAGEMENT_URL}/concept-snapshot-compare?${queryParams}`);
    if (!response.ok) {
        console.log(await response.text());
        throw Error(`Error ${response.status}: ${await response.text()}`);
    }
    const jsonResponse: { isChanged:boolean } = await response.json() as { isChanged:boolean };
    const result = jsonResponse.isChanged;
    cachedConceptSnapshotsFunctioneelVerschillend[cacheKey] = result;
    return result;
}

async function instantiesWaarvoorGekoppeldConceptSnapshotInhoudelijkVerschillendVanLaatsteConceptSnapshotOfConceptGearchiveerd(instantiesTeControleren: Instantie[]): Promise<Instantie[]> {
    const result: Instantie[] = [];
    for (let instantieTeControleren of instantiesTeControleren) {
        const conceptSnapshotsFunctioneelVerschillend = await zijnConceptSnapshotsFunctioneelVerschillend(instantieTeControleren.instantieConceptSnapshot, instantieTeControleren.recentsteConceptSnapshot);
        const conceptIsGearchiveerd = instantieTeControleren.conceptStatus !== undefined;

        //console.log(`${instantieTeControleren.instantie} review updated nodig (${conceptSnapshotsFunctioneelVerschillend}), of review gearchiveerd nodig (${conceptIsGearchiveerd})`);

        if(conceptSnapshotsFunctioneelVerschillend || conceptIsGearchiveerd) {
            result.push(instantieTeControleren);
        }
    }

    return result;
}

function reviewStatusVoorInstantieQuad(instantie: Instantie): string {
    const possibleReviewStatus = {
        conceptUpdated: 'http://lblod.data.gift/concepts/5a3168e2-f39b-4b5d-8638-29f935023c83',
        conceptArchived: 'http://lblod.data.gift/concepts/cf22e8d1-23c3-45da-89bc-00826eaf23c3'
    };
    const reviewStatus = instantie.conceptStatus !== null ? possibleReviewStatus.conceptArchived : possibleReviewStatus.conceptUpdated;
    return `<${instantie.instantie}> <http://mu.semte.ch/vocabularies/ext/reviewStatus> <${reviewStatus}> <${instantie.bestuurseenheidGraph}> .`;
}

async function main() {
    const instantiesTeControleren = await instantiesZonderReviewStatus();
    console.log(`"${instantiesTeControleren.length}" instanties te controleren`);

    const instantiesWaarvoorReviewStatusNodigIs = await instantiesWaarvoorGekoppeldConceptSnapshotInhoudelijkVerschillendVanLaatsteConceptSnapshotOfConceptGearchiveerd(instantiesTeControleren);
    console.log(`"${instantiesWaarvoorReviewStatusNodigIs.length}" instanties waarvoor review nodig is`);

    const quads: String[] = instantiesWaarvoorReviewStatusNodigIs.map(reviewStatusVoorInstantieQuad);
    fs.writeFileSync(`./migration-results/reviewStatussen.ttl`, quads.join('\n'));
}

type Instantie = {
    bestuurseenheidGraph: string
    instantie: string
    instantieConceptSnapshot: string
    concept: string,
    conceptStatus: string,
    recentsteConceptSnapshot: string
};

main();

