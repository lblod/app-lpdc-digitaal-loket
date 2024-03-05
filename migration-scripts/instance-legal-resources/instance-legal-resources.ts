//@ts-ignore
import SparqlClient from "sparql-client-2";
//@ts-ignore
import fs from "fs";
import {v4 as uuid} from "uuid";


async function main() {
    const instances = await getAllInstancesWithLegalResources();
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
    let order = 1
    for (const lrUrl of instance.legalResources) {
        const uniqueId = uuid()
        const legalResourceId = `http://data.lblod.info/id/legal-resource/${uniqueId}`

        const hasLegalResource = `<${instance.instanceUri}> <http://data.europa.eu/m8g/hasLegalResource> <${legalResourceId}> <${instance.graph}> .`
        const legalResourceType = `<${legalResourceId}> a <http://data.europa.eu/eli/ontology#LegalResource> <${instance.graph}> .`
        const legalResourceUuid = `<${legalResourceId}> <http://mu.semte.ch/vocabularies/core/uuid> "${uniqueId}" <${instance.graph}> .`
        const legalResourceUrl = `<${legalResourceId}> <http://schema.org/url> """${lrUrl}""" <${instance.graph}> .`
        const legalResourceOrder = `<${legalResourceId}> <http://www.w3.org/ns/shacl#order> "${order}"^^<http://www.w3.org/2001/XMLSchema#integer> <${instance.graph}> .`

        quads.push(hasLegalResource)
        quads.push(legalResourceType)
        quads.push(legalResourceUuid)
        quads.push(legalResourceUrl)
        quads.push(legalResourceOrder)
        order++;
    }
    return quads

}


async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function getAllInstancesWithLegalResources(): Promise<Instance[]> {
    const query = `
        SELECT DISTINCT ?instance ?graph WHERE {
            GRAPH ?graph {
                ?instance a  <http://purl.org/vocab/cpsv#PublicService>.
                ?instance <http://purl.org/dc/terms/source> ?concept.
            }
            GRAPH <http://mu.semte.ch/graphs/public> {
               ?concept <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?latestConceptSnapshot.
            }
            GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
               ?latestConceptSnapshot <http://data.europa.eu/m8g/hasLegalResource> ?legalResource.
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

async function getAllLegalResourcesForInstance(instance: Instance): Promise<string[]> {
    const query = `
        SELECT DISTINCT ?legalResource WHERE {
            GRAPH <${instance.graph}> {
                ?instance a  <http://purl.org/vocab/cpsv#PublicService>.
                ?instance <http://purl.org/dc/terms/source> ?concept.
                FILTER(?instance = <${instance.instanceUri}> )
            }  
          GRAPH <http://mu.semte.ch/graphs/public> {
               ?concept <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> ?latestConceptSnapshot.
           }
          GRAPH <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc> {
             ?latestConceptSnapshot <http://data.europa.eu/m8g/hasLegalResource> ?legalResource.
           }
        }  
        `;

    const response = await executeQuery(query);
    return response.map((binding: any) => binding.legalResource.value);
}


type Instance = {
    instanceUri: string,
    legalResources: string[],
    graph: string,
};
type GroupedByGraphs = {
    [graph: string]: {
        [instanceUri: string]: string[];
    };
};


main();