import { v4 as uuid } from 'uuid';
import pkg from "lodash";
const {uniq} = pkg;

const pepingen = {
    uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
    name: "Pepingen",
    classificatie: "Gemeente",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24123064",
    spatialNisLabel: "Pepingen"
}

const aarschot = {
    uri: "http://data.lblod.info/id/bestuurseenheden/ba4d960fe3e01984e15fd0b141028bab8f2b9b240bf1e5ab639ba0d7fe4dc522",
    name: "Aarschot",
    classificatie: "Gemeente",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24224001",
    spatialNisLabel: "Aarschot"
}

const leuven = {
    uri: "http://data.lblod.info/id/bestuurseenheden/c648ea5d12626ee3364a02debb223908a71e68f53d69a7a7136585b58a083e77",
    name: "Leuven",
    classificatie: "Gemeente",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24224062",
    spatialNisLabel: "Leuven"
}

const provincieVlaamsBrabant = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8b7e7bf05ace5bb1a68f5bc0d870e20c20f147b00bd9a3dcce3a01733d4da744",
    name: "Vlaams-Brabant",
    classificatie: "Provincie",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24",
    spatialNisLabel: "Provincie Vlaams-Brabant"
}

const ocmwLeuven = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8a162fa437a54cb657b57514e4e0135ec106fce3206c29cd2f90b1859ed90dab",
    name: "Leuven",
    classificatie: "OCMW",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24224062",
    spatialNisLabel: "Leuven"
}

const districtWilrijk = {
    uri: "http://data.lblod.info/id/bestuurseenheden/73e8904d83f7324e39abc0adf639b0e48bc52533c4c243b6419cac8fb70784cf",
    name: "Wilrijk",
    classificatie: "District",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
}

const autonoomGemeentebedrijf = {
    uri: "http://data.lblod.info/id/bestuurseenheden/5b6b1771d90a683e65f3473ea76c0d37d80d08a8647fd96783eda9af179a8115",
    name: "AGB Pepingen",
    classificatie: "Autonoom gemeentebedrijf",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24123064",
    spatialNisLabel: "Pepingen"
}

const autonoomProvinciebedrijf = {
    uri: "http://data.lblod.info/id/bestuurseenheden/ebc8589470b92ac994448573f072f7a0408e4ab893364ed118fd65537c3b9ed0",
    name: "APB Provinciaal Onderwijs Antwerpen",
    classificatie: "Autonoom provinciebedrijf",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE21",
    spatialNisLabel: "Provincie Antwerpen"
}

const dienstverlenendeVereniging = {
    uri: "http://data.lblod.info/id/bestuurseenheden/11410c82b479306316ccaa6d18f695bf276b71e3dcdb95af5df9530b3125aecd",
    name: "Intergemeentelijk samenwerkingsverband Scheldelandschapspark",
    classificatie: "Dienstverlenende vereniging",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
}

const hulpverleningszone = {
    uri: "http://data.lblod.info/id/bestuurseenheden/0e951dd15341d38413bf809f16ef5f1bd163092001ac04ce78a4de5b5e9cdd37",
    name: "HULPVERLENINGSZONE MEETJESLAND",
    classificatie: "Hulpverleningszone",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
}

const opdrachthoudendeVereniging = {
    uri: "http://data.lblod.info/id/bestuurseenheden/09ba2fe670a607d3351a0e60cbd79f9e1a04992d576ccf33e842c80e669da996",
    name: "Intergemeentelijke Maatschappij voor Openbare Gezondheid in Zuid-West-Vlaanderen",
    classificatie: "Opdrachthoudende vereniging",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
};

const politieZone = {
    uri: "http://data.lblod.info/id/bestuurseenheden/04e7a09c988feed3cf8df1c51aafe0f0a50811e325f5f5ab8e1b9750f48630fd",
    name: "Politiezone van Middelkerke",
    classificatie: "Politiezone",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE25535011",
    spatialNisLabel: "Middelkerke"
}

const projectvereniging = {
    uri: "http://data.lblod.info/id/bestuurseenheden/efe77fae-7ba7-4a62-873f-1f291b5a911f",
    name: "Brabantse Kouters Oost",
    classificatie: "Projectvereniging",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24123088",
    spatialNisLabel: "Vilvoorde"
}

const ocmwVereniging = {
    uri: "http://data.lblod.info/id/bestuurseenheden/cce1926b-51ff-4b66-a702-ea985f1d250b",
    name: "A.S.Z. Autonome Verzorgingsinstelling",
    classificatie: "OCMW vereniging",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE23141002",
    spatialNisLabel: "Aalst"
}

