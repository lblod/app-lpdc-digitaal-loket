import {v4 as uuid} from 'uuid';

export const instanceSnapshot = (instanceId, gearchiveerd = false) => {
    const instanceSnapshotId = uuid();
    return {
        "@id": `http://data.lblod.info/id/public-service-snapshot/${instanceSnapshotId}`,
        "@type": [
            "InstantieSnapshot"
        ],
        "isVersionOf": `http://data.lblod.info/id/public-service/${instanceId}`,
        "aangemaaktDoor": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5",
        "creatie": "2024-02-24T11:42:12.357Z",
        "laatstGewijzigd": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "nl-BE-x-informal": `Instantie ${instanceSnapshotId}`
        },
        "beschrijving": {
            "nl-BE-x-informal": `<p data-indentation-level=\"0\">Beschrijving van de instantie ${instanceSnapshotId}</p>`
        },
        "bevoegdeOverheden": [
            "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"
        ],
        "geografischToepassingsgebieden": [
            "BE23444021"
        ],
        "uitvoerendeOverheden": [
            "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"
        ],
        "gearchiveerd": gearchiveerd.toString()
    };
};

export const invalidInstanceSnapshot = (instanceId) => {
    const instanceSnapshotId = uuid();
    return {
        "@id": `http://data.lblod.info/id/public-service-snapshot/${instanceSnapshotId}`,
        "@type": [
            "InstantieSnapshot"
        ],
        "isVersionOf": `http://data.lblod.info/id/public-service/${instanceId}`,
        "aangemaaktDoor": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5",
        "creatie": "2024-02-24T11:42:12.357Z",
        "laatstGewijzigd": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "naam": {
            "en": `Instantie ${instanceSnapshotId}`
        },
        "beschrijving": {
            "nl-BE-x-informal": `<p data-indentation-level=\"0\">Beschrijving van de instantie ${instanceSnapshotId}</p>`
        },
        "bevoegdeOverheden": [
            "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"
        ],
        "geografischToepassingsgebieden": [
            "BE23444021"
        ],
        "uitvoerendeOverheden": [
            "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"
        ],
    };
};