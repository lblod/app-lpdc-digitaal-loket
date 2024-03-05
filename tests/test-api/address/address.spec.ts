import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession} from "../test-helpers/login";

test.describe('municipalities', () => {

    test(`find municipality for string 'be'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: 'be'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params
        });

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual(['Beernem', 'Beerse', 'Beersel', 'Begijnendijk', 'Bekkevoort']);
    });

    test(`find municipality for string 'Aarschot'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: 'Aarschot'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual(['Aarschot']);
    });

    test(`find municipality for string 'qsdccgyuj'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: 'qsdccgyuj'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual([]);
    });

    test(`find main municipality for sub municipality 'wilsele'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: 'wilsele'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual(['Leuven']);
    });

    test(`find municipality for postcode '3000'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: '3000'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual(['Leuven']);
    });

    test(`find municipality for postcode '3001'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: '3001'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual(['Leuven']);
    });

    test(`find municipality returns http 401 when user not logged in`, async ({request}) => {
        const params = {search: '3001'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: undefined},
            params});

        expect(await response.json()).toEqual(expect.objectContaining({
            _status:401,
            _message:"Not authenticated for this request",
            _level: "WARN",
            _correlationId: expect.anything()
        }))    });

    test(`find municipality returns http 403 when user has no rights`, async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const params = {search: '3001'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(await response.json()).toEqual(expect.objectContaining({
            _status:403,
            _message:"Je hebt niet voldoende rechten om deze actie uit te voeren",
            _level: "WARN",
            _correlationId: expect.anything()
        }))
    });

});

test.describe('streets', () => {

    test(`find street for municipality 'Aarschot' and search 'kerk'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Aarschot', search: 'kerk'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual(['Kerkstraat', 'Kerkvoetweg', 'Kerkweg']);
    });

    test(`find street for municipality 'Aarschot' and search 'ke'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Aarschot', search: 'ke'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual([]);
    });

    test(`find street for municipality 'Aarschot' and search 'unknown street'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Aarschot', search: 'unknown street'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual([]);
    });

    test(`find street for no municipality`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {search: 'unknown street'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual([]);
    });

    test(`find street for unknown municipality`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'unknown municipality', search: 'Kerkstraat'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual([]);
    });

    test(`find street returns http 401 when user not logged in`, async ({request}) => {
        const params = {municipality: 'Aarschot', search: 'kerk'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets`, {
            headers: {cookie: undefined},
            params});

        expect(response.status()).toEqual(401);
    });

    test(`find street returns http 403 when user has no rights`, async ({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const params = {municipality: 'Aarschot', search: 'kerk'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.status()).toEqual(403);
    });


});

