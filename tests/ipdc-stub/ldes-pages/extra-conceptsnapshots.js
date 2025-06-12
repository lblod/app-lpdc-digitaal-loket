import { v4 as uuid } from 'uuid';
import pkg from "lodash";
const { uniq } = pkg;

const pepingen = {
    uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
}

const aarschot = {
    uri: "http://data.lblod.info/id/bestuurseenheden/ba4d960fe3e01984e15fd0b141028bab8f2b9b240bf1e5ab639ba0d7fe4dc522",
}

const leuven = {
    uri: "http://data.lblod.info/id/bestuurseenheden/c648ea5d12626ee3364a02debb223908a71e68f53d69a7a7136585b58a083e77",
}

const gent = {
    uri: "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5",
}

const holsbeek = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8a7354b76f3d258f9596fa454ec2b75b55be47234366c8f8d7d60eea96dfbebf",
}

const westerlo = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8cd07007fee51d55760f7d3d14944b548d98061a9eca4eafe825c89a1145aaf3",
}

const zoutleeuw = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8da71bf3f06102d4c2e45daa597622ffd1c13ca150ddd12f6258e02855cdaeb5",
}

const ranst = {
    uri: "http://data.lblod.info/id/bestuurseenheden/93746445b8e49813e27e0d07459a2dac0d8d4aafb85d87662addecb3644c6c02",
}

const lennik = {
    uri: "http://data.lblod.info/id/bestuurseenheden/92f38467d9467707d91ba9cb3c5c165cd58447078d985b25a651b3f01e8695cd",
}

const mol = {
    uri: "http://data.lblod.info/id/bestuurseenheden/904ebf5719a5a4e125a3f9fdcd25b08e336f822ca786dc2b30dfca927033e4e4",
}

const oosterzele = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8df96cc548c53410332620ec1adae4591bd5340127b1332c4b902c5c3afe260d",
}

const productTypes = ['Toelating', 'FinancieelVoordeel', 'InfrastructuurMateriaal', 'Bewijs', 'AdviesBegeleiding', 'Voorwerp', 'FinancieleVerplichting'];
let productTypeIndexCounter = 0;

const doelgroepen = ['Burger', 'Onderneming', 'Organisatie', 'Vereniging', 'LokaalBestuur', 'VlaamseOverheid'];

const themas = ['BurgerOverheid', 'CultuurSportVrijeTijd', 'EconomieWerk', 'MilieuEnergie', 'BouwenWonen', 'WelzijnGezondheid'];

const bevoegdeBestuursniveaus = ['Europees', 'Federaal', 'Vlaams', 'Provinciaal', 'Lokaal'];

const overheden = [pepingen.uri, aarschot.uri, leuven.uri, gent.uri, holsbeek.uri, westerlo.uri, zoutleeuw.uri, ranst.uri, lennik.uri, mol.uri, oosterzele.uri];

const uitvoerendeBestuursniveaus = ['Europees', 'Federaal', 'Vlaams', 'Provinciaal', 'Lokaal', 'Derden'];

const yourEuropeCategorieën = [
    'BedrijfIntellectueleEigendomsrechten',
    'BelastingenOverigeBelastingen',
    'BeschermingPersoonsgegevens',
    'BeschermingPersoonsgegevensUitoefeningRechten',
    'BurgerEnFamilieRechten',
    'BurgerEnFamilieRechtenPartners',
    'ConsumentenrechtenVeiligheid',
    'DienstenErkenningBeroepskwalificaties',
];

