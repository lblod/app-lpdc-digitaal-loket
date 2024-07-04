import express from "express";
import fs from "fs";
import {conceptSnapshotArchive, conceptSnapshotCreate, conceptSnapshotInvalid, conceptSnapshotUpdate} from "./ldes-pages/extra-conceptsnapshots.js";
import { graph, isLiteral, literal, parse, quad } from "rdflib";

let jsonld = undefined;
import('jsonld/lib/index.js')
    .then(jsonldloaded => jsonld = jsonldloaded.default());

const app = express();

app.use(express.json({type: ['application/json', 'application/ld+json']}));

const instances = [];
const extraConceptsnapshots = [];
let instancesThatShouldFail = [];

function errorHandler(err, req, res, next) {
    if (err) {
        console.log(err);
        res.status(404).send();
    }
}

app.get('/doc/conceptsnapshot', (req, res, next) => {
    try {
        const pageNumber = Number(req.query.pageNumber) || 0;
        console.log(`page ${pageNumber} requested`);
        const page = fs.readFileSync(`./ldes-pages/page-${pageNumber}.json`, "utf8");
        const jsonLd = JSON.parse(page);
        jsonLd.member = jsonLd.member.concat(extraConceptsnapshots);
        res.status(200).type('application/ld+json').json(jsonLd);
    } catch (e) {
        next(e);
    }
});

app.get('/doc/instantie/:instanceUuid', async (req, res, next) => {
    try {
        const instanceUuid = req.params.instanceUuid;
        console.log(`/doc/instantie/${instanceUuid} requested`);

        if (fs.existsSync(`./instance-data/${instanceUuid}.jsonld`)) {
            const page = fs.readFileSync(`./instance-data/${instanceUuid}.jsonld`, "utf8");
            console.log(page);
            const jsonLd = JSON.parse(page);
            console.log(jsonLd);
            res.status(200).type('application/ld+json').json(jsonLd);
        } else {
            const publishedInstanceForUuid = instances.find(instance =>
                instance.find(object => object['@type'][0] === 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'
                    && object['http://mu.semte.ch/vocabularies/core/uuid'][0]['@value'] === instanceUuid));
            if (!publishedInstanceForUuid) {
                res.status(404).send();
            } else {
                const context = JSON.parse(fs.readFileSync(`./instance-data/InstantieJsonLdContext.jsonld`, "utf8"));
                const store = graph();

                const quads = await new Promise((resolve, reject) => {

                    parse(JSON.stringify(publishedInstanceForUuid), store, 'http://example.me', 'application/ld+json', (error, kb) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        const originalQuads = kb.statementsMatching();

                        if (originalQuads.length < 5) {
                            reject(new Error(`Er is een fout opgetreden bij het 'bevragen' van Ipdc voor instance ${initialInstance.id}`));
                        }

                        //'translate' all formal to informal (by adding the same keys again, with informal)

                        const allInformalQuads =
                            originalQuads.filter(
                                q =>
                                    isLiteral(q.object)
                                    && q.object.language === 'nl-be-x-formal'
                            ).map(q =>
                                quad(q.subject, q.predicate, literal(`${q.object.value} - informal`, 'nl-be-x-generated-informal'), q.graph)
                            );

                        resolve([...originalQuads, ...allInformalQuads]);
                    });
                });

                const jsonLdDocument = await jsonld.fromRDF(quads.map(q => quad(q.subject, q.predicate, q.object, null)));

                //note: compacting does not work properly when having a nested container with blank nodes ... it generates a graph, which we don't want? For now, there is no e2e that relies on this, so we leave it as is ...
                const compactedJsonLdDocument = await jsonld.compact(jsonLdDocument, context);

                compactedJsonLdDocument[`@context`] = `http://ipdc-stub/InstantieJsonLdContext.jsonld`;

                compactedJsonLdDocument[`@id`] = `https://ipdc.vlaanderen.be/id/instantie/${instanceUuid}`;

                console.log(compactedJsonLdDocument);

                res.status(200).type('application/ld+json').json(compactedJsonLdDocument);
            }
        }
    } catch (e) {
        next(e);
    }
});

app.post('/conceptsnapshot/:conceptId/invalid', (req, res, next) => {
    try {
        const conceptId = req.params.conceptId;
        const conceptSnapshot = conceptSnapshotInvalid(conceptId);
        extraConceptsnapshots.push(conceptSnapshot);
        return res.status(200).json({
            id: conceptSnapshot['@id'],
            uuid: getUUIDFromUri(conceptSnapshot['@id']),
            productId: conceptSnapshot.productnummer,
            title: conceptSnapshot?.naam?.nl,
            jsonlddata: conceptSnapshot,
        });
    } catch (e) {
        next(e)
    }

});

