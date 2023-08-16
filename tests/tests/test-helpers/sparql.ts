import type {APIRequestContext} from "@playwright/test";
import {expect} from "@playwright/test";
import {TripleArray, Uri} from "./triple-array";
import {ConceptType} from "./concept.test-builder";
import {PublicServiceType} from "./public-service.test-builder";
import {RequirementType} from "./requirement.test-builder";
import {EvidenceType} from "./evidence.test-builder";
import {ProcedureType} from "./procedure.test-builder";
import {WebsiteType} from "./website.test-builder";
import {CostType} from "./cost.test-builder";
import {FinancialAdvantageType} from "./financial-advantage.test-builder";
import {FormalInformalChoiceType} from "./formal-informal-choice.test-builder";

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
    //TODO by deleting all of type, all conceptSnapshots will also be deleted when deleting concepts.
    const response = await request.get('http://localhost:8891/sparql', {params: {query: query}});
    expect(response.ok()).toBeTruthy();
}

async function deleteAll(request: APIRequestContext) {
    await deleteAllOfType(request, ConceptType);
    await deleteAllOfType(request, CostType);
    await deleteAllOfType(request, EvidenceType);
    await deleteAllOfType(request, FinancialAdvantageType);
    await deleteAllOfType(request, FormalInformalChoiceType);
    await deleteAllOfType(request, ProcedureType);
    await deleteAllOfType(request, PublicServiceType);
    await deleteAllOfType(request, RequirementType);
    await deleteAllOfType(request, WebsiteType);
}

async function fetchType(request: APIRequestContext, uri: string, type: string): Promise<TripleArray> {
    const query = `
    SELECT ?s ?p ?o WHERE {
        VALUES ?s { <${uri}> }
        ?s a <${type}> .
        ?s ?p ?o .
    }       
    `;
    const response = await request.get('http://localhost:8891/sparql', {params: {query: query, format: 'application/sparql-results+json'}});
    expect(response.ok(), await response.text()).toBeTruthy();
    return TripleArray.fromSparqlJsonResponse(await response.json());
}

export {
    insertTriples,
    deleteAll,
    fetchType,
}
