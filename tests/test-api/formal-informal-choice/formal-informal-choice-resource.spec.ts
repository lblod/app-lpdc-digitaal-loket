import {expect, test} from '@playwright/test';
import {loginAsBilzen, loginAsPepingen} from "../test-helpers/login";
import {deleteAll} from "../test-helpers/sparql";
import {dispatcherUrl} from "../test-helpers/test-options";


test.beforeEach(async ({request}) => {
    await deleteAll(request);
});


test('Can get a unchosen formal informal choice of bestuurseenheid', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    const formalInformalChoicePepingen = await request.get(`${dispatcherUrl}/formal-informal-choices`, {headers: {cookie: loginResponse.cookie}});

    expect(formalInformalChoicePepingen.ok()).toBeTruthy();
    expect(await formalInformalChoicePepingen.json()).toMatchObject({
        data: []
    });
});

test('Can save chose formal informal choice of bestuurseenheid', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const response = await request.post(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {cookie: loginResponse.cookie, 'Content-Type': 'application/vnd.api+json'},
            data: {
                data: {
                    type: 'formal-informal-choices',
                    attributes: {
                        'chosen-form': 'formal',
                        'date-created': '2023-07-24T13:44:19.326Z'
                    },
                    relationships: {
                        bestuurseenheid: {
                            data: {
                                id: '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                                type: 'bestuurseenheid'
                            }
                        }
                    }
                },
            },
        }
    );

    const postFormalInformalChoiceResponse = await response.json();
    const id = postFormalInformalChoiceResponse.data.id;

    const formalInformalChoicePepingen = await request.get(
        `${dispatcherUrl}/formal-informal-choices`,
        {params: {include: 'bestuurseenheid'}}
    );

    expect(formalInformalChoicePepingen.ok()).toBeTruthy();
    expect(await formalInformalChoicePepingen.json()).toMatchObject({
        data: [{
            attributes: {
                'chosen-form': 'formal',
                'date-created': '2023-07-24T13:44:19.326Z'
            },
            relationships: {
                bestuurseenheid: {
                    links: {
                        related: `/formal-informal-choices/${id}/bestuurseenheid`,
                        self: `/formal-informal-choices/${id}/links/bestuurseenheid?include=bestuurseenheid`,
                    },
                    data: {
                        type: "bestuurseenheden",
                        id: "73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589"
                    }
                }
            }
        }],
        included: [
            {
                id: '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                type: 'bestuurseenheden',
                attributes: {
                    naam: 'Pepingen'
                },
            }
        ]
    });
});

test('login as other bestuurseenheid should not return formal informal choice of Peppingen', async ({request}) => {
    let loginResponse = await loginAsPepingen(request);
    const response = await request.post(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {cookie: loginResponse.cookie, 'Content-Type': 'application/vnd.api+json'},
            data: {
                data: {
                    type: 'formal-informal-choices',
                    attributes: {
                        'chosen-form': 'formal',
                        'date-created': '2023-07-24T13:44:19.326Z'
                    },
                    relationships: {
                        bestuurseenheid: {
                            data: {
                                id: '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                                type: 'bestuurseenheid'
                            }
                        }
                    }
                },
            },
        }
    );
    expect(response.ok()).toBeTruthy();
    loginResponse = await loginAsBilzen(request);
    const formalInformalChoiceBilzen = await request.get(`${dispatcherUrl}/formal-informal-choices`, {headers: {cookie: loginResponse.cookie}});
    expect(await formalInformalChoiceBilzen.json()).toMatchObject({
        data: []
    });

});

