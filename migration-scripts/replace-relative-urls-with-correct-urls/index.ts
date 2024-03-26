import * as fs from 'fs';
//@ts-ignore
import SparqlClient from "sparql-client-2";

const directory = './sparql-scripts';

async function executeQuery(query: string): Promise<any> {
    const sparqlClient = new SparqlClient(process.env.SPARQL_URL);
    const response = await sparqlClient.query(query).executeRaw();
    return JSON.parse(response.body)?.results?.bindings[0]?.['callret-0']?.value;
}

async function main() {
    const files= fs.readdirSync(directory);
    for (const file in files) {
        console.log(`Executing file: ${files[file]}`);
        const query = fs.readFileSync(directory + '/' + files[file], 'utf-8');
        const response = await executeQuery(query);
        console.log(response);
        console.log(`Finished executing file: ${files[file]}`);
        console.log( );
    }
}

main();