const voorwaarden = (randomStr) => {
    return {
        "voorwaarden": [
            {
                "naam": {
                    "nl": `Voorwaarde${randomStr}`,
                    "nl-BE-x-generated-formal": `Voorwaarde - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Voorwaarde - generated-informal${randomStr}`,
                },
                "beschrijving": {
                    "nl": `Voorwaarde beschrijving${randomStr}`,
                    "nl-BE-x-generated-formal": `Voorwaarde beschrijving - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Voorwaarde beschrijving - generated-informal${randomStr}`,
                },
                "bewijs": {
                    "naam": {
                        "nl": `Bewijs${randomStr}`,
                        "nl-BE-x-generated-formal": `Bewijs - generated-formal${randomStr}`,
                    },
                    "beschrijving": {
                        "nl": `Bewijs beschrijving${randomStr}`,
                        "nl-BE-x-generated-formal": `Bewijs beschrijving - generated-formal${randomStr}`,
                        "nl-BE-x-generated-informal": `Bewijs beschrijving - generated-informal${randomStr}`,
                    },
                    "@type": "Bewijs"
                },
                "@type": "Voorwaarde",
                "order": 0.0
            }
        ],
    }
};

const procedures = (randomStr) => {
    return {
        "procedures": [
            {
                "naam": {
                    "nl": `Procedure${randomStr}`,
                    "nl-BE-x-generated-formal": `Procedure - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Procedure - generated-informal${randomStr}`,
                },
                "beschrijving": {
                    "nl": `Procedure beschrijving${randomStr}`,
                    "nl-BE-x-generated-formal": `Procedure beschrijving - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Procedure beschrijving - generated-informal${randomStr}`,
                },
                "websites": [
                    {
                        "naam": {
                            "nl": `Procedure Website${randomStr}`,
                            "nl-BE-x-generated-formal": `Procedure Website - generated-formal${randomStr}`,
                            "nl-BE-x-generated-informal": `Procedure Website - generated-informal${randomStr}`,
                        },
                        "beschrijving": {
                            "nl": `Procedure Website beschrijving${randomStr}`,
                            "nl-BE-x-generated-formal": `Procedure Website beschrijving - generated-formal${randomStr}`,
                            "nl-BE-x-generated-informal": `Procedure Website beschrijving - generated-informal${randomStr}`,
                        },
                        "url": `https://procedure-website${randomStr.replace(/\s+/g, '')}.com`,
                        "@type": "Website",
                        "order": 0.0
                    }
                ],
                "@type": "Procedure",
                "order": 0.0
            }
        ],
    }
};

const kost = (randomStr, nmbr) => {
    return {
        "kosten": Array.from({ length: nmbr }, (v, k) => k + 1)
            .map(n => ({
                "naam": {
                    "nl": `Kost${randomStr}-${n}`,
                    "nl-BE-x-generated-formal": `Kost - generated-formal${randomStr}-${n}`,
                    "nl-BE-x-generated-informal": `Kost - generated-informal${randomStr}-${n}`,
                },
                "beschrijving": {
                    "nl": `Kost beschrijving${randomStr}-${n}`,
                    "nl-BE-x-generated-formal": `Kost beschrijving - generated-formal${randomStr}-${n}`,
                    "nl-BE-x-generated-informal": `Kost beschrijving - generated-informal${randomStr}-${n}`,
                },
                "@type": "Kost",
                "order": n - 1
            }))
    }
};

const financieleVoordelen = (randomStr) => {
    return {
        "financieleVoordelen": [
            {
                "naam": {
                    "nl": `Financieel Voordeel${randomStr}`,
                    "nl-BE-x-generated-formal": `Financieel Voordeel - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Financieel Voordeel - generated-informal${randomStr}`,
                },
                "beschrijving": {
                    "nl": `Financieel Voordeel beschrijving${randomStr}`,
                    "nl-BE-x-generated-formal": `Financieel Voordeel beschrijving - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Financieel Voordeel beschrijving - generated-informal${randomStr}`,
                },
                "@type": "FinancieelVoordeel",
                "order": 0.0
            }
        ],
    }
};

