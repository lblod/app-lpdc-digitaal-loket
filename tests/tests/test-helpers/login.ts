import {expect} from "@playwright/test";
import type {APIRequestContext} from "@playwright/test"

export const pepingenId = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';
export async function loginAsPepingen(request: APIRequestContext): Promise<string> {
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
                            id: pepingenId,
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

export async function loginAsBilzen(request: APIRequestContext): Promise<string> {
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
