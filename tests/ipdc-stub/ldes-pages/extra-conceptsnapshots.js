import {v4 as uuid} from 'uuid';

const kost = {
    "kosten": [
        {
            "beschrijving": {
                "nl": "Kost beschrijving",
                "nl-BE-x-generated-formal": "Kost beschrijving",
                "nl-BE-x-generated-informal": "Kost beschrijving"
            },
            "naam": {
                "nl": "Kost",
                "nl-BE-x-generated-formal": "Kost",
                "nl-BE-x-generated-informal": "Kost"
            },
            "@type": "kost",
            "order": 0.0
        }
    ]
}
export const conceptCreate = (conceptId) => {
    const id = uuid();
    return {
        "id": id,
        "generatedAtTime": new Date().toISOString(),
        "snapshotType": "Create",
        "naam": {
            "nl": `Concept created ${conceptId}`,
            "nl-BE-x-generated-formal": `Concept created ${conceptId}`,
            "nl-BE-x-generated-informal": `Concept created ${conceptId}`
        },
        "beschrijving": {
            "nl": "<p>Concept</p>",
            "nl-BE-x-generated-formal": "<p>Concept</p>",
            "nl-BE-x-generated-informal": "<p>Concept</p>"
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

export const conceptUpdate = (conceptId, withRandomTitle, withAdditionalCost) => {
    const id = uuid();
    const titel = withRandomTitle? uuid(): '';

    return {
        "id": id,
        "generatedAtTime": new Date().toISOString(),
        "snapshotType": "Update",
        "naam": {
            "nl": `Concept updated ${conceptId}${titel}`,
            "nl-BE-x-generated-formal": `Concept updated ${conceptId}${titel}`,
            "nl-BE-x-generated-informal": `Concept updated ${conceptId}${titel}`
        },
        "beschrijving": {
            "nl": "<p>Concept</p>",
            "nl-BE-x-generated-formal": "<p>Concept</p>",
            "nl-BE-x-generated-informal": "<p>Concept</p>"
        },
        ...(withAdditionalCost ? kost : {}),
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": false,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicServiceSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`
    };
};

export const conceptArchive = (conceptId, withAdditionalCost) => {
    const id = uuid();
    return {
        "id": id,
        "generatedAtTime": new Date().toISOString(),
        "snapshotType": "Delete",
        "naam": {
            "nl": `Concept archived ${conceptId}`,
            "nl-BE-x-generated-formal": `Concept archived ${conceptId}`,
            "nl-BE-x-generated-informal": `Concept archived ${conceptId}`
        },
        "beschrijving": {
            "nl": "<p>Concept</p>",
            "nl-BE-x-generated-formal": "<p>Concept</p>",
            "nl-BE-x-generated-informal": "<p>Concept</p>"
        },
        ...(withAdditionalCost ? kost : {}),
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": true,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicServiceSnapshot",
        "isVersionOf": `https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}`
    }
};
