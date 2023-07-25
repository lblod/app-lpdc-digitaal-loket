import {test, expect} from '@playwright/test';

test.beforeEach(async ({request}) => {
    const query = `
    DELETE WHERE {
        GRAPH ?g {
            ?s a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FormalInformalChoice>.
            ?s ?rel ?o
        }
    }
    `;
    const response = await request.get('http://localhost:8891/sparql', {params: { query: query }});
    expect(response.ok()).toBeTruthy();
});

test('Can get a unchosen formal informal choice of bestuurseenheid', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const formalInformalChoicePepingen = await request.get("http://localhost:91/formal-informal-choice", {headers: {cookie: cookie}});

    expect(formalInformalChoicePepingen.ok()).toBeTruthy();
    expect(await formalInformalChoicePepingen.json()).toMatchObject({
        data: []
    });
});

test('Can save chose formal informal choice of bestuurseenheid', async ({request}) => {
    const cookie = await loginAsPepingen(request);

    const response = await request.post(
        "http://localhost:91/formal-informal-choice",
        {
            headers: {cookie: cookie, 'Content-Type': 'application/vnd.api+json'},
            data: {
                data: {
                    type: 'formal-informal-choice',
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
        `http://localhost:91/formal-informal-choice`,
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
                        related: `/formal-informal-choice/${id}/bestuurseenheid`,
                        self: `/formal-informal-choice/${id}/links/bestuurseenheid?include=bestuurseenheid`,
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
        "http://localhost:91/formal-informal-choice",
        {
            headers: {cookie: cookie, 'Content-Type': 'application/vnd.api+json'},
            data: {
                data: {
                    type: 'formal-informal-choice',
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
    const formalInformalChoiceBilzen = await request.get(`http://localhost:91/formal-informal-choice`, {headers: {cookie: cookie}});
    expect(await formalInformalChoiceBilzen.json()).toMatchObject({
        data: []
    });

});

async function loginAsPepingen(request): Promise<string> {
    const postSessionResponse = await request.post('http://localhost:91/mock/sessions', {
        headers: {'Content-Type': 'application/vnd.api+json'},

        data: {
            data: {
                relationships: {
                    account: {
                        data: {
                            id: "fd2e9e2d63a10e13f689a1c2514f9b56",
                            type: "accounts"
                        }
                    },
                    group: {
                        data: {
                            id: "73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
                            type: "groups"
                        }
                    }
                },
                type: "sessions"
            }
        }
    });
    expect(postSessionResponse.ok()).toBeTruthy();
    return postSessionResponse.headers()['set-cookie']?.split(';')[0];
}

async function loginAsBilzen(request): Promise<string> {
    const postSessionResponse = await request.post('http://localhost:91/mock/sessions', {
        headers: {'Content-Type': 'application/vnd.api+json'},

        data: {
            data: {
                relationships: {
                    account: {
                        data: {
                            id: "a69ea11278037f9106d6f23d64300de3",
                            type: "accounts"
                        }
                    },
                    group: {
                        data: {
                            id: "99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f",
                            type: "groups"
                        }
                    }
                },
                type: "sessions"
            }
        }
    });
    expect(postSessionResponse.ok()).toBeTruthy();
    return postSessionResponse.headers()['set-cookie']?.split(';')[0];
}
