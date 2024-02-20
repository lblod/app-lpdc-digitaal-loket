import express from "express";
import fs from "fs";
const app = express();

app.use(express.json({type:  ['application/json', 'application/ld+json']}));

const instances =[];
function errorHandler(err, req, res, next) {
    if (err) {
        console.log(err);
        res.status(404).send();
    }
}

app.get('/instancesnapshots', (req, res, next) => {
    try {
        res.status(200).json(instances);
    } catch (e) {
        next(e);
    }
});

app.put('/instancesnapshots', (req, res, next) => {
    try {
        console.log('received new instance snapshots');
        const newInstanceSnapshot = req.body;
        instances.push(newInstanceSnapshot);
        console.log(JSON.stringify(newInstanceSnapshot, null, 2));
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

app.get('/doc/instancesnapshot', (req, res, next) => {
    try {
        const pageNumber = Number(req.query.pageNumber) || 0;
        console.log(`page ${pageNumber} requested`);
        const page = fs.readFileSync(`./ldes-pages/page-${pageNumber}.json`, "utf8");
        const jsonLd = JSON.parse(page);
        res.status(200).type('application/ld+json').json(jsonLd);
    } catch (e) {
        next(e);
    }
});

app.get('/InstanceJsonLdContext.jsonld', (req, res, next) => {
    console.log('')
    try {
        const page = fs.readFileSync(`./ldes-pages/InstanceJsonLdContext.jsonld`, "utf8");
        const jsonLd = JSON.parse(page);
        res.status(200).type('application/ld+json').json(jsonLd);
    } catch (e) {
        next(e)
    }
});

app.use(errorHandler);

app.listen(80, () => {
    console.log(`Instance stub listening on port 80`)
});

