import {expect, test} from '@playwright/test';
import {dispatcherUrl} from '../test-helpers/test-options';

const resources = [
    'agenda-items',
    'agenda-item-handlings',
    'resolutions',
    'zittingen',
    'articles',
    'governing-bodies',
    'governing-body-classification-codes',
];

for (const resource of resources) {
    test(`Can get ${resource}`, async ({request}) => {
        const response = await request.get(`${dispatcherUrl}/${resource}?page[size]=1`, {
            headers: {Accept: 'application/vnd.api+json'},
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(Array.isArray(body.data)).toBeTruthy();
    });
}

test('The sessions login route is not shadowed by the resource route', async ({request}) => {
    const response = await request.post(`${dispatcherUrl}/sessions`, {
        headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
        },
        data: {},
    });

    const body = await response.text();
    expect(body).not.toContain('No type found in primary data');
});
