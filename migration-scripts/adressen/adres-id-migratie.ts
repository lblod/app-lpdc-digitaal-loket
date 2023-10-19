//@ts-ignore
import SparqlClient from "sparql-client-2";
import * as fs from 'fs';
import {processPromisesBatch} from "./batch-promise";

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function getAddresses(): Promise<Address[]> {
    const response = await executeQuery(`
        select distinct ?graph ?s ?address ?straat ?huisnummer ?bus ?gemeente ?postcode ?land where {
            GRAPH ?graph {
                ?s a <http://purl.org/vocab/cpsv#PublicService> .
                ?s <http://data.europa.eu/m8g/hasContactPoint> ?contactPoint .
                ?contactPoint <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address> ?address .
                ?address <https://data.vlaanderen.be/ns/adres#Straatnaam> ?straat .
                ?address <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> ?huisnummer .
                ?address <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer> ?bus .
                ?address <https://data.vlaanderen.be/ns/adres#gemeentenaam> ?gemeente . 
                ?address <https://data.vlaanderen.be/ns/adres#postcode> ?postcode .
                ?address <https://data.vlaanderen.be/ns/adres#land> ?land .
            }
        }
    `);
    return response.map((item: any) => ({
        graph: item.graph.value,
        publicService: item.s.value,
        address: item.address.value,
        straat: item.straat.value,
        huisnummer: item.huisnummer.value,
        bus: item.bus.value,
        postcode: item.postcode.value,
        gemeente: item.gemeente.value,
        land: item.land.value
    }));
}

async function findAddressMatch(address: Address) {
    const queryParams = new URLSearchParams({
        gemeentenaam: address.gemeente,
        postcode: address.postcode,
        straatnaam: address.straat,
        huisnummer: address.huisnummer,
    });
    if (address.bus && address.bus.trim()) {
        queryParams.set('busnummer', address.bus);
    }

    const response = await fetch(
        `https://api.basisregisters.vlaanderen.be/v2/adresmatch?${queryParams}`,
        {headers: {'x-api-key': process.env.ADRESSEN_REGISTER_API_KEY || ''}}
    );
    if (!response.ok) {
        if (response.status != 400) {
            throw Error(`Error ${response.status}: ${await response.text()}`)
        }
    }
    const jsonResponse: any = await response.json();
    if (jsonResponse?.adresMatches?.length && jsonResponse?.adresMatches[0]?.score === 100) {
        return jsonResponse.adresMatches[0].identificator.id;
    }
}

function addressIdToQuad(address: Address): string {
    return `<${address.address}> <https://data.vlaanderen.be/ns/adres#verwijstNaar> <${address.id}> <${address.graph}> .`
}

function matchedToTtlFile(addresses: Address[]) {
    const quads = addresses
        .filter(address => !!address.id)
        .map(address => addressIdToQuad(address))
        .join('\n');

    fs.writeFileSync('./migration-results/addressesId.ttl', quads);
}

function unmatchedToJsonFile(addresses: Address[]) {
    const addressesJson = addresses
        .filter(address => !address.id)

    fs.writeFileSync('./migration-results/unmatched.json', JSON.stringify(addressesJson));
}

async function main() {
    const addresses = await getAddresses();
    const addressMatches: Address[] = await processPromisesBatch<Address, Address>(addresses, 100, async (address) => ({
        ...address,
        id: await findAddressMatch(address)
    }))

    matchedToTtlFile(addressMatches);
    unmatchedToJsonFile(addressMatches)
}

type Address = {
    graph: string
    publicService: string
    address: string
    straat: string
    huisnummer: string
    bus: string
    postcode: string
    gemeente: string
    land: string
    id: string
}

main();
