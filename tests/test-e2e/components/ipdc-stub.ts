import {expect, request} from "@playwright/test";
import {ipdcStubUrl} from "../../test-api/test-helpers/test-options";
import {wait} from "../shared/shared";

export class IpdcStub {

    constructor() {
    }

    static async findPublishedInstance(titel: string, expectedFormalOrInformalTripleLanguage: string) {
        const apiRequest = await request.newContext({
            extraHTTPHeaders: {
                'Accept': 'application/ld+json',
            }
        });
        let waitTurn = 0;
        const maxRetries = 45;
        while (true) {
            waitTurn++;
            try {
                const response = await apiRequest.get(`${ipdcStubUrl}/instanties`);
                const result = await response.json();
                const publishedInstanceWithTitel = result.find((ipdcPublish) => {
                    return ipdcPublish.find((element) => {
                        return element['@type'].includes('http://purl.org/vocab/cpsv#PublicService')
                            && element['http://purl.org/dc/terms/title'].some((translatedValue) =>
                                translatedValue['@language'] === expectedFormalOrInformalTripleLanguage
                                && translatedValue['@value'] === titel)
                    })
                });
                if (publishedInstanceWithTitel) {
                    return publishedInstanceWithTitel;
                }
            } catch (error) {
                console.log('Error retrieving instances ', error);
                throw error;
            }
            console.log(`No response from IPDC Stub yet, retrying... number of tries (${waitTurn})`);
            await wait(1000);
            if (waitTurn > maxRetries) {
                console.log(`No response form IPDC Stub after ${waitTurn} retries, stopped waiting.`);
                return undefined;
            }
        }
    }

    static getObjectByType(instance: any[], type: string): any[] {
        const object = instance.filter(object => object['@type'][0] === type);
        expect(object).toHaveLength(1);
        return object[0];
    }

    static getObjectById(instance: any[], id: string) {
        const object = instance.filter(object => object['@id'] === id);
        expect(object).toHaveLength(1);
        return object[0];
    }

    static async createSnapshotOfTypeCreate(uuid: string): Promise<Snapshot> {
        const apiRequest = await request.newContext();
        const response = await apiRequest.post(`${ipdcStubUrl}/conceptsnapshot/${uuid}/create`);
        return response.json();
    }

    static async createSnapshotOfTypeUpdate(uuid: string, withRandomTitle: boolean = false): Promise<Snapshot> {
        const apiRequest = await request.newContext();
        const response = await apiRequest.post(`${ipdcStubUrl}/conceptsnapshot/${uuid}/update`,{params:{withRandomTitle: withRandomTitle}});
        return response.json();

    }

    static async createSnapshotOfTypeArchive(uuid: string): Promise<Snapshot> {
        const apiRequest = await request.newContext();
        const response = await apiRequest.post(`${ipdcStubUrl}/conceptsnapshot/${uuid}/archive`);
        return response.json();
    }
}

type Snapshot = {
    id: string,
    productId: string,
    title: string
}
