import {
    DATE_17_JULY, determineSnapshotToLinkToInstance,
    findFirstSnapshotAfterDate,
    findLastSnapshotBeforeDate, Instance,
    Snapshot
} from "./link-instantie-to-snapshot-migratie";


describe('findFirstSnapshotAfterDate', () => {

    test('no snapshot after DATE 17 JULY', () => {
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2022-10-06T13:25:11.734755Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2022-10-06T13:30:20.567914Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2022-10-07T10:50:15.688381Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2022-12-02T11:25:05.389836Z'},
        ];

        const actual = findFirstSnapshotAfterDate(snapshots, DATE_17_JULY);

        expect(actual).toEqual(undefined);
    });


    test('one snapshot after DATE 17 JULY ', () => {
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2022-10-06T13:25:11.734755Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2022-10-06T13:30:20.567914Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2022-10-07T10:50:15.688381Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2023-07-17T11:25:05.389836Z'},
        ];

        const actual = findFirstSnapshotAfterDate(snapshots, DATE_17_JULY);

        expect(actual).toEqual({uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2023-07-17T11:25:05.389836Z'});
    });

    test('multiple snapshots after DATE 17 JULY ', () => {
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2022-10-06T13:25:11.734755Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2022-10-06T13:30:20.567914Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2023-07-18T10:50:15.688381Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2023-08-12T11:25:05.389836Z'},
        ];

        const actual = findFirstSnapshotAfterDate(snapshots, DATE_17_JULY);

        expect(actual).toEqual({uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2023-07-18T10:50:15.688381Z'});
    });

});


describe('findLastSnapshotBeforeDate', () => {

    test('no snapshot before DATE 17 JULY', () => {
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2023-10-06T13:25:11.734755Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2023-10-06T13:30:20.567914Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2023-10-07T10:50:15.688381Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2023-12-02T11:25:05.389836Z'},
        ];

        const actual = findLastSnapshotBeforeDate(snapshots, DATE_17_JULY);

        expect(actual).toEqual(undefined);
    });

    test('one snapshot before DATE 17 JULY ', () => {
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2023-07-06T13:25:11.734755Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2023-10-06T13:30:20.567914Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2023-10-07T10:50:15.688381Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2023-12-17T11:25:05.389836Z'},
        ];

        const actual = findLastSnapshotBeforeDate(snapshots, DATE_17_JULY);

        expect(actual).toEqual({uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2023-07-06T13:25:11.734755Z'});
    });

    test('multiple snapshots before DATE 17 JULY ', () => {
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: '2023-07-06T13:25:11.734755Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2023-07-06T13:30:20.567914Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/78999140-14c0-4028-a550-f1aa49c68cdc', generatedAtTime: '2023-11-18T10:50:15.688381Z'},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/6da50ac4-1475-499c-be19-f8d2d0180f1c', generatedAtTime: '2023-12-12T11:25:05.389836Z'},
        ];

        const actual = findLastSnapshotBeforeDate(snapshots, DATE_17_JULY);

        expect(actual).toEqual({uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: '2023-07-06T13:30:20.567914Z'});
    });

});

