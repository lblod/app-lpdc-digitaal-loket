import {test, expect} from '@playwright/test';

for (const url of ['', 'non-existing-url']) {
    test(`Dispatcher Reports Not Found on url ${url}`, async ({request}) => {
        const result = await request.get("http://localhost:91");

        expect(result.status()).toEqual(404);

        expect(await result.text()).toEqual("Route not found.  See config/dispatcher.ex");
    });
}
