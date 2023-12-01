import rdf from '@zazuko/env-node';
import Dataset from '@zazuko/env';
import SHACLValidator from 'rdf-validate-shacl';

export async function main() {
    console.log('concept/instance');
    await conceptInstanceTestData();
    //await readOntologies();
    await publishedInstance();
}

//trying out clownface ...
async function readOntologies() {
    let shapes = await rdf.dataset().import(rdf.fromFile('extra-shacls/besluit.ttl'));
    shapes = shapes.merge(await rdf.dataset().import(rdf.fromFile('extra-shacls/m8g.ttl')));
    const clownface = rdf.clownface({dataset: shapes});
    console.log(clownface.has(rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")).values);
    console.log(clownface.has(rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf")).values);
    console.log(clownface.namedNode(rdf.namedNode("http://data.vlaanderen.be/ns/besluit#Bestuurseenheid")).values);
    //--> bestuurseenheid node

    // clownface.out -> will find out from a node, via the predicate to a next node
    console.log(clownface.namedNode(rdf.namedNode("http://data.vlaanderen.be/ns/besluit#Bestuurseenheid")).out(rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf')).values);
    //-> http://data.europa.eu/m8g/PublicOrganisation

    console.log(clownface.namedNode(rdf.namedNode("http://data.vlaanderen.be/ns/besluit#Bestuurseenheid")).out(rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf')).out(rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#label')).values);
    // -> empty array, unless we load more shapes ...

}


async function conceptInstanceTestData() {
    const shapes = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-instance-shape.ttl'));

    const codeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const schemasOntologies = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));

    const instanceData = await rdf.dataset().import(rdf.fromFile('instances-concepts/instances-test-cases-data.ttl'));

    validate(instanceData, schemasOntologies, codeLists, shapes);

}

async function publishedInstance() {
    const shapes = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-instance-shape.ttl'));

    //FYI: how to serialize in another format ... and you can also add prefixes ...  / but it does not seem to produce compact results ... but it works
    //const instanceData = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-published.json'));
    //console.log(await instanceData.serialize({format: "text/turtle"}));

    const exampleCodeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const themaCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627161016-thema-codelist/20230627161016-thema-codelist.ttl'));
    const typeCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627163552-type-codelist/20230627163552-type-codelist.ttl'));
    const bevoegdBestuursniveauCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230628112712-bevoegd-bestuursniveau/20230628112712-bevoegd-bestuursniveau.ttl'));
    const codeLists
        = exampleCodeLists
        .merge(themaCodeList)
        .merge(typeCodeList)
        .merge(bevoegdBestuursniveauCodeList);

    const schemasOntologies = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));

    const instanceData = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-published.ttl'));
    const conceptData = await rdf.dataset().import(rdf.fromFile('instances-concepts/concepts.ttl'));
    const instanceAndConceptData
        = instanceData
        .merge(conceptData);

    validate(instanceAndConceptData, schemasOntologies, codeLists, shapes);
}

// @ts-ignore
function validate(instanceAndConceptData: Dataset, schemasOntologies: Dataset, codeLists: Dataset, shapes: Dataset) {
    const data = instanceAndConceptData
        .merge(schemasOntologies) // to be able to validate the data, we should also include the schemas / ontologies the data / and or code lists data is referencing. // note we might need to split this up?
        .merge(codeLists); // and also the code lists (the validator needs to for example be able to verify the class type of one of the referenced objects).

    const validator = new SHACLValidator(shapes, {factory: rdf})
    const report = validator.validate(data);

    // Check conformance: `true` or `false`
    console.log(report.conforms);

    for (const result of report.results) {
        console.log('\nValidation Result :')
        // See https://www.w3.org/TR/shacl/#results-validation-result for details
        // about each property
        console.log('Message: ');
        console.log(result.message);

        console.log('Path: ');
        console.log(result.path)

        console.log('FocusNode: ');
        console.log(result.focusNode)

        console.log('Severity: ');
        console.log(result.severity)

        console.log('SourceConstraintComponent: ');
        console.log(result.sourceConstraintComponent)

        console.log('SourceShape: ');
        console.log(result.sourceShape)
    }
    //console.log(await report.dataset.serialize({ format: 'text/n3' }))
}

main();