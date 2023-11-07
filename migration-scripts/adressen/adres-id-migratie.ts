//@ts-ignore
import SparqlClient from "sparql-client-2";
import * as fs from 'fs';
import {processPromisesBatch} from "./batch-promise";

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function getAdressen(): Promise<Adres[]> {
    const response = await executeQuery(`
        select distinct ?graph ?s ?adres ?straat ?huisnummer ?bus ?gemeente ?postcode ?land where {
            GRAPH ?graph {
                ?s a <http://purl.org/vocab/cpsv#PublicService> .
                ?s <http://data.europa.eu/m8g/hasContactPoint> ?contactPoint .
                ?contactPoint <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address> ?adres .
                ?adres <https://data.vlaanderen.be/ns/adres#Straatnaam> ?straat .
                ?adres <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> ?huisnummer .
                ?adres <https://data.vlaanderen.be/ns/adres#gemeentenaam> ?gemeente . 
                ?adres <https://data.vlaanderen.be/ns/adres#postcode> ?postcode .
                ?adres <https://data.vlaanderen.be/ns/adres#land> ?land .
                OPTIONAL {
                    ?adres <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer> ?bus .
                }
            }
        }
    `);
    return response.map((item: any) => ({
        graph: item.graph.value,
        publicService: item.s.value,
        adres: item.adres.value,
        straat: item.straat.value,
        huisnummer: item.huisnummer.value,
        bus: item?.bus?.value,
        postcode: item.postcode.value,
        gemeente: item.gemeente.value,
        land: item.land.value
    }));
}

async function findAdresMatch(adres: Adres) {
    const queryParams = new URLSearchParams({
        gemeentenaam: adres.gemeente,
        postcode: adres.postcode,
        straatnaam: adres.straat,
        huisnummer: adres.huisnummer,
    });
    if (adres.bus && adres.bus.trim()) {
        queryParams.set('busnummer', adres.bus);
    }

    const response = await fetch(
        `https://api.basisregisters.vlaanderen.be/v2/adresmatch?${queryParams}`,
        {headers: {'x-api-key': process.env.ADRESSEN_REGISTER_API_KEY || ''}}
    );
    if (!response.ok) {
        if (response.status != 400) {
            throw Error(`Error ${response.status}: ${await response.text()}`)
        }
        console.log(await response.text());
    }
    const jsonResponse: any = await response.json();
    if (jsonResponse?.adresMatches?.length && jsonResponse?.adresMatches[0]?.score === 100) {
        return jsonResponse.adresMatches[0].identificator.id;
    }
}

function adresIdToQuad(adres: Adres): string {
    return `<${adres.adres}> <https://data.vlaanderen.be/ns/adres#verwijstNaar> <${adres.id}> <${adres.graph}> .`
}

function matchedToTtlFile(adressen: Adres[]) {
    const quads = adressen
        .filter(adres => !!adres.id)
        .map(adres => adresIdToQuad(adres))
        .join('\n');

    fs.writeFileSync('./migration-results/adressenId.ttl', quads);
}

function unmatchedToJsonFile(adressen: Adres[]) {
    const adresenJson = adressen
        .filter(adres => !adres.id)

    fs.writeFileSync('./migration-results/unmatched.json', JSON.stringify(adresenJson));
}

async function main() {
    const adressen = await getAdressen();
    const adresMatches: Adres[] = await processPromisesBatch<Adres, Adres>(adressen, 100, async (adres) => ({
        ...adres,
        id: await findAdresMatch(adres)
    }));

    matchedToTtlFile(adresMatches);
    unmatchedToJsonFile(adresMatches)
}

type Adres = {
    graph: string
    publicService: string
    adres: string
    straat: string
    huisnummer: string
    bus: string
    postcode: string
    gemeente: string
    land: string
    id: string
}

main();
