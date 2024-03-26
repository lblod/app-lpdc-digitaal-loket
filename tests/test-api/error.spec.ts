import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "./test-helpers/test-options";
import {loginAsPepingen} from "./test-helpers/login";


test('invalid route in lpdc-management returns not found error response', async ({request}) => {
    await loginAsPepingen(request);
    const response = await request.get(`${dispatcherUrl}/lpdc-management/public-services/non-exisiting-url`);

    expect(response.ok()).toBe(false);
    expect(response.status()).toEqual(404);
    expect(await response.json()).toEqual(expect.objectContaining({
        message: 'Pagina niet gevonden. Controleer de URL en probeer opnieuw.',
        correlationId: expect.anything()
    }))
});