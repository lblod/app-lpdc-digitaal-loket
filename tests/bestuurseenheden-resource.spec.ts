import {test, expect} from '@playwright/test';

test(`Can get a bestuurseenheid`, async ({request}) => {
    const pepingen = await request.get("http://localhost:91/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589");

    expect(pepingen.ok()).toBeTruthy();
    expect(await pepingen.json()).toMatchObject({
        data: {
            attributes: {
                naam: "Pepingen",
                uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589"
            },
            id: "73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
            type: "bestuurseenheden"
        }
    })

});