const regelgeving = (randomStr) => {
    return {
        "regelgevingTekst": {
            "nl": `Regelgeving${randomStr}`,
            "nl-BE-x-generated-formal": "Regelgeving - generated-formal${randomStr}",
            "nl-BE-x-generated-informal": `Regelgeving - generated-informal${randomStr}`,
        },
        "regelgeving": [
            {
                "naam": {
                    "nl": `Regelgevende bron${randomStr}`,
                    "nl-BE-x-generated-formal": `Regelgevende bron - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Regelgevende bron - generated-informal${randomStr}`,
                },
                "beschrijving": {
                    "nl": `Regelgevende bron beschrijving${randomStr}`,
                    "nl-BE-x-generated-formal": `Regelgevende bron beschrijving - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Regelgevende bron beschrijving - generated-informal${randomStr}`,
                },
                "url": `https://ipdc.be/regelgeving${randomStr.replace(/\s+/g, '')}`,
                "@type": "Regelgeving",
                "order": 0.0
            }
        ],
    }
};

const meerInfo = (randomStr, nmbr) => {
    return {
        "websites": Array.from({ length: nmbr }, (v, k) => k + 1)
            .map(n => ({
                "naam": {
                    "nl": `Website${randomStr}-${n}`,
                    "nl-BE-x-generated-formal": `Website - generated-formal${randomStr}-${n}`,
                    "nl-BE-x-generated-informal": `Website - generated-informal${randomStr}-${n}`,
                },
                ...(n === nmbr && nmbr % 2 === 0) ?
                    {} :
                    {
                        "beschrijving":
                        {
                            "nl": `Website beschrijving${randomStr}-${n}`,
                            "nl-BE-x-generated-formal": `Website beschrijving - generated-formal${randomStr}-${n}`,
                            "nl-BE-x-generated-informal": `Website beschrijving - generated-informal${randomStr}-${n}`,
                        }
                    }
                ,
                "url": `https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit${randomStr.replace(/\s+/g, '')}-${n}`,
                "@type": "Website",
                "order": n - 1
            }))
    }
};

