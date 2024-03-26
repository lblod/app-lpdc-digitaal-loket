//@ts-ignore
import SparqlClient from "sparql-client-2";
//@ts-ignore
import fs from "fs";
import {v4 as uuid} from "uuid";


async function main() {
    const instances = await getAllInstancesWithAtLeastOneLegalResource();
    console.log(`"${instances.length}" instanties te controleren`);
    const insertQuads = []

    let totalAmountOfLegalResources = 0
    for (const instance of instances) {
        instance.legalResources = await getAllLegalResourcesForInstance(instance);
        if (instance.legalResources.length < 1) {
            throw Error(`Had verwacht ten minste 1 legal resource te vinden voor instantie <${instance.instanceUri}>`);
        }
        totalAmountOfLegalResources += instance.legalResources.length

        const instanceQuads: string[] = legalResourcesFromInstanceToQuad(instance);
        insertQuads.push(...instanceQuads)
    }
    console.log(`"${totalAmountOfLegalResources}" legalResources te controleren`);

    fs.writeFileSync(`./migration-results/insertLegalResources.ttl`, insertQuads.join('\n'));
}

function legalResourcesFromInstanceToQuad(instance: Instance): string[] {
    const quads = []
    for (const legalResource of instance.legalResources) {
        const uniqueId = uuid()
        const legalResourceId = `http://data.lblod.info/id/legal-resource/${uniqueId}`

        quads.push(`<${instance.instanceUri}> <http://data.europa.eu/m8g/hasLegalResource> <${legalResourceId}> <${instance.graph}> .`)
        quads.push(`<${legalResourceId}> a <http://data.europa.eu/eli/ontology#LegalResource> <${instance.graph}> .`)
        quads.push(`<${legalResourceId}> <http://mu.semte.ch/vocabularies/core/uuid> "${uniqueId}" <${instance.graph}> .`)
        quads.push(`<${legalResourceId}> <http://schema.org/url> """${legalResource.url}""" <${instance.graph}> .`)
        quads.push(`<${legalResourceId}> <http://www.w3.org/ns/shacl#order> "${legalResource.order}"^^<http://www.w3.org/2001/XMLSchema#integer> <${instance.graph}> .`)

    }
    return quads;
}


async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function getAllInstancesWithAtLeastOneLegalResource(): Promise<Instance[]> {
    const query = `
        SELECT DISTINCT ?instance ?graph WHERE {
            GRAPH ?graph {
                ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
                ?instance <http://purl.org/dc/terms/source> ?concept.
            }
            GRAPH <http://mu.semte.ch/graphs/public> {
               ?concept <http://data.europa.eu/m8g/hasLegalResource> ?legalResource.
            }
         }        
        `;

    const response = await executeQuery(query);
    return response.map((binding: any) => (
        {
            instanceUri: binding.instance.value,
            legalResources: [],
            graph: binding.graph.value
        }));
}

async function getAllLegalResourcesForInstance(instance: Instance): Promise<LegalResource[]> {
    const query = `
        SELECT DISTINCT ?instance ?concept ?legalResource ?url ?order
        WHERE {
          GRAPH <${instance.graph}> {
                ?instance a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>.
                ?instance <http://purl.org/dc/terms/source> ?concept.
                FILTER(?instance = <${instance.instanceUri}> )
            }  
          GRAPH <http://mu.semte.ch/graphs/public> {
             ?concept <http://data.europa.eu/m8g/hasLegalResource> ?legalResource.
             ?legalResource a <http://data.europa.eu/eli/ontology#LegalResource>.
             ?legalResource <http://schema.org/url> ?url.
             ?legalResource <http://www.w3.org/ns/shacl#order> ?order.
           }
        }  
        `;

    const response = await executeQuery(query);
    return response.map((binding: any) => ({
        url: binding.url.value,
        order: binding.order.value
    }));
}


type Instance = {
    instanceUri: string,
    legalResources: LegalResource[],
    graph: string
};

type LegalResource = {
    url: string,
    order: string,
}


main();