test.describe('validate', () => {

    test(`validate address for correct address`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Aarschot', street: 'Ten Drossaarde', houseNumber: '1'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Aarschot',
            postcode: '3200',
            straat: 'Ten Drossaarde',
            huisnummer: '1',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/2648372'
        });
    });

    test(`validate address for address where letter of number is correctly put in houseNumber field`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11B'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Torhout',
            postcode: '8820',
            straat: 'Aartrijkestraat',
            huisnummer: '11B',
            busnummer: undefined,
            adressenRegisterId: "https://data.vlaanderen.be/id/adres/3654524"
        });
    });

    test(`validate address for address with bus number`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Harelbeke', street: 'Generaal Deprezstraat', houseNumber: '2', busNumber: '50'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Harelbeke',
            postcode: '8530',
            straat: 'Generaal Deprezstraat',
            huisnummer: '2',
            busnummer: '0050',
            adressenRegisterId: "https://data.vlaanderen.be/id/adres/5516749"
        });
    });

    test(`validate address for address range`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Kruibeke', street: 'O.L. Vrouwplein', houseNumber: '18-20'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Kruibeke',
            postcode: '9150',
            straat: 'O.L.Vrouwplein',
            huisnummer: '18',
            busnummer: undefined,
            adressenRegisterId: "https://data.vlaanderen.be/id/adres/548604",
        });
    });

    test(`validate address for address in sub-municipality`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Leuven', street: 'Eenmeilaan', houseNumber: 2 };
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params
        });

        expect(response.ok()).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Leuven',
            postcode: '3010',
            straat: 'Eénmeilaan',
            huisnummer: '2',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/2272154'});
    });

    test(`validate address for invalid address`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Aarschot', street: 'Ten Drossaarde', houseNumber: '1', busNumber: '1'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({});
    });

    test(`validate address for invalid address where letter of houseNumber in put in busNumber field`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11', busNumber: 'B'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({});
    });

    test(`validate address for invalid address where houseNumber contains '/'`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11/B'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({});
    });

    test(`validate address throws error when municipality is missing`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {street: 'Aartrijkestraat', houseNumber: '11B'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok()).toBeFalsy();
        expect(await response.json()).toEqual(expect.objectContaining({
            _status:400,
            _message:"municipality, street and houseNumber are required",
            _level: "WARN",
            _correlationId: expect.anything()
        }))
    });

    test(`validate address throws error when street is missing`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Torhout', houseNumber: '11B'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok()).toBeFalsy();
        expect(await response.json()).toEqual(expect.objectContaining({
            _status:400,
            _message:"municipality, street and houseNumber are required",
            _level: "WARN",
            _correlationId: expect.anything()
        }))
    });

    test(`validate address throws error when houseNumber is missing`, async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Torhout', street: 'Aartrijkestraat'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});

        expect(response.ok()).toBeFalsy();
        expect(await response.json()).toEqual(expect.objectContaining({
            _status:400,
            _message:"municipality, street and houseNumber are required",
            _level: "WARN",
            _correlationId: expect.anything()
        }))
    });

    test('validate address returns http 401 when user not logged in', async({request}) => {
        const params = {municipality: 'Aarschot', street: 'Ten Drossaarde', houseNumber: '1'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: undefined},
            params});
        expect(await response.json()).toEqual(expect.objectContaining({
            _status:401,
            _message:"Not authenticated for this request",
            _level: "WARN",
            _correlationId: expect.anything()
        }))
    });

    test('validate address returns http 403 when user has no access rights', async({request}) => {
        const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
        const params = {municipality: 'Aarschot', street: 'Ten Drossaarde', houseNumber: '1'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {
            headers: {cookie: loginResponse.cookie},
            params});
        expect(await response.json()).toEqual(expect.objectContaining({
            _status:403,
            _message:"Je hebt niet voldoende rechten om deze actie uit te voeren",
            _level: "WARN",
            _correlationId: expect.anything()
        }))    });

    test('normal address: diestevest 32, Leuven', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Leuven', street: 'Diestsestraat', houseNumber: '32'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Leuven',
            postcode: '3000',
            straat: 'Diestsestraat',
            huisnummer: '32',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/1574017'
        });

    });

    test('sub municipalities: Kerkstraat 12, Leuven (in 3010 Kessel-lo)', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Leuven', street: 'Kerkstraat', houseNumber: '12'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Leuven',
            postcode: '3010',
            straat: 'Kerkstraat',
            huisnummer: '12',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/1365372'
        });

    });

    test('sub municipalities: Baalsebaan 289, Tremelo (in in 3128 Baal)', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Tremelo', street: 'Baalsebaan', houseNumber: '289'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Tremelo',
            postcode: '3128',
            straat: 'Baalsebaan',
            huisnummer: '289',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/2526417'
        });

    });

    test('a letter in the house number: Aartrijkestraat 11B, Torhout', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11B'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Torhout',
            postcode: '8820',
            straat: 'Aartrijkestraat',
            huisnummer: '11B',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/3654524'
        });

    });

    test('address with box number: Sint-Katarinaplein 15 bus 28, Hasselt', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Hasselt', street: 'Sint-Katarinaplein', houseNumber: '15', busNumber: '28'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Hasselt',
            postcode: '3500',
            straat: 'Sint-Katarinaplein',
            huisnummer: '15',
            busnummer: '28',
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/5383221'
        });

    });

    test('address with box number: Baalsebaan 1 bus 001, Tremelo', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Tremelo', street: 'Baalsebaan', houseNumber: '1', busNumber: '1'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Tremelo',
            postcode: '3120',
            straat: 'Baalsebaan',
            huisnummer: '1',
            busnummer: '001',
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/30277902'
        });

    });

    test('antwerp districts match in 2 sub municipalities: Beekstraat 1', async ({request}) => {
        const loginResponse = await loginAsPepingen(request);
        const params = {municipality: 'Antwerpen', street: 'Beekstraat', houseNumber: '1'};
        const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

        expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
        const actual = await response.json();
        expect(actual).toEqual({
            gemeente: 'Antwerpen',
            postcode: '2140', //Borgerhout because it has lower postcode then Ekeren
            straat: 'Beekstraat',
            huisnummer: '1',
            busnummer: undefined,
            adressenRegisterId: 'https://data.vlaanderen.be/id/adres/2514020'
        });
    });

});