export const conceptSnapshotCreate = (conceptId, withRandomNewData) => {
    const id = uuid();

    const randomData = ` - ${conceptId}`;

    return {
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`,
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "nl": `Concept created${randomData}`,
            "nl-BE-x-generated-formal": `Concept created - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Concept created - generated-informal${randomData}`
        },
        "beschrijving": {
            "nl": `Concept created beschrijving${randomData}`,
            "nl-BE-x-generated-formal": `Concept created beschrijving  - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Concept created beschrijving - generated-informal${randomData}`
        },
        "verdereBeschrijving": {
            "nl": `Verdere beschrijving created${randomData}`,
            "nl-BE-x-generated-informal": `Verdere beschrijving created - generated-informal${randomData}`,
            "nl-BE-x-generated-formal": `Verdere beschrijving created - generated-formal${randomData}`
        },
        "uitzonderingen": {
            "nl": `Uitzonderingen created${randomData}`,
            "nl-BE-x-generated-formal": `Uitzonderingen created - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Uitzonderingen created - generated-informal${randomData}`
        },
        ...voorwaarden(` - created${randomData}`),
        ...procedures(` - created${randomData}`),
        ...kost(` - created${randomData}`, 1),
        ...financieleVoordelen(` - created${randomData}`),
        ...regelgeving(` - created${randomData}`),
        ...meerInfo(` - created${randomData}`, 1),
        ...(withRandomNewData ?
            {
                "startDienstVerlening": getRandomFutureDate().toISOString(),
                "eindeDienstVerlening": getRandomFutureDate().toISOString(),
                "type": productTypes[nextProductTypeIndex()],
                "doelgroepen": uniq([getRandomElement(doelgroepen), getRandomElement(doelgroepen)]),
                "themas": uniq([getRandomElement(themas), getRandomElement(themas)]),
                "bevoegdBestuursniveaus": uniq([getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus)]),
                "bevoegdeOverheden": uniq([getRandomElement(overheden), getRandomElement(overheden)]).map(elem => ({ "@id": elem })),
                "uitvoerendBestuursniveaus": uniq([getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus)]),
                "uitvoerendeOverheden": uniq([getRandomElement(overheden), getRandomElement(overheden)]).map(elem => ({ "@id": elem })),
                "zoektermen": { "nl": uniq([random(), random()].map(i => `zoekterm - ${i}`)) },
                "publicatiekanalen": [],
                "yourEuropeCategorieen": [],
            } : {
                "startDienstVerlening": "2020-01-01T00:00:00Z",
                "eindeDienstVerlening": "2028-01-05T00:00:00Z",
                "type": 'FinancieelVoordeel',
                "doelgroepen": ['Vereniging', 'LokaalBestuur'],
                "themas": ['CultuurSportVrijeTijd', 'EconomieWerk'],
                "bevoegdBestuursniveaus": ['Europees', 'Federaal'],
                "bevoegdeOverheden": [aarschot.uri, leuven.uri].map(elem => ({ "@id": elem })),
                "uitvoerendBestuursniveaus": ['Vlaams', 'Provinciaal'],
                "uitvoerendeOverheden": [holsbeek.uri, westerlo.uri].map(elem => ({ "@id": elem })),
                "zoektermen": { "nl": [`zoekterm - 100000`, `zoekterm - 100001`, `zoekterm - 100002`] },
                "publicatiekanalen": [],
                "yourEuropeCategorieen": [],
            }),
        "productnummer": "3000",
        "gearchiveerd": false
    };
};

export const conceptSnapshotUpdate = (conceptId, withRandomNewData, elementToUpdate) => {
    const id = uuid();

    const randomData = ` - ${conceptId}${withRandomNewData ? ` - ${id}` : ''}`;

    const specificElementUpdated = ` - ${uuid()}`;

    const naamElementTextUpdated = elementToUpdate === 'naam' ? specificElementUpdated : '';

    const kostElementTextUpdated = elementToUpdate?.startsWith("kosten") ? specificElementUpdated : '';
    const kostElementNumberOfElementsUpdated = elementToUpdate?.startsWith("kosten") ? Number.parseInt(elementToUpdate.slice(7)) : 1;

    const websitesElementTextUpdated = elementToUpdate?.startsWith("websites") ? specificElementUpdated : '';
    const websitesElementNumberOfElementsUpdated = elementToUpdate?.startsWith("websites") ? Number.parseInt(elementToUpdate.slice(9)) : 1;

    const productTypeElementUpdated = elementToUpdate?.startsWith("type") ? elementToUpdate.slice(5) : undefined;

    const doelgroepenElementUpdated = elementToUpdate?.startsWith("doelgroepen") ? [elementToUpdate.slice(12)] : undefined;

    const themasElementUpdated = elementToUpdate?.startsWith("themas") ? [elementToUpdate.slice(7)] : undefined;

    return {
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`,
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "nl": `Concept updated${randomData}${naamElementTextUpdated}`,
            "nl-BE-x-generated-formal": `Concept updated - generated-formal${randomData}${naamElementTextUpdated}`,
            "nl-BE-x-generated-informal": `Concept updated - generated-informal${randomData}${naamElementTextUpdated}`
        },
        "beschrijving": {
            "nl": `Concept beschrijving updated${randomData}`,
            "nl-BE-x-generated-formal": `Concept beschrijving updated - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Concept beschrijving updated - generated-informal${randomData}`
        },
        "verdereBeschrijving": {
            "nl": `Verdere beschrijving updated${randomData}`,
            "nl-BE-x-generated-informal": `Verdere beschrijving updated - generated-informal${randomData}`,
            "nl-BE-x-generated-formal": `Verdere beschrijving updated - generated-formal${randomData}`
        },
        "uitzonderingen": {
            "nl": `Uitzonderingen updated${randomData}`,
            "nl-BE-x-generated-formal": `Uitzonderingen updated - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Uitzonderingen updated - generated-informal${randomData}`
        },
        ...voorwaarden(` - updated${randomData}`),
        ...procedures(` - updated${randomData}`),
        ...kost(` - updated${randomData}${kostElementTextUpdated}`, kostElementNumberOfElementsUpdated),
        ...financieleVoordelen(` - updated${randomData}`),
        ...regelgeving(` - updated${randomData}`),
        ...meerInfo(` - updated${randomData}${websitesElementTextUpdated}`, websitesElementNumberOfElementsUpdated),
        ...(withRandomNewData ?
            {
                "startDienstVerlening": getRandomFutureDate().toISOString(),
                "eindeDienstVerlening": getRandomFutureDate().toISOString(),
                "type": productTypes[nextProductTypeIndex()],
                "doelgroepen": uniq([getRandomElement(doelgroepen), getRandomElement(doelgroepen), getRandomElement(doelgroepen)]),
                "themas": uniq([getRandomElement(themas), getRandomElement(themas), getRandomElement(themas)]),
                "bevoegdBestuursniveaus": uniq([getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus)]),
                "bevoegdeOverheden": uniq([getRandomElement(overheden), getRandomElement(overheden), getRandomElement(overheden)]).map(elem => ({ "@id": elem })),
                "uitvoerendBestuursniveaus": uniq([getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus)]),
                "uitvoerendeOverheden": uniq([getRandomElement(overheden), getRandomElement(overheden), getRandomElement(overheden)]).map(elem => ({ "@id": elem })),
                "zoektermen": { "nl": uniq([random(), random(), random(), random(), random(), random()].map(i => `zoekterm - ${i}`)) },
                "publicatiekanalen": ["YourEurope"],
                "yourEuropeCategorieen": uniq([getRandomElement(yourEuropeCategorieën), getRandomElement(yourEuropeCategorieën), getRandomElement(yourEuropeCategorieën), getRandomElement(yourEuropeCategorieën)]),
            } : {
                "startDienstVerlening": "2027-01-01T00:00:00Z",
                "eindeDienstVerlening": "2030-01-05T00:00:00Z",
                "type": productTypeElementUpdated ?? 'Toelating',
                "doelgroepen": doelgroepenElementUpdated ?? ['Burger', 'Onderneming'],
                "themas": themasElementUpdated ?? ['MilieuEnergie', 'BouwenWonen'],
                "bevoegdBestuursniveaus": ['Provinciaal', 'Lokaal'],
                "bevoegdeOverheden": [ranst.uri, lennik.uri].map(elem => ({ "@id": elem })),
                "uitvoerendBestuursniveaus": ['Lokaal', 'Derden'],
                "uitvoerendeOverheden": [gent.uri, holsbeek.uri, westerlo.uri].map(elem => ({ "@id": elem })),
                "zoektermen": { "nl": [`zoekterm - 200000`, `zoekterm - 300001`, `zoekterm - 400002`] },
                "publicatiekanalen": [],
                "yourEuropeCategorieen": [],
            }),
        "productnummer": "3000",
        "gearchiveerd": false
    };
};

