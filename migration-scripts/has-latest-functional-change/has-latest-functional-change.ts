//@ts-ignore
import SparqlClient from "sparql-client-2";
// @ts-ignore
import fs from "fs";

//TODO LPDC-1166: remove

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function getAllConcepts() {
    const query = `
        SELECT distinct ?conceptUri WHERE {
            ?s <http://purl.org/dc/terms/isVersionOf> ?conceptUri .
            ?conceptUri a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> . 
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        conceptUri: binding.conceptUri.value,
    }));
}

async function getAllConceptSnapshotsOrderNewestFirst(conceptUri: string) {
    const query = `
        SELECT ?snapshotUri WHERE {
                <${conceptUri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .
                ?snapshotUri <http://purl.org/dc/terms/isVersionOf> <${conceptUri}> .
                ?snapshotUri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
        } ORDER BY DESC (?generatedAtTime)
    `;
    return (await executeQuery(query)).map((binding: any) => ({
        snapshotUri: binding.snapshotUri.value,
    }));
}

async function determineLatestFunctionalChangedSnapshot(concept: Concept) {
    let latestFunctionalChanged = concept.conceptSnapshots[0].snapshotUri
    if (concept.conceptSnapshots.length > 1) {
        for (let i = 1; i < concept.conceptSnapshots.length; i++) {
            if (!await zijnConceptSnapshotsFunctioneelVerschillend(latestFunctionalChanged, concept.conceptSnapshots[i].snapshotUri)) {
                latestFunctionalChanged = concept.conceptSnapshots[i].snapshotUri

            } else {
                break;
            }
        }
    }
    return latestFunctionalChanged;
}


async function zijnConceptSnapshotsFunctioneelVerschillend(ene: string, andere: string): Promise<boolean> {
    const queryParams = new URLSearchParams({
        currentSnapshotUri: ene,
        newSnapshotUri: andere
    });

    const response = await fetch(`${process.env.LPDC_MANAGEMENT_URL}/concept-snapshot-compare?${queryParams}`);
    if (!response.ok) {
        console.log(queryParams)
        console.log(await response.text());
        throw Error(`Error ${response.status}: ${await response.text()}`);
    }
    const jsonResponse: { isChanged: boolean } = await response.json() as { isChanged: boolean };
    console.log('Is changed ' + ene, andere,  jsonResponse.isChanged)
    return jsonResponse.isChanged;
}

function toQuad(concept: Concept): string {
    return `<${concept.conceptUri}> <http://data.lblod.info/vocabularies/lpdc/hasLatestFunctionalChange> <${concept.latestFunctionalChange}> <http://mu.semte.ch/graphs/public> .`
}

async function main() {
    const concepts: Concept[] = await getAllConcepts();
    console.log(`"${concepts.length}" concepten te controleren`);

    for (const concept of concepts) {
        concept.conceptSnapshots = await getAllConceptSnapshotsOrderNewestFirst(concept.conceptUri);
        console.log(`"${concept.conceptSnapshots.length}" conceptSnapshots te controleren`);

        concept.latestFunctionalChange = await determineLatestFunctionalChangedSnapshot(concept);
    }

    const quads = concepts.map(concept => toQuad(concept)).join('\n');
    fs.writeFileSync('./migration-results/hasLatestFunctionalChange.ttl', quads);
    console.log('Finished!');
}

main();

type Concept = {
    conceptUri: string,
    conceptSnapshots: Snapshot[],
    latestFunctionalChange: string
};

type Snapshot = {
    snapshotUri: string
}

