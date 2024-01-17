import type {APIRequestContext} from "@playwright/test"
import {expect} from "@playwright/test";
import {dispatcherUrl} from "./test-options";
import {executeUpdate} from "./sparql";

export type UserAccount = {
    accountId: string,
    groupId: string,
}

export const pepingenId = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';
export const bilzenId = "99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f";


export const pepingen: UserAccount = {
    accountId: 'fd2e9e2d63a10e13f689a1c2514f9b56',
    groupId: pepingenId
}

export const pepingenAccountWithoutAccessToLPDC: UserAccount = {
    accountId: 'fd2e9e2d63a10e13f689a1c2514f9b56',
    groupId: pepingenId
}

export const bilzen: UserAccount = {
    accountId: 'a69ea11278037f9106d6f23d64300de3',
    groupId: bilzenId
}

export type LoginResponse = {
    sessionUuid: string,
    cookie: string,
}

export async function login(request: APIRequestContext, userAccount: UserAccount): Promise<LoginResponse> {
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
    const responseBody = await postSessionResponse.json();
    return {
        sessionUuid: responseBody.data.id,
        cookie: postSessionResponse.headers()['set-cookie']?.split(';')[0]
    };
}
export async function loginAsPepingen(request: APIRequestContext): Promise<LoginResponse> {
   return login(request, pepingen);
}

export async function loginAsPepingenButRemoveLPDCRightsFromSession(request: APIRequestContext): Promise<LoginResponse> {
    const loginResponse = await login(request, pepingen);

    const removeSessionRolesQuery = `
        DELETE {
           GRAPH <http://mu.semte.ch/graphs/sessions> {
              ?s <http://mu.semte.ch/vocabularies/ext/sessionRole> ?o.
           }
        }
        WHERE {
          GRAPH <http://mu.semte.ch/graphs/sessions> {
              ?s <http://mu.semte.ch/vocabularies/ext/sessionRole> ?o.
             ?s ?anyP "${loginResponse.sessionUuid}".
          }
        }`
    await executeUpdate(request, removeSessionRolesQuery);

    return loginResponse;
}

export async function loginAsBilzen(request: APIRequestContext): Promise<LoginResponse> {
    return login(request, bilzen);
}


