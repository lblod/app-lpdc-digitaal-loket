import { v4 as uuid } from 'uuid';

const productTypes = ['FinancieleVerplichting', 'Toelating', 'Bewijs', 'Voorwerp', 'AdviesBegeleiding', 'InfrastructuurMateriaal', 'FinancieelVoordeel'];

const doelgroepen = ['Burger', 'Onderneming', 'Organisatie', 'VlaamseOverheid', 'LokaalBestuur', 'Vereniging'];

const themas = ['BurgerOverheid', 'CultuurSportVrijeTijd', 'EconomieWerk', 'MilieuEnergie', 'MobiliteitOpenbareWerken', 'OnderwijsWetenschap', 'WelzijnGezondheid', 'BouwenWonen'];

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
            "nl": `<p>Concept created beschrijving${randomData}</p>`,
            "nl-BE-x-generated-formal": `<p>Concept created beschrijving  - generated-formal${randomData}</p>`,
            "nl-BE-x-generated-informal": `<p>Concept created beschrijving - generated-informal${randomData}</p>`
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
        ...(withRandomNewData ? voorwaarden(randomData) : {}),
        ...(withRandomNewData ? procedures(randomData) : {}),
        ...(withRandomNewData ? kost(randomData) : {}),
        ...(withRandomNewData ? financieleVoordelen(randomData) : {}),
        ...(withRandomNewData ? regelgeving(randomData) : {}),
        ...(withRandomNewData ? meerInfo(randomData) : {}),
        ...(withRandomNewData ?
            {
                "startDienstVerlening": getRandomFutureDate().toISOString(),
                "eindeDienstVerlening": getRandomFutureDate().toISOString(),
                "type": getRandomElement(productTypes),
                "doelgroepen": [getRandomElement(doelgroepen), getRandomElement(doelgroepen), getRandomElement(doelgroepen)],
                "themas": [getRandomElement(themas), getRandomElement(themas), getRandomElement(themas)]
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
            "nl": `<p>Concept beschrijving updated${randomData}</p>`,
            "nl-BE-x-generated-formal": `<p>Concept beschrijving updated - generated-formal${randomData}</p>`,
            "nl-BE-x-generated-informal": `<p>Concept beschrijving updated - generated-informal${randomData}</p>`
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
        ...(withRandomNewData ? voorwaarden(randomData) : {}),
        ...(withRandomNewData ? procedures(randomData) : {}),
        ...(withRandomNewData ? kost(randomData) : {}),
        ...(withRandomNewData ? financieleVoordelen(randomData) : {}),
        ...(withRandomNewData ? regelgeving(randomData) : {}),
        ...(withRandomNewData ? meerInfo(randomData) : {}),
        ...(withRandomNewData ?
            {
                "startDienstVerlening": getRandomFutureDate().toISOString(),
                "eindeDienstVerlening": getRandomFutureDate().toISOString(),
                "type": getRandomElement(productTypes),
                "doelgroepen": [getRandomElement(doelgroepen), getRandomElement(doelgroepen), getRandomElement(doelgroepen)],
                "themas": [getRandomElement(themas), getRandomElement(themas), getRandomElement(themas)]
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
            "nl": `<p>Concept beschrijving archived${randomData}</p>`,
            "nl-BE-x-generated-formal": `<p>Concept beschrijving archived - generated-formal${randomData}</p>`,
            "nl-BE-x-generated-informal": `<p>Concept beschrijving archived - generated-informal${randomData}</p>`,
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
    const daysToAdd = Math.floor(Math.random() * 365) + 1; // Generate a number between 1 and 365
    futureDate.setDate(today.getDate() + daysToAdd);
    return futureDate;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}


