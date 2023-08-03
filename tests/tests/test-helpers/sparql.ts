import type {APIRequestContext} from "@playwright/test";
import {expect} from "@playwright/test";

async function insertTriples(request: APIRequestContext, graph: string, triples: string[]): Promise<void> {
    const batches: string[][] = splitInBatches(triples);
    for (const batch of batches) {
        await executeInsertQuery(request, graph, batch);
    }
}

function splitInBatches(triples: string[]): string[][] {
    const batches = [];
    const chunkSize = 10;
    for (let i = 0; i < triples.length; i += chunkSize) {
        const chunk = triples.slice(i, i + chunkSize);
        batches.push(chunk);
    }
    return batches;
}

async function executeInsertQuery(request: APIRequestContext, graph: string, triples: string[]) {
    const query = `
     INSERT DATA {
            GRAPH <${graph}> {             
               ${triples.join('\n')}
            }
        }
    `;
    const response = await request.get('http://localhost:8891/sparql', {params: {query: query}});
    expect(response.ok(), await response.text()).toBeTruthy();
}

async function deleteAllOfType(request, type) {
    const query = `
    DELETE WHERE {
        GRAPH ?g {
            ?s a <${type}>.
            ?s ?rel ?o.
        }
    }
    `;
    const response = await request.get('http://localhost:8891/sparql', {params: {query: query}});
    expect(response.ok()).toBeTruthy();
}

export {
    insertTriples,
    deleteAllOfType
}
