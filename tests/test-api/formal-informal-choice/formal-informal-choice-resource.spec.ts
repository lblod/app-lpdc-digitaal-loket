import {expect, test} from '@playwright/test';
import {
    loginAsBilzen,
    loginAsPepingen,
    loginAsPepingenButRemoveLPDCRightsFromSession
} from "../test-helpers/login";
import {deleteAll} from "../test-helpers/sparql";
import {dispatcherUrl} from "../test-helpers/test-options";


test.beforeEach(async ({request}) => {
    await deleteAll(request);
});


test('Can get a unchosen formal informal choice of bestuurseenheid', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    const formalInformalChoicePepingen = await request.get(`${dispatcherUrl}/formal-informal-choices`,
        {
            headers:
                {
                    cookie: loginResponse.cookie,
                    'Content-Type': 'application/vnd.api+json'
                }
        });

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
                        'chosen-form': 'formal'
                    }
                },
            },
        }
    );

    const postFormalInformalChoiceResponse = await response.json();
    const id = postFormalInformalChoiceResponse.data.id;

    const formalInformalChoicePepingen = await request.get(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            }
        }
    );

    expect(formalInformalChoicePepingen.ok()).toBeTruthy();
    expect(await formalInformalChoicePepingen.json()).toMatchObject({
        data: [{
            attributes: {
                'chosen-form': 'formal',
                'date-created': expect.anything()
            },
        }]});
});

test('When trying to get formal informal choice when user is not logged in, returns http 401 Unauthenticated', async ({request}) => {
    const apiResponse = await request.get(`${dispatcherUrl}/formal-informal-choices`, {
        headers: {
            cookie: undefined,
            'Content-Type': 'application/vnd.api+json'
        }
    });

    expect(apiResponse.status()).toEqual(401);
});


test('When trying to get formal informal choice when when user has no rights on lpdc, returns http 403 Forbidden', async ({request}) => {
    const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
    const apiResponse = await request.get(`${dispatcherUrl}/formal-informal-choices`, {
        headers: {
            cookie: loginResponse.cookie,
            'Content-Type': 'application/vnd.api+json'
        }
    });

    expect(apiResponse.status()).toEqual(403);
});


test('Throws Invariant Error if no valid json-api data', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);

    const response = await request.post(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                incorrectformat: {
                    type: 'formal-informal-choices',
                    attributes: {
                        'chosen-form': 'formal'
                    }
                },
            },
        }
    );

    expect(response.status()).toEqual(400);
    expect(await response.json()).toEqual(expect.objectContaining({
        message: "chosenForm mag niet ontbreken",
        correlationId: expect.anything()
    }))

});


test('When trying to save formal informal choice when user is not logged in, returns http 401 Unauthenticated', async ({request}) => {

    const apiResponse = await request.post(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {
                cookie: undefined,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                incorrectformat: {
                    type: 'formal-informal-choices',
                    attributes: {
                        'chosen-form': 'formal'
                    }
                },
            },
        }
    );

    expect(apiResponse.status()).toEqual(401);
});


test('When trying to save formal informal choice when when user has no rights on lpdc, returns http 403 Forbidden', async ({request}) => {
    const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);

    const apiResponse = await request.post(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                incorrectformat: {
                    type: 'formal-informal-choices',
                    attributes: {
                        'chosen-form': 'formal'
                    }
                },
            },
        }
    );

    expect(apiResponse.status()).toEqual(403);
});

test('login as other bestuurseenheid should not return formal informal choice of Peppingen', async ({request}) => {
    let loginResponse = await loginAsPepingen(request);
    const response = await request.post(
        `${dispatcherUrl}/formal-informal-choices`,
        {
            headers: {
                cookie: loginResponse.cookie,
                'Content-Type': 'application/vnd.api+json'
            },
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
    const formalInformalChoiceBilzen = await request.get(`${dispatcherUrl}/formal-informal-choices`,
        {
            headers:
                {
                    cookie: loginResponse.cookie,
                    'Content-Type': 'application/vnd.api+json'
                }
        });
    expect(await formalInformalChoiceBilzen.json()).toMatchObject({
        data: []
    });

});

