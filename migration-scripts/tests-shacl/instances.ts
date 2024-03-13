import rdf from '@zazuko/env-node';
import Dataset from '@zazuko/env';
import SHACLValidator from 'rdf-validate-shacl';

export async function main() {
    console.log('instance tests');
    console.log('instance test cases');
    await instanceTestData();
    //await readOntologies();
    console.log('published instances');
    await publishedInstance();
}

//trying out clownface ...
async function readOntologies() {
    let shapes = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));
    shapes = shapes.merge(await rdf.dataset().import(rdf.fromFile('schemas-ontologies/m8g.ttl')));
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


async function instanceTestData() {
    const instanceShape = await rdf.dataset().import(rdf.fromFile('instances-concepts/shapes/instance-shape.ttl'));
    const shapes =
        instanceShape;

    const codeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const schemasOntologies = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));

    const instanceData = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-test-cases-data.ttl'));

    validate(instanceData, schemasOntologies, codeLists, shapes);

}

async function publishedInstance() {
    const instanceShape = await rdf.dataset().import(rdf.fromFile('instances-concepts/shapes/instance-shape.ttl'));
    const shapes =
        instanceShape;

    //FYI: how to serialize in another format ... and you can also add prefixes ...  / but it does not seem to produce compact results ... but it works
    //const instanceData = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published.json'));
    //console.log(await instanceData.serialize({format: "text/turtle"}));
    //const instanceData2 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published-2.json'));
    //console.log(await instanceData2.serialize({format: "text/turtle"}));
    //const instanceData3 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published-3.json'));
    //console.log(await instanceData3.serialize({format: "text/turtle"}));
    //const instanceData4 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published-4.json'));
    //console.log(await instanceData4.serialize({format: "text/turtle"}));

    const exampleCodeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const themaCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627161016-thema-codelist/20230627161016-thema-codelist.ttl'));
    const typeCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627163552-type-codelist/20230627163552-type-codelist.ttl'));
    const bevoegdBestuursniveauCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230628112712-bevoegd-bestuursniveau/20230628112712-bevoegd-bestuursniveau.ttl'));
    const uitvoerendBestuursniveauCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230628113208-uitvoerend-bestuursniveau/20230628113208-uitvoerend-bestuursniveau.ttl'));
    const publicatieKanaalCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627162927-publicatie-kanaal-codelist/20230627162927-publicatie-kanaal-codelist.ttl'));
    const yourEuropeCategoryCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627161917-your-europe-category-codelist/20230627161917-your-europe-category-codelist.ttl'));
    const doelgroepCodeList = await rdf.dataset().import(rdf.fromFile('../../config/migrations/2023/20230627153144-lpdc-codelists/20230627162036-doelgroep-codelist/20230627162036-doelgroep-codelist.ttl'));

    const codeLists
        = exampleCodeLists
        .merge(themaCodeList)
        .merge(typeCodeList)
        .merge(bevoegdBestuursniveauCodeList)
        .merge(uitvoerendBestuursniveauCodeList)
        .merge(publicatieKanaalCodeList)
        .merge(yourEuropeCategoryCodeList)
        .merge(doelgroepCodeList);

    const besluitOntology = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));
    const ipdcLpdcOntology = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/ipdc-lpdc.ttl'));

    const schemasOntologies
        = besluitOntology
        .merge(ipdcLpdcOntology);

    const instanceData1 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published.ttl'));
    const instanceData2 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published-2.ttl'));
    const instanceData3 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published-3.ttl'));
    const instanceData4 = await rdf.dataset().import(rdf.fromFile('instances-concepts/instance-data/instance-published-4.ttl'));
    const conceptData = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concepts.ttl'));

    const instanceAndConceptData
        = instanceData1
        .merge(instanceData2)
        .merge(instanceData3)
        .merge(instanceData4)
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