import rdf from '@zazuko/env-node';
import SHACLValidator from 'rdf-validate-shacl';

export async function main() {
    console.log('concepts tests');
    console.log('concepts test cases');
    await conceptTestData();
}

async function conceptTestData() {
    const shapes = await rdf.dataset().import(rdf.fromFile('instances-concepts/shapes/concept-shape.ttl'));

    const codeLists = await rdf.dataset().import(rdf.fromFile('codelists/example-codelists.ttl'));
    const schemasOntologies = await rdf.dataset().import(rdf.fromFile('schemas-ontologies/besluit.ttl'));

    const instanceData = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-data/concept-test-cases-data.ttl'));

    validate(instanceData, schemasOntologies, codeLists, shapes);

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