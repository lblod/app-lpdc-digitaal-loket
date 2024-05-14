import {APIRequestContext, expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {Language} from "../test-helpers/language";
import {TripleArray} from "../test-helpers/triple-array";
import {loginAsPepingen} from "../test-helpers/login";

test.describe('Compare snapshots', () => {

    test('When comparing same snapshot then isChanged should be false', async ({request}) => {
        const aSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        expect(await compareSnapshots(aSnapshot, aSnapshot, request)).toEqual([]);
    });

    test('When no content change then isChanged should be false', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual([]);
    });

    test('When content changed then isChanged should be true', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.NL}])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title updated', language: Language.NL}])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual(['basisinformatie']);
    });

});

async function compareSnapshots(currentSnapshot: TripleArray, newSnapshot: TripleArray, request: APIRequestContext): Promise<boolean> {
    const loginResponse = await loginAsPepingen(request);

    const params = {
        snapshot1: currentSnapshot.getSubject().getValue(),
        snapshot2: newSnapshot.getSubject().getValue()
    };
    const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
        params,
        headers:
            {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
    });
    expect(actual.ok(), `${await actual.text()}`).toBeTruthy();
    return actual.json();
}
