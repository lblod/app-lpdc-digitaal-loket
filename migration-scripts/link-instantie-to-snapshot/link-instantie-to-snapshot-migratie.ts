//@ts-ignore
import * as SparqlClient from "sparql-client-2";
import {first, last, minBy} from 'lodash';
import * as fs from "fs";

export const DATE_17_JULY = '2023-07-17T00:00:00.000Z';

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

export type Instance = {
    uri: string,
    concept: Concept,
    graphUri: string,
    created: string,
    modified: string,
    snapshotUri?: string;
}

export type Concept = {
    uri: string,
    status?: string
}

export type ConceptSnapshot = {
    uri: string,
    generatedAtTime: string,
}

function toQuad(instance: Instance): string {
    if(instance.snapshotUri === undefined) {
        throw new Error(`No snapshot found for instance ${instance.uri}`);
    }
    return `<${instance.uri}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <${instance.snapshotUri}> <${instance.graphUri}> .`
}

async function getInstancesWithConcept(): Promise<Instance[]> {
    const query = `
        SELECT ?instance ?concept ?bestuurseenheidsGraph ?created ?modified ?conceptStatus WHERE {
            GRAPH ?bestuurseenheidsGraph {
                ?instance a <http://purl.org/vocab/cpsv#PublicService> .
                ?instance <http://purl.org/dc/terms/created> ?created .
                ?instance <http://purl.org/dc/terms/modified> ?modified .
                ?instance <http://purl.org/dc/terms/source> ?concept .
            }
            
            OPTIONAL {
               GRAPH <http://mu.semte.ch/graphs/public> {                
                    ?concept <http://www.w3.org/ns/adms#status> ?conceptStatus.  
                }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.instance.value,
        concept: {
            uri: binding.concept.value,
            status: binding.conceptStatus?.value,
        },
        graphUri: binding.bestuurseenheidsGraph.value,
        created: binding.created.value,
        modified: binding.modified.value,
    }));
}

async function findSnapshotsOrderedQuery(concept: Concept): Promise<ConceptSnapshot[]> {
    const query = `
        SELECT ?snapshotUri ?generatedAtTime WHERE {
                <${concept.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> .
                ?snapshotUri <http://purl.org/dc/terms/isVersionOf> <${concept.uri}> .
                ?snapshotUri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
        } ORDER BY ?generatedAtTime
    `;
    return (await executeQuery(query)).map((binding: any) => ({
        uri: binding.snapshotUri.value,
        generatedAtTime: binding.generatedAtTime.value,
    }));
}

const cachedConcepts: { uri: string, snapshots: ConceptSnapshot[] }[] = [];

async function findSnapshotsOrdered(concept: Concept): Promise<ConceptSnapshot[]> {
    const cachedConcept = cachedConcepts.find(c => c.uri === concept.uri);
    if (cachedConcept) {
        return cachedConcept.snapshots;
    } else {
        const snapshots = await findSnapshotsOrderedQuery(concept);
        cachedConcepts.push({uri: concept.uri, snapshots: snapshots});
        return snapshots;
    }
}

export function findFirstSnapshotAfterDate(snapshots: ConceptSnapshot[], date: string): ConceptSnapshot | undefined {
    return first(snapshots.filter(snapshot => snapshot.generatedAtTime > date));
}

export function findLastSnapshotBeforeDate(snapshots: ConceptSnapshot[], date: string): ConceptSnapshot | undefined {
    return last(snapshots.filter(snapshot => snapshot.generatedAtTime < date));
}

export function findPossibleSnapshotsToLink(instance: Instance, snapshots: ConceptSnapshot[]): ConceptSnapshot[] {
    const snapshotBeforeInstanceModified = snapshots.filter(snapshot => snapshot.generatedAtTime < instance.modified);
    const snapshotInstanceWasCreatedWith = last(snapshots.filter(snapshot => snapshot.generatedAtTime < instance.created))
    return snapshotBeforeInstanceModified.slice(snapshotBeforeInstanceModified.indexOf(snapshotInstanceWasCreatedWith!));
}

export const archivedStatusConcept = 'http://lblod.data.gift/concepts/3f2666df-1dae-4cc2-a8dc-e8213e713081';

export function determineSnapshotToLinkToInstance(instance: Instance, orderedSnapshots: ConceptSnapshot[]): ConceptSnapshot {
    if (instance.concept.status !== undefined) {
        return orderedSnapshots[orderedSnapshots.length - 1];
    } else {
        const possibleSnapshots = findPossibleSnapshotsToLink(instance, orderedSnapshots);

        if (possibleSnapshots.length === 1) {
            return possibleSnapshots[0];
        } else if (findLastSnapshotBeforeDate(possibleSnapshots, DATE_17_JULY) !== undefined) {
            return findLastSnapshotBeforeDate(possibleSnapshots, DATE_17_JULY)!;
        } else if (findFirstSnapshotAfterDate(possibleSnapshots, DATE_17_JULY) !== undefined) {
            return findFirstSnapshotAfterDate(possibleSnapshots, DATE_17_JULY)!;
        } else {
            throw new Error(`No snapshot selected for instance ${instance.uri}`)
        }
    }
}

export async function main() {
    const instances = await getInstancesWithConcept();
    console.log(`Processing ${instances.length} instances..`);
    for (const instance of instances) {
        const orderedSnapshots = await findSnapshotsOrdered(instance.concept);
        const snapshotToLink = determineSnapshotToLinkToInstance(instance, orderedSnapshots);
        instance.snapshotUri = snapshotToLink.uri;
    }
    console.log(`executed concept query ${cachedConcepts.length} times`);

    console.log('Generating ttl file..');
    const quads = instances.map(instance => toQuad(instance)).join('\n');
    fs.writeFileSync('./migration-results/hasVersionedSource.ttl', quads);
    console.log('Finished!');
}
