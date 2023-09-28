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
    expect(actual).toEqual({ volledigAdres: "Ten Drossaarde 1, 3200 Aarschot" });
});

test(`validate address for invalid address`, async ({request}) => {

    const params = {municipality: 'Aarschot', street: 'Ten Drossaarde', houseNumber: '1', busNumber: '1'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({ volledigAdres: undefined });
});

test(`validate address for invalid address where letter of houseNumber in put in busNumber field`, async ({request}) => {

    const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11', busNumber: 'B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({ volledigAdres: undefined });
});

test(`validate address for invalid address where houseNumber contains '/'`, async ({request}) => {

    const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11/B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({ volledigAdres: undefined });
});

test(`validate address for address where letter of number is correctly put in houseNumber field`, async ({request}) => {

    const params = {municipality: 'Torhout', street: 'Aartrijkestraat', houseNumber: '11B'};
    const response = await request.get(`${dispatcherUrl}/lpdc-management/address/validate`, {params});

    expect(response.ok(), `Error ${response.status()}`).toBeTruthy();
    const actual = await response.json();
    expect(actual).toEqual({ volledigAdres: 'Aartrijkestraat 11B, 8820 Torhout' });
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
