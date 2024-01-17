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
import {virtuosoUrl} from "./test-options";
import {ContactpointType} from "./contact-point-test.builder";
import {AddressType} from "./address.test-builder";

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
    await executeUpdate(request, query);
}

async function executeUpdate(request: APIRequestContext, query: string) {
    const response = await request.get(`${virtuosoUrl}/sparql`, {params: {query: query}});
    expect(response.ok(), await response.text()).toBeTruthy();
}

async function deleteAllOfType(request, type, virtuosoUrl) {
    const query = `
    DELETE WHERE {
        GRAPH ?g {
            ?s a <${type}>. 
            ?s ?rel ?o.
        }
    }
    `;
    //TODO by deleting all of type, all conceptSnapshots will also be deleted when deleting concepts.
    const response = await request.get(`${virtuosoUrl}/sparql`, {params: {query: query}});
    expect(response.ok()).toBeTruthy();
}

async function deleteAll(request: APIRequestContext) {
    await deleteAllOfType(request, ConceptType, virtuosoUrl);
    await deleteAllOfType(request, CostType, virtuosoUrl);
    await deleteAllOfType(request, EvidenceType, virtuosoUrl);
    await deleteAllOfType(request, FinancialAdvantageType, virtuosoUrl);
    await deleteAllOfType(request, FormalInformalChoiceType, virtuosoUrl);
    await deleteAllOfType(request, ProcedureType, virtuosoUrl);
    await deleteAllOfType(request, PublicServiceType, virtuosoUrl);
    await deleteAllOfType(request, RequirementType, virtuosoUrl);
    await deleteAllOfType(request, WebsiteType, virtuosoUrl);
    await deleteAllOfType(request, ContactpointType, virtuosoUrl);
    await deleteAllOfType(request, AddressType, virtuosoUrl);
}

async function fetchType(request: APIRequestContext, uri: string, type: string): Promise<TripleArray> {
    const query = `
    SELECT ?s ?p ?o WHERE {
        VALUES ?s { <${uri}> }
        ?s a <${type}> .
        ?s ?p ?o .
    }       
    `;
    const response = await request.get(`${virtuosoUrl}/sparql`, {params: {query: query, format: 'application/sparql-results+json'}});
    expect(response.ok(), await response.text()).toBeTruthy();
    return TripleArray.fromSparqlJsonResponse(await response.json());
}

export {
    insertTriples,
    deleteAll,
    fetchType,
    executeUpdate,
}
