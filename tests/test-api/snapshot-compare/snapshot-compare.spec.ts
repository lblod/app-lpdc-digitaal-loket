import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {ConceptSnapshotTestBuilder} from "../test-helpers/concept-snapshot.test-builder";
import {Language} from "../test-helpers/language";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession} from "../test-helpers/login";

test.describe('Compare snapshots', () => {

    test('When comparing same snapshot then isChanged should be empty list', async ({request}) => {
        const aSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const loginResponse = await loginAsPepingen(request);
        const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
            params: {
                snapshot1: aSnapshot.getSubject().getValue(),
                snapshot2: aSnapshot.getSubject().getValue()
            },
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
        });
        expect(actual.ok()).toBeTruthy();
        expect(await actual.json()).toEqual([]);
    });

    test('When no content change then isChanged should be empty list', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const loginResponse = await loginAsPepingen(request);
        const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
            params: {
                snapshot1: currentSnapshot.getSubject().getValue(),
                snapshot2: newSnapshot.getSubject().getValue()
            },
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
        });
        expect(actual.ok()).toBeTruthy();
        expect(await actual.json()).toEqual([]);
    });

    test('When content changed then isChanged should be list containing "basisinformatie"', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.NL}])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title updated', language: Language.NL}])
            .buildAndPersist(request);

        const loginResponse = await loginAsPepingen(request);
        const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
            params: {
                snapshot1: currentSnapshot.getSubject().getValue(),
                snapshot2: newSnapshot.getSubject().getValue()
            },
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
        });
        expect(actual.ok()).toBeTruthy();
        expect(await actual.json()).toEqual(['basisinformatie']);
    });

    test('comparing snapshots without login, returns http 401 Unauthorized', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.NL}])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title updated', language: Language.NL}])
            .buildAndPersist(request);

        const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
            params: {
                snapshot1: currentSnapshot.getSubject().getValue(),
                snapshot2: newSnapshot.getSubject().getValue()
            }
        });

        expect(actual.status()).toEqual(401);
    });

    test('comparing snapshots with a user that has no access rights, returns http 403 Forbidden', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.NL}])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title updated', language: Language.NL}])
            .buildAndPersist(request);

        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
            params: {
                snapshot1: currentSnapshot.getSubject().getValue(),
                snapshot2: newSnapshot.getSubject().getValue()
            },
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
        });

        expect(actual.status()).toEqual(403);
    });

    test('comparing snapshots without required params, returns http 400 BadRequest', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title', language: Language.NL}])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([{value: 'title updated', language: Language.NL}])
            .buildAndPersist(request);

        const loginResponse = await loginAsPepingen(request);
        const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot/compare`, {
            params: {
                snapshot1: currentSnapshot.getSubject().getValue(),
            },
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
        });

        expect(actual.status()).toEqual(400);
        expect(await actual.json()).toEqual(expect.objectContaining({message: 'Geef 2 snapshots op om te vergelijken'}));
    });

});
