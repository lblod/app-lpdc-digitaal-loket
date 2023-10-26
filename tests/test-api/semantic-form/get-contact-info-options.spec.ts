import {APIRequestContext, expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {PublicServiceTestBuilder} from "../test-helpers/public-service.test-builder";
import {ContactPointTestBuilder} from "../test-helpers/contact-point-test.builder";
import {bilzen, bilzenId, login, loginAsPepingen, pepingen, pepingenId, UserAccount} from "../test-helpers/login";
import {deleteAll} from "../test-helpers/sparql";

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});
test('When no instances then contact info options for Telephone should be empty', async ({request}) => {
    const result = await getContactInfoOptions(request, 'telephone');

    expect(result).toEqual([]);
})

test('When instance contact point has a telephone number return that number', async ({request}) => {
    const contactPoint = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('111111111')
        .buildAndPersist(request, pepingenId);
    await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint.getSubject())
        .buildAndPersist(request, pepingenId);

    const result = await getContactInfoOptions(request, 'telephone');

    expect(result).toEqual(['111111111']);
})

test('When multiple instances have multiple contact points, return multiple telephone numbers sorted without duplicates', async ({request}) => {
    const contactPoint1 = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('aaaaaaaaaa')
        .buildAndPersist(request, pepingenId);
    const contactPoint3 = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('cccccccccc')
        .buildAndPersist(request, pepingenId);
    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('BBBBBBBBBB')
        .buildAndPersist(request, pepingenId);
    const contactPoint4 = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('aaaaaaaaaa')
        .buildAndPersist(request, pepingenId);

    await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint1.getSubject(), contactPoint2.getSubject()])
        .buildAndPersist(request, pepingenId);

    await PublicServiceTestBuilder.aPublicService()
        .withContactPoints([contactPoint3.getSubject(), contactPoint4.getSubject()])
        .buildAndPersist(request, pepingenId);

    const result = await getContactInfoOptions(request, 'telephone');

    expect(result).toEqual(['aaaaaaaaaa', 'BBBBBBBBBB', 'cccccccccc']);
})

test('When instance contact point has an email, telephone, url and openingHours then getContactInfoOptions should return these fields', async ({request}) => {
    const contactPoint = await ContactPointTestBuilder.aContactPoint()
        .withEmail('1111@example.com')
        .withTelephone('0412341234')
        .withUrl('https://www.example.com')
        .withOpeningHours('https://www.example.com/openinghours')
        .buildAndPersist(request, pepingenId);

    await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint.getSubject())
        .buildAndPersist(request, pepingenId);

    const emails = await getContactInfoOptions(request, 'email');
    const telephoneNumbers = await getContactInfoOptions(request, 'telephone');
    const urls = await getContactInfoOptions(request, 'url');
    const openingHours = await getContactInfoOptions(request, 'openingHours');

    expect(emails).toEqual(['1111@example.com']);
    expect(telephoneNumbers).toEqual(['0412341234']);
    expect(urls).toEqual(['https://www.example.com']);
    expect(openingHours).toEqual(['https://www.example.com/openinghours']);
})

test('When request does not contain a valid field name, return an error message', async ({request}) => {
    const cookie = await loginAsPepingen(request);
    const response = await request.get(`${dispatcherUrl}/lpdc-management/contact-info-options/lastName`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toEqual(400);
    expect(response.statusText()).toEqual('Bad Request');
    const result = await response.text();
    expect(result).toEqual('Invalid request: not a valid field name');
})

test('When multiple instances of different local authorities, return only the contact info of the local authority you are logged in with', async ({request}) => {
    const contactPoint1 = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('111111111')
        .buildAndPersist(request, pepingenId);
    const contactPoint2 = await ContactPointTestBuilder.aContactPoint()
        .withTelephone('222222222')
        .buildAndPersist(request, bilzenId);

    await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint1.getSubject())
        .buildAndPersist(request, pepingenId);
    await PublicServiceTestBuilder.aPublicService()
        .withContactPoint(contactPoint2.getSubject())
        .buildAndPersist(request, bilzenId);

    const resultPepingen = await getContactInfoOptions(request, 'telephone', pepingen);
    const resultBilzen = await getContactInfoOptions(request, 'telephone', bilzen);

    expect(resultPepingen).toEqual(['111111111']);
    expect(resultBilzen).toEqual(['222222222']);
})

async function getContactInfoOptions(request: APIRequestContext, fieldName: string, userAccount: UserAccount = pepingen) {
    const cookie = await login(request, userAccount);
    const response = await request.get(`${dispatcherUrl}/lpdc-management/contact-info-options/${fieldName}`, {headers: {cookie: cookie}});
    expect(response.ok()).toBeTruthy();
    return await response.json();
}
