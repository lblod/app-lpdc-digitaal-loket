import {expect, test} from "./test";
import {Page, request, APIRequestContext} from "@playwright/test";
import {v4 as uuid} from 'uuid';

test('Scenario: Load concept from ldes-stream', async ({page}) => {
    await navigateToBaseUrl(page);
    await dismissUJeModal(page);
    await navigateFromInstanceOverviewToConceptOverview(page);

    await expect(page.getByText('Akte van Belgische nationaliteit')).toBeVisible();
    await expect(page.getByText('Concept 1 edited')).toBeVisible();
});

test('Scenario: Create instance from concept', async ({page}) => {
    await navigateToBaseUrl(page);
    await dismissUJeModal(page);
    await navigateFromInstanceOverviewToConceptOverview(page);

    await page.getByRole('link', { name: 'Akte van Belgische nationaliteit' }).click();
    await expect(page.getByRole('heading', {name: 'Concept: Akte van Belgische nationaliteit'})).toBeVisible();

    await page.getByText('Voeg toe').first().click();
    await expect(page.getByRole('heading', {name: 'Akte van Belgische nationaliteit'})).toBeVisible();

    const titelField = await page.getByText('Titel Verplicht', {exact: true}).getAttribute('for');
    const nieuweTitel = `Akte van Belgische nationaliteit ${uuid()}`;
    await page.locator(`#${titelField}`).fill(nieuweTitel);

    //TODO select field in another way
    await page.locator('div:nth-child(7) > div:nth-child(2) > div > .au-o-grid > .au-o-flow > div > div:nth-child(2) > input').fill('Amount');
    // await page.getByText('Engelse vertaling van de titel Verplicht').nth(4).fill('Amount');
    await page.locator('div:nth-child(7) > div:nth-child(2) > div > .au-o-grid > .au-o-flow > div > div:nth-child(4) > .rich-text-editor > .say-container > .say-container__main > .say-editor > .say-editor__paper > .ProseMirror')
        .fill('The application and the certificate are free.');

    await page.getByRole('link', {name: 'Eigenschappen'}).click();
    await expect(page.getByText('Wijzigingen bewaren?')).toBeVisible();

    await page.getByRole('button', {name: 'Bewaar'}).click();
    await expect(page.getByRole('heading', {name: 'Algemene info'})).toBeVisible();

    const bevoegdeOverheidField = await page.getByText('Bevoegde overheid Verplicht').getAttribute('for');
    await page.locator(`#${bevoegdeOverheidField} > ul > li > input`).fill('pepi');
    await expect(page.getByRole('option', {name: 'Pepingen (Gemeente)'})).toBeVisible();
    await page.getByRole('option', {name: 'Pepingen (Gemeente)'}).click();

    const geografischToepassingsgebiedField = await page.getByText('Geografisch toepassingsgebied Verplicht').getAttribute('for');
    await page.locator(`#${geografischToepassingsgebiedField} > ul > li > input`).fill('pepi');
    await expect(page.getByRole('option', {name: 'Pepingen'})).toBeVisible();
    await page.getByRole('option', {name: 'Pepingen'}).click();

    await page.getByRole('button', {name: 'Verzend naar Vlaamse overheid'}).click();

    await page.getByRole('dialog').getByRole('button', {name: 'Verzend naar Vlaamse overheid'}).click();
    await expect(page.getByRole('cell', {name: nieuweTitel})).toBeVisible();await expect(page.getByText('Verzonden').first()).toBeVisible();

    const apiRequest = await request.newContext({
        extraHTTPHeaders: {
            'Accept': 'application/ld+json',
        }
    });
    const result = await verifyInstanceCreated(apiRequest, nieuweTitel);
    expect(result).toBeTruthy();

});

async function navigateToBaseUrl(page: Page) {
    await page.goto('http://localhost:4200');
    await expect(page.getByRole('heading', {name: 'Lokale Producten- en Dienstencatalogus'})).toBeVisible();
}

async function dismissUJeModal(page: Page) {
    await expect(page.locator('.au-c-modal')).toBeVisible();
    await page.getByRole('button', {name: 'Later kiezen'}).click();
    await expect(page.locator('.au-c-modal')).not.toBeAttached();
}

async function navigateFromInstanceOverviewToConceptOverview(page: Page) {
    await page.getByRole('link', {name: 'Product of dienst toevoegen'}).click();
    await expect(page.getByRole('heading', {name: 'Product of dienst toevoegen'})).toBeVisible();
}

async function verifyInstanceCreated(apiRequest: APIRequestContext, titel: string) {
    let waitTurn = 0;
    while (true) {
        waitTurn++;
        try {
            const response = await apiRequest.get('http://localhost:33000/instanties');
            const result = await response.json();
            const publishedInstanceWithTitel = result.find((ipdcPublish) => {
                return ipdcPublish.find((element) => {
                    return element['@type'].includes('http://purl.org/vocab/cpsv#PublicService')
                        && element['http://purl.org/dc/terms/title'].some((translatedValue) =>
                            translatedValue['@language'] === 'nl-be-x-formal'
                            && translatedValue['@value'] === titel)
                })
            })
            if (publishedInstanceWithTitel) {
                console.log('Instance successfully published');
                return publishedInstanceWithTitel;
            }
        } catch (error) {
            console.log('Error retrieving instances' + error);
        }
        console.log('No response from IPDC Stub yet, retrying... number of tries: ' + waitTurn);
        await delay(1000);
        if (waitTurn > 45) {
            console.log(`No response form IPDC Stub after 45 seconds, stopped waiting (number of tries = ${waitTurn}`);
            return undefined;
        }
    }
}

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}