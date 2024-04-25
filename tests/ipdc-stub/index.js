import express from "express";
import fs from "fs";
import {conceptArchive, conceptCreate, conceptUpdate} from "./ldes-pages/extra-conceptsnapshots.js";

const app = express();

app.use(express.json({type:  ['application/json', 'application/ld+json']}));

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

app.get('/doc/instantie/:instanceUuid', (req, res, next) => {
    try {
        const instanceUuid = req.params.instanceUuid;
        console.log(`/doc/instantie/${instanceUuid} requested`);

        if(fs.existsSync(`./instance-data/${instanceUuid}.jsonld`)) {
            const page = fs.readFileSync(`./instance-data/${instanceUuid}.jsonld`, "utf8");
            console.log(page);
            const jsonLd = JSON.parse(page);
            console.log(jsonLd);
            res.status(200).type('application/ld+json').json(jsonLd);
        } else {
            //TODO LPDC-1139: take a look at the published instances, and manipulate a bit so to add a 'translated triple', and return.
            res.status(404).send();
        }
    } catch(e) {
        next(e);
    }
});

app.post('/conceptsnapshot/:conceptId/:conceptStatus', (req, res, next) => {
    try {
        const conceptId = req.params.conceptId;
        const concepts = {
            create: conceptCreate(conceptId),
            update: conceptUpdate(conceptId, req.query.withRandomTitle === 'true'),
            archive: conceptArchive(conceptId)
        }
        const conceptToAdd = concepts[req.params.conceptStatus];
        if (conceptToAdd) {
            extraConceptsnapshots.push(conceptToAdd);
            return res.status(200).json({
                id: conceptToAdd.id,
                productId: conceptToAdd.productnummer,
                title: conceptToAdd?.naam?.nl
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


app.get('/ConceptJsonLdContext.jsonld', (req, res, next) => {
    try {
        const page = fs.readFileSync(`./ldes-pages/ConceptJsonLdContext.jsonld`, "utf8");
        const jsonLd = JSON.parse(page);
        res.status(200).type('application/ld+json').json(jsonLd);
    } catch (e) {
        next(e)
    }
});

app.get('/InstantieJsonLdContext.jsonld', (req, res, next) => {
    try {
        const page = fs.readFileSync(`./instance-data/InstantieJsonLdContext.jsonld`, "utf8");
        const jsonLd = JSON.parse(page);
        res.status(200).type('application/ld+json').json(jsonLd);
    } catch (e) {
        next(e)
    }
});

app.use(errorHandler);

app.listen(80, () => {
    console.log(`IPDC stub listening on port 80`)
});

