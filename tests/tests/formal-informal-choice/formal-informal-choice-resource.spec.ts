import {test, expect} from '@playwright/test';
import {loginAsBilzen, loginAsPepingen} from "../test-helpers/login";
import {deleteAllOfType} from "../test-helpers/sparql";
import {FormalInformalChoiceType} from "../test-helpers/formal-informal-choice.test-builder";

test.beforeEach(async ({request}) => {
    await deleteAllOfType(request, FormalInformalChoiceType);
});

test('Can get a unchosen formal informal choice of bestuurseenheid', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const formalInformalChoicePepingen = await request.get("http://localhost:91/formal-informal-choices", {headers: {cookie: cookie}});

    expect(formalInformalChoicePepingen.ok()).toBeTruthy();
    expect(await formalInformalChoicePepingen.json()).toMatchObject({
        data: []
    });
});

test('Can save chose formal informal choice of bestuurseenheid', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const response = await request.post(
        "http://localhost:91/formal-informal-choices",
        {
            headers: {cookie: cookie, 'Content-Type': 'application/vnd.api+json'},
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
        `http://localhost:91/formal-informal-choices`,
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
    let cookie = await loginAsPepingen(request);
    const response = await request.post(
        "http://localhost:91/formal-informal-choices",
        {
            headers: {cookie: cookie, 'Content-Type': 'application/vnd.api+json'},
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
    cookie = await loginAsBilzen(request);
    const formalInformalChoiceBilzen = await request.get(`http://localhost:91/formal-informal-choices`, {headers: {cookie: cookie}});
    expect(await formalInformalChoiceBilzen.json()).toMatchObject({
        data: []
    });

});

