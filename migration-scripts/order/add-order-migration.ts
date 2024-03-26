//@ts-ignore
import * as SparqlClient from "sparql-client-2";
import * as fs from "fs";

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

export type Instance = {
    uri: string,
    graphUri: string,
    requirements: Requirement[],
    procedures: Procedure[],
    websites: Website[],
    costs: Cost[],
    financialAdvantages: FinancialAdvantage[],
    contactPoints: ContactPoint[]
}

export type Orderable = {
    uri: string,
    order?:string
}

export type Requirement = {
    uri: string,
    order?: string,
}

export type Procedure = {
    uri: string,
    order?: string
    websites: Website[]
}

export type Website = {
    uri: string,
    order?: string
}

export type Cost = {
    uri: string,
    order?: string
}

export type FinancialAdvantage = {
    uri: string,
    order?: string
}

export type ContactPoint = {
    uri: string,
    order?: string
}

async function findInstances(): Promise<Instance[]> {
    const query = `
        SELECT ?instance ?graph WHERE {
            GRAPH ?graph {
                ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.instance.value,
        graphUri: binding.graph.value,
        requirements: [],
        procedures: [],
        websites: [],
        costs: [],
        contactPoints: []
    }));
}

async function findRequirementsFor(instance: Instance): Promise<Requirement[]> {
    const query = `
        SELECT ?requirementUri ?order WHERE {
            GRAPH ?graph {
                <${instance.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                <${instance.uri}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> ?requirementUri .
                ?requirementUri a <http://data.europa.eu/m8g/Requirement> .
                OPTIONAL { ?requirementUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.requirementUri.value,
        order: binding.order?.value,
    }))
}

async function findProceduresFor(instance: Instance): Promise<Procedure[]> {
    const query = `
        SELECT ?procedureUri ?order WHERE {
            GRAPH ?graph {
                <${instance.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                <${instance.uri}> <http://purl.org/vocab/cpsv#follows> ?procedureUri .
                ?procedureUri a <http://purl.org/vocab/cpsv#Rule> .
                OPTIONAL { ?procedureUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.procedureUri.value,
        order: binding.order?.value,
    }))
}

async function findProcedureWebsites(procedure: Procedure): Promise<Website[]> {
    const query = `
        SELECT ?websiteUri ?order WHERE {
            GRAPH ?graph {
                <${procedure.uri}> a <http://purl.org/vocab/cpsv#Rule> .
                <${procedure.uri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> ?websiteUri .
                ?websiteUri a <http://schema.org/WebSite> .
                OPTIONAL { ?websiteUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.websiteUri.value,
        order: binding.order?.value,
    }))
}

async function findWebsites(instance: Instance): Promise<Website[]> {
    const query = `
        SELECT ?websiteUri ?order WHERE {
            GRAPH ?graph {
                <${instance.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                <${instance.uri}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> ?websiteUri .
                ?websiteUri a <http://schema.org/WebSite> .
                OPTIONAL { ?websiteUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.websiteUri.value,
        order: binding.order?.value,
    }))
}

async function findCostsFor(instance: Instance): Promise<Cost[]> {
    const query = `
        SELECT ?costUri ?order WHERE {
            GRAPH ?graph {
                <${instance.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                <${instance.uri}> <http://data.europa.eu/m8g/hasCost> ?costUri .
                ?costUri a <http://data.europa.eu/m8g/Cost> .
                OPTIONAL { ?costUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.costUri.value,
        order: binding.order?.value,
    }))
}

async function findFinancialAdvantageFor(instance: Instance): Promise<FinancialAdvantage[]> {
    const query = `
        SELECT ?financialAdvantageUri ?order WHERE {
            GRAPH ?graph {
                <${instance.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                <${instance.uri}> <http://purl.org/vocab/cpsv#produces> ?financialAdvantageUri .
                ?financialAdvantageUri a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage> .
                OPTIONAL { ?financialAdvantageUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.financialAdvantageUri.value,
        order: binding.order?.value,
    }))
}

async function findContactPointsFor(instance: Instance): Promise<ContactPoint[]> {
    const query = `
        SELECT ?contactPointUri ?order WHERE {
            GRAPH ?graph {
                <${instance.uri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .
                <${instance.uri}> <http://data.europa.eu/m8g/hasContactPoint> ?contactPointUri .
                ?contactPointUri a <http://schema.org/ContactPoint> .
                OPTIONAL { ?contactPointUri <http://www.w3.org/ns/shacl#order> ?order . }
            }
        }
    `;
    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        uri: binding.contactPointUri.value,
        order: binding.order?.value,
    }))
}

function validateEitherAllOrdersFilledInOrNone(arrayWithOrders: Orderable[]) {
    const allDefined = arrayWithOrders.every(orderable => orderable.order != undefined);
    const allUndefined = arrayWithOrders.every(orderable => orderable.order === undefined);
    if (!(allDefined || allUndefined)) {
        throw new Error("Not all orders are defined or undefined");
    }
}

function createQuadsIfUndefined(arrayWithOrders: Orderable[], graph: string): string[] {
    return arrayWithOrders
        .filter((value) => value.order === undefined)
        .map((value, index) => `<${value.uri}> <http://www.w3.org/ns/shacl#order> "${index + 1}"^^<http://www.w3.org/2001/XMLSchema#integer> <${graph}> .`);
}

export async function main() {
    const instances = await findInstances();
    const quads = []
    for (const instance of instances) {
        instance.requirements = await findRequirementsFor(instance)
        validateEitherAllOrdersFilledInOrNone(instance.requirements);
        instance.procedures = await findProceduresFor(instance);
        validateEitherAllOrdersFilledInOrNone(instance.procedures);
        for (const procedure of instance.procedures) {
            procedure.websites = await findProcedureWebsites(procedure);
            validateEitherAllOrdersFilledInOrNone(procedure.websites);
        }
        instance.websites = await findWebsites(instance);
        validateEitherAllOrdersFilledInOrNone(instance.websites);
        instance.costs = await findCostsFor(instance);
        validateEitherAllOrdersFilledInOrNone(instance.costs);
        instance.financialAdvantages = await findFinancialAdvantageFor(instance);
        validateEitherAllOrdersFilledInOrNone(instance.financialAdvantages);
        instance.contactPoints = await findContactPointsFor(instance);
        validateEitherAllOrdersFilledInOrNone(instance.contactPoints);

        const quadsForInstance = [
            ...createQuadsIfUndefined(instance.requirements, instance.graphUri),
            ...createQuadsIfUndefined(instance.procedures, instance.graphUri),
            ...instance.procedures.flatMap(procedure => createQuadsIfUndefined(procedure.websites, instance.graphUri)),
            ...createQuadsIfUndefined(instance.websites, instance.graphUri),
            ...createQuadsIfUndefined(instance.costs, instance.graphUri),
            ...createQuadsIfUndefined(instance.financialAdvantages, instance.graphUri),
            ...createQuadsIfUndefined(instance.contactPoints, instance.graphUri),
        ];
        quads.push(...quadsForInstance)
    }
    fs.writeFileSync(`./migration-results/add-order.ttl`, quads.join('\n'));
}