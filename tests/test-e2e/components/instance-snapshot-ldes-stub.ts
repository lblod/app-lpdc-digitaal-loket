import { APIRequestContext, expect, request } from "@playwright/test";
import { instanceSnapshotLdesStubUrl, virtuosoUrl } from "../../test-api/test-helpers/test-options";
import { wait } from "../shared/shared";

export class InstanceSnapshotLdesStub {

    constructor() {

    }

    static async createSnapshot(instanceId: string, gearchiveerd: boolean): Promise<Snapshot> {
        const apiRequest = await request.newContext();
        const response = await apiRequest.post(`${instanceSnapshotLdesStubUrl}/instancesnapshot/${instanceId}/${gearchiveerd}`);
        const snapshot: Snapshot = await response.json();
        await processSnapshot(apiRequest, snapshot.id);

        return snapshot;
    }

    static async createInvalidSnapshot(instanceId: string): Promise<Snapshot> {
        const apiRequest = await request.newContext();
        const response = await apiRequest.post(`${instanceSnapshotLdesStubUrl}/instancesnapshot/${instanceId}/invalid`);
        const snapshot: Snapshot = await response.json();
        await processSnapshot(apiRequest, snapshot.id);

        return snapshot;
    }

}

async function processSnapshot(request: APIRequestContext, instanceSnapshotId: string): Promise<void> {
    console.log(`waiting for processing instance snapshot <${instanceSnapshotId}>`);
    const maxPollAttempts = 60;
    for (let i = 0; i < maxPollAttempts; i++) {
        await wait(1000);
        if (await isInstanceSnapshotProcessed(request, instanceSnapshotId)) {
            console.log(`instance snapshot <${instanceSnapshotId}> processed after ${i + 1} seconds`);
            return;
        }
    }
    throw new Error(`instance snapshot <${instanceSnapshotId}> not processed after ${maxPollAttempts} seconds`);
}

async function isInstanceSnapshotProcessed(request: APIRequestContext, instanceSnapshotId: string): Promise<boolean> {
    const query = `
    ASK WHERE {
        ?markerId <http://mu.semte.ch/vocabularies/ext/processedSnapshot> <${instanceSnapshotId}> .
    }       
    `;
    const response = await request.get(`${virtuosoUrl}/sparql`, {
        params: {
            query: query,
            format: 'application/sparql-results+json'
        }
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    return (await response.json()).boolean;
}


export type Snapshot = {
    id: string,
    isVersionOf: string,
    title: string,
    description: string,
}