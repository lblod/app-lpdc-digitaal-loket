import {v4 as uuid} from 'uuid';

export const instanceSnapshot = (instanceId, gearchiveerd = false) => {
    const instanceSnapshotId = uuid();
    return {
        "@id": `http://data.lblod.info/id/public-service-snapshot/${instanceSnapshotId}`,
        "@type": [
            "PublicService"
        ],
        "isVersionOf": `http://data.lblod.info/id/public-service/${instanceId}`,
        "createdBy": "353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5",
        "aangemaaktOp": "2024-02-24T11:42:12.357Z",
        "bewerktOp": new Date().toISOString(),
        "generatedAtTime": new Date().toISOString(),
        "titel": {
            "nl-BE-x-informal": `Instantie ${instanceSnapshotId}`
        },
        "beschrijving": {
            "nl-BE-x-informal": `Beschrijving van de instantie ${instanceSnapshotId}`
        },
        "bevoegdeOverheden": [
            "353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"
        ],
        "geografischToepassingsgebieden": [
            "http://vocab.belgif.be/auth/refnis2019/44021"
        ],
        "uitvoerendeOverheden": [
            "353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5"
        ],
        "gearchiveerd": gearchiveerd.toString()
    };
};