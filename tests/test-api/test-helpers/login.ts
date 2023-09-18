import type {APIRequestContext} from "@playwright/test"
import {expect} from "@playwright/test";
import {dispatcherUrl} from "./test-options";

export type UserAccount = {
    accountId: string,
    groupId: string,
}

export const pepingen: UserAccount = {
    accountId: 'fd2e9e2d63a10e13f689a1c2514f9b56',
    groupId: '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589'
}

export const bilzen: UserAccount = {
    accountId: 'a69ea11278037f9106d6f23d64300de3',
    groupId: '99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f'
}

export const pepingenId = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';
export const bilzenId = "99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f";


export async function login(request: APIRequestContext, userAccount: UserAccount): Promise<string> {
    const postSessionResponse = await request.post(`${dispatcherUrl}/mock/sessions`, {
        headers: {'Content-Type': 'application/vnd.api+json'},

        data: {
            data: {
                relationships: {
                    account: {
                        data: {
                            id: userAccount.accountId,
                            type: "accounts"
                        }
                    },
                    group: {
                        data: {
                            id: userAccount.groupId,
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
export async function loginAsPepingen(request: APIRequestContext): Promise<string> {
   return login(request, pepingen);
}

export async function loginAsBilzen(request: APIRequestContext): Promise<string> {
    return login(request, bilzen);
}
