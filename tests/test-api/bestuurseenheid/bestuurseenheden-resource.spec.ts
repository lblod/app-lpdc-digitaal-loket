import {expect, test} from '@playwright/test';
import {dispatcherUrl} from "../test-helpers/test-options";

test(`Can get a bestuurseenheid`, async ({request}) => {
    const pepingen = await request.get(`${dispatcherUrl}/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589`);

    expect(pepingen.ok()).toBeTruthy();
    expect(await pepingen.json()).toMatchObject({
        data: {
            attributes: {
                naam: "Pepingendd",
                uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589"
            },
            id: "73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
            type: "bestuurseenheden",
            relationships: {
                contactinfo: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/contactinfo",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/contactinfo"
                    }
                },
                bestuursorganen: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/bestuursorganen",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/bestuursorganen"
                    }
                },
                vendors: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/vendors",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/vendors"
                    }
                },
                participations: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/participations",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/participations"
                    }
                },
                werkingsgebied: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/werkingsgebied",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/werkingsgebied"
                    }
                },
                provincie: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/provincie",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/provincie"
                    }
                },
                classificatie: {
                    links: {
                        self: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/links/classificatie",
                        related: "/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589/classificatie"
                    }
                }
            }
        }
    })

});
