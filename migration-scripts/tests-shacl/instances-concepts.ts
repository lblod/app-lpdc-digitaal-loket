import rdf from '@zazuko/env-node';
import SHACLValidator from 'rdf-validate-shacl';

export async function main() {
    console.log('concept/instance');
    await conceptInstance();
    //await readOntologies();
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

async function conceptInstance() {
    let shapes = await rdf.dataset().import(rdf.fromFile('instances-concepts/concept-instance-shape.ttl'));
    //shapes = shapes.merge(await rdf.dataset().import(rdf.fromFile('extra-shacls/m8g.ttl'))); //not needed to validate because the pointer of   a besluit:  rdfs:subClassOf <http://data.europa.eu/m8g/PublicOrganisation> .
   shapes = shapes.merge(await rdf.dataset().import(rdf.fromFile('extra-shacls/besluit.ttl')));
    console.log(shapes.size);

    let data = await rdf.dataset().import(rdf.fromFile('instances-concepts/instances-test-cases-data.ttl'));
    data = data.merge(shapes); // internally, the data is also used to verify class type matches ... it seems that data and structure is mixed internally ... in the validator

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
    //console.log(await report.dataset.serialize({ format: 'text/n3' }))

}

main();