describe('determineSnapshotToLinkToInstance', () => {

    const DATE_1_BEFORE = '2023-05-06T13:25:11.734755Z';
    const DATE_2_BEFORE = '2023-05-18T13:25:11.734755Z';
    const DATE_3_BEFORE = '2023-06-12T13:25:11.734755Z';
    const DATE_4_BEFORE = '2023-06-28T13:25:11.734755Z';
    const DATE_1_AFTER = '2023-07-17T13:25:11.734755Z';
    const DATE_2_AFTER = '2023-08-04T13:25:11.734755Z';
    const DATE_3_AFTER = '2023-09-04T13:25:11.734755Z';
    const DATE_4_AFTER = '2023-10-04T13:25:11.734755Z';
    const DATE_5_AFTER = '2023-10-24T13:25:11.734755Z';

    test('concept never changed', () => {
        // snapshot 1 -> instance created
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: DATE_1_BEFORE},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_1_BEFORE,
            modified: DATE_2_BEFORE,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.generatedAtTime).toEqual(DATE_1_BEFORE);
    });

    test('instance never changed', () => {
        // snapshot 1 -> instance created -> snapshot 2
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: DATE_1_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: DATE_3_BEFORE},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_2_BEFORE,
            modified: DATE_2_BEFORE,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.generatedAtTime).toEqual(DATE_1_BEFORE);
    });

    test('instance never changed after concept update', () => {
        // snapshot 1 -> instance created -> instance last updated -> snapshot 2
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: DATE_1_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: DATE_4_BEFORE},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_2_BEFORE,
            modified: DATE_3_BEFORE,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.generatedAtTime).toEqual(DATE_1_BEFORE);
    });

    test('instance created before 17/7 and last updated before', () => {
        // snapshot 1 -> instance created -> snapshot 2 -> instance last updated -> 17/7
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/d3d110a1-248e-478d-aec5-d1aae9d8772e', generatedAtTime: DATE_1_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/fa789f2f-fbf4-4ea6-bee7-77953d8d0c7e', generatedAtTime: DATE_3_BEFORE},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_2_BEFORE,
            modified: DATE_4_BEFORE,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.generatedAtTime).toEqual(DATE_3_BEFORE);
    });

    test('instance created before 17/7 and last updated after', () => {
        // snapshot 1 -> instance created -> snapshot 2 -> 17/7 -> snapshot 3 -> instance last updated
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/1', generatedAtTime: DATE_1_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/2', generatedAtTime: DATE_3_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/3', generatedAtTime: DATE_1_AFTER},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_2_BEFORE,
            modified: DATE_2_AFTER,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.uri).toEqual('https://ipdc.vlaanderen.be/id/conceptsnapshot/2');
        expect(actual.generatedAtTime).toEqual(DATE_3_BEFORE);
    });

    test('instance created after 17/7 based on snapshot created before 17/7', () => {
        // snapshot 1 -> 17/7 -> instance created -> snapshot 2 -> instance last updated
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/1', generatedAtTime: DATE_1_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/2', generatedAtTime: DATE_2_AFTER},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_1_AFTER,
            modified: DATE_3_AFTER,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.uri).toEqual('https://ipdc.vlaanderen.be/id/conceptsnapshot/1');
        expect(actual.generatedAtTime).toEqual(DATE_1_BEFORE);
    });

    test('instance created after 17/7 based on snapshot created after 17/7', () => {
        // snapshot 1 -> 17/7 -> snapshot 2 -> instance created -> snapshot 3 -> instance last updated
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/1', generatedAtTime: DATE_1_BEFORE},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/2', generatedAtTime: DATE_1_AFTER},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/3', generatedAtTime: DATE_3_AFTER},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_2_AFTER,
            modified: DATE_4_AFTER,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.uri).toEqual('https://ipdc.vlaanderen.be/id/conceptsnapshot/2');
        expect(actual.generatedAtTime).toEqual(DATE_1_AFTER);
    });

    test('instance created after 17/7 based on 2nd snapshot created after 17/7', () => {
        // 17/7 -> snapshot 1 -> snapshot 2 -> instance created -> snapshot 3 -> instance last updated
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/1', generatedAtTime: DATE_1_AFTER},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/2', generatedAtTime: DATE_2_AFTER},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/2', generatedAtTime: DATE_4_AFTER},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_3_AFTER,
            modified: DATE_5_AFTER,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.uri).toEqual('https://ipdc.vlaanderen.be/id/conceptsnapshot/2');
        expect(actual.generatedAtTime).toEqual(DATE_2_AFTER);
    });

    test('instance created after 17/7 with multiple concept updates before instance last updated', () => {
        // 17/7 -> snapshot 1 -> instance created -> snapshot 2 -> snapshot 3 -> instance last updated
        const snapshots: Snapshot[] = [
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/1', generatedAtTime: DATE_1_AFTER},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/2', generatedAtTime: DATE_3_AFTER},
            {uri: 'https://ipdc.vlaanderen.be/id/conceptsnapshot/3', generatedAtTime: DATE_4_AFTER},
        ];

        const instance: Instance = {
            uri: 'http://data.lblod.info/id/public-service/edf13227-a6b2-4cf4-aec2-24be8ff96922',
            graphUri: 'http://graph',
            created: DATE_2_AFTER,
            modified: DATE_5_AFTER,
            conceptUri: 'https://ipdc.vlaanderen.be/id/concept/8ea4bc43-80a9-4362-aa71-ae9505ad210a'
        }

        const actual = determineSnapshotToLinkToInstance(instance, snapshots);
        expect(actual.uri).toEqual('https://ipdc.vlaanderen.be/id/conceptsnapshot/1');
        expect(actual.generatedAtTime).toEqual(DATE_1_AFTER);
    });


});