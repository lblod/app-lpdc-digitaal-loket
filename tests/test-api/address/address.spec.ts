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

