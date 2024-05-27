import { v4 as uuid } from 'uuid';

const kost = (randomStr) => {
    return {
        "kosten": [
            {
                "naam": {
                    "nl": `Kost${randomStr}`,
                    "nl-BE-x-generated-formal": `Kost - generated-formal${randomStr}`,
                    "nl-BE-x-generated-informal": `Kost - generated-formal${randomStr}`,
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
}

export const conceptCreate = (conceptId) => {
    const id = uuid();

    const randomData = ` - ${conceptId}`;

    return {
        "id": id,
        "generatedAtTime": new Date().toISOString(),
        "snapshotType": "Create",
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
        "creatie": "2023-10-10T15:25:09.822193785Z",
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
        "snapshotType": "Update",
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
        ...(withRandomNewData ? kost(randomData) : {}),
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
        "snapshotType": "Delete",
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
        ...(withRandomNewData ? kost(randomData) : {}),
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": true,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicServiceSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`
    }
};
