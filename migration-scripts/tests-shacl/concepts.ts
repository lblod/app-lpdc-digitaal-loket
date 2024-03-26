import rdf from '@zazuko/env-node';
import SHACLValidator from 'rdf-validate-shacl';

export async function main() {
    console.log('concepts tests');
    console.log('concepts test cases');
    await conceptTestData();
    console.log('concepts from ldes stream');
    await conceptFromLdesStream();
}

async function conceptTestData() {
    const conceptShape = await rdf.dataset().import(rdf.fromFile('instances-concepts/shapes/concept-shape.ttl'));
    const shapes =
        conceptShape;

    const codeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const schemasOntologies = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));

    const concept1Data = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-test-cases-data.ttl'));
    const concept2Data = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concepts.ttl'));
    const conceptData =
        concept1Data
            .merge(concept2Data);

    validate(conceptData, schemasOntologies, codeLists, shapes);
}

async function conceptFromLdesStream() {
    const conceptShape = await rdf.dataset().import(rdf.fromFile('instances-concepts/shapes/concept-shape.ttl'));
    const shapes =
        conceptShape;

    const codeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const besluitOntology = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));
    const ipdcLpdcOntology = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/ipdc-lpdc.ttl'));

    const schemasOntologies
        = besluitOntology
        .merge(ipdcLpdcOntology);

    //example how to parse and interpret a jsonld file, and write out as turtle format
    //const conceptFromLdesStream = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-from-ldes-stream.jsonld'));
    //console.log(conceptFromLdesStream);
    //console.log(await conceptFromLdesStream.serialize({format: "text/turtle"}));

    const concept1Data = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-from-ldes-stream.ttl'));
    const concept2Data = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-from-ldes-stream-2.ttl'));
    const concept3Data = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-from-ldes-stream-3.ttl'));
    const concept4Data = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-from-ldes-stream-4.ttl'));
    const conceptData =
        concept1Data
            .merge(concept2Data)
            .merge(concept3Data)
            .merge(concept4Data);

    validate(conceptData, schemasOntologies, codeLists, shapes);
}

// @ts-ignore
function validate(applicationData: Dataset, schemasOntologies: Dataset, codeLists: Dataset, shapes: Dataset) {
    const data = applicationData
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