const productTypes = ['Toelating', 'Bewijs', 'Voorwerp'];

const doelgroepen = ['Burger', 'Onderneming', 'Organisatie', 'Vereniging'];

const themas = ['BurgerOverheid', 'CultuurSportVrijeTijd', 'EconomieWerk', 'MilieuEnergie', 'BouwenWonen', 'WelzijnGezondheid'];

const bevoegdeBestuursniveaus = ['Europees', 'Federaal', 'Vlaams', 'Provinciaal', 'Lokaal'];

const bevoegdeOverheden = [pepingen.uri, aarschot.uri, leuven.uri, provincieVlaamsBrabant.uri, ocmwLeuven.uri, autonoomGemeentebedrijf.uri, autonoomProvinciebedrijf.uri];

const uitvoerendeBestuursniveaus = ['Europees', 'Federaal', 'Vlaams', 'Provinciaal', 'Lokaal', 'Derden'];

const uitvoerendeOverheden = [ocmwVereniging.uri, projectvereniging.uri, politieZone.uri, opdrachthoudendeVereniging.uri, hulpverleningszone.uri, dienstverlenendeVereniging.uri];

const yourEuropeCategorieën = [
    'Bedrijf',
    'BedrijfAansprakelijkheidBestuurders',
    'BedrijfFusieVerkoop',
    'BedrijfInsolventieLiquidatie',
    'BedrijfIntellectueleEigendomsrechten',
    'Belastingen',
    'BelastingenAccijnzen',
    'BelastingenOverigeBelastingen',
    'BeschermingPersoonsgegevens',
    'BeschermingPersoonsgegevensUitoefeningRechten',
    'BurgerEnFamilieRechten',
    'BurgerEnFamilieRechtenPartners',
    'ConsumentenrechtenVeiligheid',
    'Diensten',
    'DienstenErkenningBeroepskwalificaties',
    'GezondheidszorgWoonzorgcentrum',
    'GezondheidszorgZiekteverzekering',
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
                    "@type": "bewijsType"
                },
                "@type": "voorwaarde",
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
                        "@type": "website",
                        "order": 0.0
                    }
                ],
                "@type": "procedure",
                "order": 0.0
            }
        ],
    }
};

const kost = (randomStr) => {
    return {
        "kosten": [
            {
                "naam": {
                    "nl": `Kost${randomStr}`,
                    "nl-BE-x-generated-formal": `Kost - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Kost - generated-informal${randomStr}`,
                },
                "beschrijving": {
                    "nl": `Kost beschrijving${randomStr}`,
                    "nl-BE-x-generated-formal": `Kost beschrijving - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Kost beschrijving - generated-informal${randomStr}`,
                },
                "@type": "kost",
                "order": 0.0
            }
        ]
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
                "@type": "financieelVoordeel",
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
        "regelgevendeBronnen": [
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
                "@type": "regelgevendeBron",
                "order": 0.0
            }
        ],
    }
};

const meerInfo = (randomStr) => {
    return {
        "websites": [
            {
                "naam": {
                    "nl": `Website${randomStr}`,
                    "nl-BE-x-generated-formal": `Website - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Website - generated-informal${randomStr}`,
                },
                "beschrijving": {
                    "nl": `Website beschrijving${randomStr}`,
                    "nl-BE-x-generated-formal": `Website beschrijving - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Website beschrijving - generated-informal${randomStr}`,
                },
                "url": `https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit${randomStr.replace(/\s+/g, '')}`,
                "@type": "website",
                "order": 0.0
            }
        ],
    }
};

