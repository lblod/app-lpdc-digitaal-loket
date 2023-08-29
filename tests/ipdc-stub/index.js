import express from "express";
import fs from "fs";

const app = express();

app.use(express.json({type: 'application/ld+json'}));

const instances = [];

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
        res.status(200).type('application/ld+json').json(jsonLd);
    } catch (e) {
        next(e);
    }
});

app.put('/instanties', (req, res, next) => {
   try {
       console.log('received instances');
       instances.push(...req.body);
       console.log(instances);
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

app.use(errorHandler);

app.listen(80, () => {
    console.log(`IPDC stub listening on port 80`)
});

