import {v4 as uuid} from 'uuid';

export const conceptUpdate = () => {
    const id = uuid();
    return {
        "id": id,
        "generatedAtTime": "2023-03-08T16:05:10.515702Z",
        "snapshotType": "Update",
        "naam": {
            "nl": "Concept is updated",
            "nl-BE-x-generated-formal": "Concept is updated",
            "nl-BE-x-generated-informal": "Concept is updated"
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
        "@type": "ConceptualPublicService",
        "isVersionOf": "https://ipdc.tni-vlaanderen.be/id/concept/68246193-5797-4d3e-a8dd-bafa252f8889"
    };
};

export const conceptArchive = () => {
    const id = uuid();
    return {
        "id": id,
        "generatedAtTime": "2023-03-08T16:05:10.515702Z",
        "snapshotType": "Delete",
        "naam": {
            "nl": "Concept is archived",
            "nl-BE-x-generated-formal": "Concept is archived",
            "nl-BE-x-generated-informal": "Concept is archived"
        },
        "beschrijving": {
            "nl": "<p>Concept</p>",
            "nl-BE-x-generated-formal": "<p>Concept</p>",
            "nl-BE-x-generated-informal": "<p>Concept</p>"
        },
        "creatie": "2023-10-10T15:25:09.822193785Z",
        "laatstGewijzigd": new Date().toISOString(),
        "productnummer": "3000",
        "gearchiveerd": true,
        "@id": `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${id}`,
        "@type": "ConceptualPublicService",
        "isVersionOf": "https://ipdc.tni-vlaanderen.be/id/concept/68246193-5797-4d3e-a8dd-bafa252f8889"
    }
};
