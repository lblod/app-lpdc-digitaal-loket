import {expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";

test(`find municipality for string 'be'`, async ({request}) => {

    const params = {search: 'be'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual(['Beernem', 'Beerse', 'Beersel', 'Begijnendijk', 'Bekkevoort']);
});

test(`find municipality for string 'Aarschot'`, async ({request}) => {

    const params = {search: 'Aarschot'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual(['Aarschot']);
});

test(`find municipality for string 'qsdccgyuj'`, async ({request}) => {

    const params = {search: 'qsdccgyuj'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual([]);
});

test(`find main municipality for sub municipality 'wilsele'`, async ({request}) => {

    const params = {search: 'wilsele'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual(['Leuven']);
});

test(`find municipality for postcode '3000'`, async ({request}) => {

    const params = {search: '3000'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual(['Leuven']);
});

test(`find municipality for postcode '3001'`, async ({request}) => {

    const params = {search: '3001'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/municipalities`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual(['Leuven']);
});

test(`find street for municipality 'Aarschot' and search 'kerk'`, async ({request}) => {

    const params = {municipality: 'Aarschot', search: 'kerk'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual(['Kerkstraat', 'Kerkvoetweg', 'Kerkweg']);
});

test(`find street for municipality 'Aarschot' and search 'ke'`, async ({request}) => {

    const params = {municipality: 'Aarschot', search: 'ke'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual([]);
});

test(`find street for municipality 'Aarschot' and search 'unknown street'`, async ({request}) => {

    const params = {municipality: 'Aarschot', search: 'unknown street'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual([]);
});

test(`find street for no municipality`, async ({request}) => {

    const params = {search: 'unknown street'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual([]);
});

test(`find street for unknown municipality`, async ({request}) => {

    const params = {municipality: 'unknown municipality', search: 'Kerkstraat'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/streets/`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual([]);
});

test(`validate address for correct address`, async ({request}) => {

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
        adressenRegisterId: "https://data.vlaanderen.be/id/adres/3654524"
    });
});

test(`validate address for address with bus number`, async ({request}) => {

    const params = {municipality: 'Harelbeke', street: 'Generaal Deprezstraat', houseNumber: '2', busNumber: '50'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

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

    const params = {municipality: 'Kruibeke', street: 'O.L. Vrouwplein', houseNumber: '18-20'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

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

test(`validate address for invalid address`, async ({request}) => {

    const params = {municipality: 'Aarschot', street: 'Ten Drossaarde', houseNumber: '1', busNumber: '1'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({});
});

test(`validate address for invalid address where letter of houseNumber in put in busNumber field`, async ({request}) => {

    const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11', busNumber: 'B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({});
});

test(`validate address for invalid address where houseNumber contains '/'`, async ({request}) => {

    const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11/B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({});
});

test(`validate address throws error when municipality is missing`, async ({request}) => {

    const params = {street: 'Aartrijkestraat', houseNumber: '11B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok()).toBeFalsy();
    const actual = await response.json();
    expect(actual).toEqual({message: 'Invalid request: municipality, street and houseNumber are required'});
});

test(`validate address throws error when street is missing`, async ({request}) => {

    const params = {municipality: 'Torhout', houseNumber: '11B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok()).toBeFalsy();
    const actual = await response.json();
    expect(actual).toEqual({message: 'Invalid request: municipality, street and houseNumber are required'});
});

test(`validate address throws error when houseNumber is missing`, async ({request}) => {

    const params = {municipality: 'Torhout', street: 'Aartrijkestraat'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok()).toBeFalsy();
    const actual = await response.json();
    expect(actual).toEqual({message: 'Invalid request: municipality, street and houseNumber are required'});
});
