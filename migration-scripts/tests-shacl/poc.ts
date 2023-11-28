import rdf from '@zazuko/env-node'
import SHACLValidator from 'rdf-validate-shacl'
import {debug} from "util";

export async function main() {

    console.log('person');
    //await person();

    console.log('concept');
    await concept();
}

async function person() {
    const shapes = await rdf.dataset().import(rdf.fromFile('person/person-shape.ttl'))
    const data = await rdf.dataset().import(rdf.fromFile('person/person-data.ttl'))

    const validator = new SHACLValidator(shapes, {factory: rdf})
    const report = validator.validate(data)

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

    // Validation report as RDF dataset
    //console.log(await report.dataset.serialize({ format: 'text/n3' }))
}

async function concept() {
    const shapes = await rdf.dataset().import(rdf.fromFile('concept/concept-instance-shape.ttl'))
    const data = await rdf.dataset().import(rdf.fromFile('concept/simple-concept-data.ttl'))
    //const data = await rdf.dataset().import(rdf.fromFile('concept/full-instance-data.ttl'))

    const validator = new SHACLValidator(shapes, {factory: rdf})
    const report = validator.validate(data)

    // Check conformance: `true` or `false`
    console.log(report.conforms);

    for (const result of report.results) {
        debugger;
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