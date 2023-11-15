//@ts-ignore
import SparqlClient from "sparql-client-2";

async function executeQuery(query: any) {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings;
}

async function instantiesNietGekoppeldAanLaatsteConceptSnapshot(): Promise<InstantieNietGekoppeldAanLaatsteConceptSnapshot[]> {
    const response = await executeQuery(`
PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
PREFIX adms: <http://www.w3.org/ns/adms#>

select distinct ?bestuurseenheidGraph ?instantie ?instantieConceptSnapshot ?concept ?recentsteConceptSnapshot where {

    GRAPH ?bestuurseenheidGraph {
        ?instantie a cpsv:PublicService .
        ?instantie ext:hasVersionedSource ?instantieConceptSnapshot .
        ?instantie dcterms:source ?concept .
        OPTIONAL {
            ?instantie ext:reviewStatus ?reviewStatus .
        }
        FILTER(!bound(?reviewStatus)) # neem instanties met een reviewStatus niet mee
    }

    GRAPH ?conceptGraph {
        ?concept ext:hasVersionedSource ?recentsteConceptSnapshot .
        OPTIONAL {
            ?concept adms:status ?conceptStatus .
        }
        FILTER(!bound(?conceptStatus)) # neem concepten met status gearchiveerd niet mee
    }

    FILTER(?instantieConceptSnapshot != ?recentsteConceptSnapshot)
}`);
    return response.map((item: any) => ({
        bestuurseenheidGraph: item.bestuurseenheidGraph.value,
        instantie: item.instantie.value,
        instantieConceptSnapshot: item.instantieConceptSnapshot.value,
        concept: item.concept.value,
        recentsteConceptSnapshot: item.recentsteConceptSnapshot.value
    }));
}

async function zijnConceptSnapshotsFunctioneelVerschillend(ene: string, andere: string): Promise<boolean> {
    const queryParams = new URLSearchParams({
        currentSnapshotUri: ene,
        newSnapshotUri: andere
    });

    const response = await fetch(`${process.env.LPDC_MANAGEMENT_URL}/concept-snapshot-compare?${queryParams}`);
    if (!response.ok) {
        console.log(await response.text());
        throw Error(`Error ${response.status}: ${await response.text()}`);
    }
    const jsonResponse: any = await response.json();
    return jsonResponse['isChanged'];
}

async function instantiesWaarvoorGekoppeldConceptSnapshotInhoudelijkVerschillendVanLaatsteConceptSnapshot(instantiesTeControleren: InstantieNietGekoppeldAanLaatsteConceptSnapshot[]): Promise<InstantieNietGekoppeldAanLaatsteConceptSnapshot[]> {
    //TODO 837: mogelijke performantie optimalisatie ?
    //TODO 837: neem uit de lijst alle combinaties (snapshot vergelijking paren)
    //TODO 837: ga voor elk van die opvragen
    //TODO 837: pas dat toe op de lijst van de instanties te controleren (filter die lijst?)

    return instantiesTeControleren.filter(async instantie => {
            return await zijnConceptSnapshotsFunctioneelVerschillend(instantie.instantieConceptSnapshot, instantie.recentsteConceptSnapshot);
        }
    );
}

async function main() {
    const instantiesTeControleren = await instantiesNietGekoppeldAanLaatsteConceptSnapshot();

    const instantiesWaarvoorReviewStatusNodigIs = await instantiesWaarvoorGekoppeldConceptSnapshotInhoudelijkVerschillendVanLaatsteConceptSnapshot(instantiesTeControleren);

    console.log(JSON.stringify(instantiesTeControleren, null, 2));
    console.log(JSON.stringify(instantiesWaarvoorReviewStatusNodigIs, null, 2));


}

type InstantieNietGekoppeldAanLaatsteConceptSnapshot = {
    bestuurseenheidGraph: string
    instantie: string
    instantieConceptSnapshot: string
    concept: string
    recentsteConceptSnapshot: string
};

main();

