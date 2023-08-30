import {expect, test} from '@playwright/test';
import {dispatcherUrl} from "./test-helpers/test-options";

for (const url of ['', 'non-existing-url']) {
    test(`Dispatcher Reports Not Found on url ${url}`, async ({request}) => {
        const result = await request.get(dispatcherUrl);

        expect(result.status()).toEqual(404);

        expect(await result.text()).toEqual("Route not found.  See config/dispatcher.ex");
    });
}