app.post('/conceptsnapshot/:conceptId/:conceptStatus', (req, res, next) => {
    try {
        const conceptId = req.params.conceptId;
        const conceptSnapshots = {
            create: conceptSnapshotCreate(conceptId, req.query.withRandomNewData === 'true'),
            update: conceptSnapshotUpdate(conceptId, req.query.withRandomNewData === 'true', req.query.elementToUpdate),
            archive: conceptSnapshotArchive(conceptId, req.query.withRandomNewData ==='true')
        }
        const conceptSnapshot = conceptSnapshots[req.params.conceptStatus];
        if (conceptSnapshot) {
            extraConceptsnapshots.push(conceptSnapshot);
            return res.status(200).json({
                id: conceptSnapshot['@id'],
                uuid: getUUIDFromUri(conceptSnapshot['@id']),
                productId: conceptSnapshot.productnummer,
                title: conceptSnapshot?.naam?.nl,
                jsonlddata: conceptSnapshot,
            });
        } else {
            return res.sendStatus(400);
        }
    } catch (e) {
        next(e);
    }
});

app.put('/instanties', (req, res, next) => {
    try {
        console.log('received new instances');
        const newInstance = req.body;
        const instanceIri = newInstance.find(object => object['@type'][0] === 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService' || object['@type'][0] === 'https://www.w3.org/ns/activitystreams#Tombstone')?.['@id'];
        if (instancesThatShouldFail.some(instanceThatShouldFail => instanceThatShouldFail.instanceIri === instanceIri)) {
            const fail = instancesThatShouldFail.find(instanceThatShouldFail => instanceThatShouldFail.instanceIri === instanceIri);
            const statusCode = fail.statusCode ?? 400;
            console.log(`published instance returns specific http status code ${statusCode}`);
            return res.status(statusCode).send(fail.errorMessage);
        }
        instances.push(newInstance);
        console.log(JSON.stringify(newInstance, null, 2));
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

app.get('/instanties', (req, res, next) => {
    try {
        res.status(200).json(instances);
    } catch (e) {
        next(e);
    }
});

app.post('/instanties/fail', (req, res, next) => {
    try {
        instancesThatShouldFail.push({
            instanceIri: req.body.instanceIri,
            statusCode: req.body.statusCode,
            errorMessage: req.body.errorMessage
        });
        console.log(`instance that should fail : ${req.body.instanceIri}`);
        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});

app.post('/instanties/notfail', (req, res, next) => {
    try {
        instancesThatShouldFail = instancesThatShouldFail.filter(entry => entry.instanceIri !== req.body.instanceIri);
        console.log(`instance that should not fail : ${req.body.instanceIri}`);
        return res.status(200).send();
    } catch (e) {
        next(e);
    }
});


app.get('/ipdc-lpdc-im.jsonld', (req, res, next) => {
    try {
        const context = fs.readFileSync(`./ldes-pages/ipdc-lpdc-im.jsonld`, "utf8");
        const jsonLd = JSON.parse(context);
        res.status(200).type('application/ld+json').json(jsonLd);
        console.log(`Streamed ipdc-lpdc-im.jsonld`);
    } catch (e) {
        next(e)
    }
});

app.get('/ldes.jsonld', (req, res, next) => {
    try {
        const context = fs.readFileSync(`./ldes-pages/ldes.jsonld`, "utf8");
        const jsonLd = JSON.parse(context);
        res.status(200).type('application/ld+json').json(jsonLd);
        console.log(`Streamed ldes.jsonld`);
    } catch (e) {
        next(e)
    }
});

app.get('/InstantieJsonLdContext.jsonld', (req, res, next) => {
    try {
        const context = fs.readFileSync(`./instance-data/InstantieJsonLdContext.jsonld`, "utf8");
        const jsonLd = JSON.parse(context);
        res.status(200).type('application/ld+json').json(jsonLd);
        console.log(`Streamed InstantieJsonLdContext.jsonld`);
    } catch (e) {
        next(e)
    }
});

app.get('/InstantieJsonLdContextThatIsInvalid.jsonld', (req, res, next) => {
    try {
        const context = fs.readFileSync(`./instance-data/InstantieJsonLdContextThatIsInvalid.jsonld`, "utf8");
        const jsonLd = JSON.parse(context);
        res.status(200).type('application/ld+json').json(jsonLd);
        console.log(`Streamed InstantieJsonLdContextThatIsInvalid.jsonld`);
    } catch (e) {
        next(e)
    }
});

app.use(errorHandler);

app.listen(80, () => {
    console.log(`IPDC stub listening on port 80`)
});

export default function getUUIDFromUri(uri) {
    const segmentedUri = uri.split('/');
    return segmentedUri[segmentedUri.length - 1];
}

