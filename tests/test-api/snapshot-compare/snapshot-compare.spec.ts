import {APIRequestContext, expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {Language} from "../test-helpers/language";
import {TripleArray} from "../test-helpers/triple-array";

test.describe('Compare snapshots', () => {

    test('When comparing same snapshot then isChanged should be false', async ({request}) => {
        const aSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        expect(await compareSnapshots(aSnapshot, aSnapshot, request)).toEqual({isChanged: false});
    });

    test('When no content change then isChanged should be false', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
    });

    test('When content changed then isChanged should be true', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.EN}])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.NL}])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

});

async function compareSnapshots(currentSnapshot: TripleArray, newSnapshot: TripleArray, request: APIRequestContext): Promise<boolean> {
    const params = {
        currentSnapshotUri: currentSnapshot.getSubject().getValue(),
        newSnapshotUri: newSnapshot.getSubject().getValue()
    };
    const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot-compare`, {params});
    expect(actual.ok(), `${await actual.text()}`).toBeTruthy();
    return actual.json();
}