export const conceptSnapshotArchive = (conceptId, withRandomNewData) => {
    const id = uuid();
    const randomData = ` - ${conceptId}${withRandomNewData ? ` - ${id}` : ''}`;
    return {
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`,
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "nl": `Concept archived${randomData}`,
            "nl-BE-x-generated-formal": `Concept archived - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Concept archived - generated-informal${randomData}`
        },
        "beschrijving": {
            "nl": `Concept beschrijving archived${randomData}`,
            "nl-BE-x-generated-formal": `Concept beschrijving archived - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Concept beschrijving archived - generated-informal${randomData}`,
        },
        "productnummer": "3000",
        "gearchiveerd": true
    }
};

export const conceptSnapshotInvalid = (conceptId) => {
    const id = uuid();
    return {
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`,
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "en": `Concept`
        },
        "beschrijving": {
            "nl": `Concept beschrijving`
        },
        "productnummer": "3000",
        "gearchiveerd": false,
    }
};

function getRandomFutureDate() {
    const today = new Date();
    const futureDate = new Date();
    const daysToAdd = random(365);
    futureDate.setDate(today.getDate() + daysToAdd);
    return futureDate;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function random(highmark = 10000) {
    return Math.floor(Math.random() * highmark) + 1; // Generate a number between 1 and highmark
}

function nextProductTypeIndex() {
    const result = productTypeIndexCounter;
    productTypeIndexCounter = productTypeIndexCounter + 1;
    if (productTypeIndexCounter >= productTypes.length) {
        productTypeIndexCounter = 0;
    }

    return result;
}