export const conceptCreate = (conceptId, withRandomNewData) => {
    const id = uuid();

    const randomData = ` - ${conceptId}`;

    return {
        "id": id,
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
        "creatie": "2023-10-10T15:25:09.822193785Z",
        ...(withRandomNewData ? voorwaarden(` - created${randomData}`) : {}),
        ...(withRandomNewData ? procedures(` - created${randomData}`) : {}),
        ...(withRandomNewData ? kost(` - created${randomData}`) : {}),
        ...(withRandomNewData ? financieleVoordelen(` - created${randomData}`) : {}),
        ...(withRandomNewData ? regelgeving(` - created${randomData}`) : {}),
        ...(withRandomNewData ? meerInfo(` - created${randomData}`) : {}),
        ...(withRandomNewData ?
            {
                "startDienstVerlening": getRandomFutureDate().toISOString(),
                "eindeDienstVerlening": getRandomFutureDate().toISOString(),
                "type": getRandomElement(productTypes),
                "doelgroepen": uniq([getRandomElement(doelgroepen), getRandomElement(doelgroepen)]),
                "themas": uniq([getRandomElement(themas), getRandomElement(themas)]),
                "bevoegdBestuursniveaus": uniq([getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus)]),
                "bevoegdeOverheden": uniq([getRandomElement(bevoegdeOverheden), getRandomElement(bevoegdeOverheden)]).map(elem => ({ "@id": elem })),
                "uitvoerendBestuursniveaus": uniq([getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus)]),
                "uitvoerendeOverheden": uniq([getRandomElement(uitvoerendeOverheden), getRandomElement(uitvoerendeOverheden)]).map(elem => ({ "@id": elem })),
                "zoektermen": { "nl": uniq([random(), random(), random()].map(i => `zoekterm - ${i}`)) },
            } : {}),
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": false,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicServiceSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`
    };
};

export const conceptUpdate = (conceptId, withRandomNewData) => {
    const id = uuid();

    const randomData = ` - ${conceptId}${withRandomNewData ? ` - ${id}` : ''}`;

    return {
        "id": id,
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "nl": `Concept updated${randomData}`,
            "nl-BE-x-generated-formal": `Concept updated${randomData}`,
            "nl-BE-x-generated-informal": `Concept updated${randomData}`
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
        ...(withRandomNewData ? voorwaarden(` - updated${randomData}`) : {}),
        ...(withRandomNewData ? procedures(` - updated${randomData}`) : {}),
        ...(withRandomNewData ? kost(` - updated${randomData}`) : {}),
        ...(withRandomNewData ? financieleVoordelen(` - updated${randomData}`) : {}),
        ...(withRandomNewData ? regelgeving(` - updated${randomData}`) : {}),
        ...(withRandomNewData ? meerInfo(` - updated${randomData}`) : {}),
        ...(withRandomNewData ?
            {
                "startDienstVerlening": getRandomFutureDate().toISOString(),
                "eindeDienstVerlening": getRandomFutureDate().toISOString(),
                "type": getRandomElement(productTypes),
                "doelgroepen": uniq([getRandomElement(doelgroepen), getRandomElement(doelgroepen), getRandomElement(doelgroepen)]),
                "themas": uniq([getRandomElement(themas), getRandomElement(themas), getRandomElement(themas)]),
                "bevoegdBestuursniveaus": uniq([getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus), getRandomElement(bevoegdeBestuursniveaus)]),
                "bevoegdeOverheden": uniq([getRandomElement(bevoegdeOverheden), getRandomElement(bevoegdeOverheden), getRandomElement(bevoegdeOverheden)]).map(elem => ({ "@id": elem })),
                "uitvoerendBestuursniveaus": uniq([getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus), getRandomElement(uitvoerendeBestuursniveaus)]),
                "uitvoerendeOverheden": uniq([getRandomElement(uitvoerendeOverheden), getRandomElement(uitvoerendeOverheden), getRandomElement(uitvoerendeOverheden)]).map(elem => ({ "@id": elem })),
                "zoektermen": { "nl": uniq([random(), random(), random(), random(), random()].map(i => `zoekterm - ${i}`)) },
                "publicatiekanalen": ["YourEurope"],
                "yourEuropeCategorieen": uniq([getRandomElement(yourEuropeCategorieën), getRandomElement(yourEuropeCategorieën), getRandomElement(yourEuropeCategorieën)]),
            } : {}),
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": false,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicServiceSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`
    };
};

export const conceptArchive = (conceptId, withRandomNewData) => {
    const id = uuid();
    const randomData = ` - ${conceptId}${withRandomNewData ? ` - ${id}` : ''}`;
    return {
        "id": id,
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "nl": `Concept archived${randomData}`,
            "nl-BE-x-generated-formal": `Concept archived${randomData}`,
            "nl-BE-x-generated-informal": `Concept archived${randomData}`
        },
        "beschrijving": {
            "nl": `Concept beschrijving archived${randomData}`,
            "nl-BE-x-generated-formal": `Concept beschrijving archived - generated-formal${randomData}`,
            "nl-BE-x-generated-informal": `Concept beschrijving archived - generated-informal${randomData}`,
        },
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": true,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicServiceSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`
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

function random(highmark = 1000) {
    return Math.floor(Math.random() * highmark) + 1; // Generate a number between 1 and highmark
}



