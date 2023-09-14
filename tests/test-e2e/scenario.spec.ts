import {expect, test} from "./test";
import {Page, request, APIRequestContext} from "@playwright/test";
import {v4 as uuid} from 'uuid';

test('Scenario: Load concept from ldes-stream', async ({page}) => {
    await dismissUJeModal(page);
    await navigateFromInstanceOverviewToConceptOverview(page);

    await expect(page.getByText('Akte van Belgische nationaliteit')).toBeVisible();
    await expect(page.getByText('Concept 1 edited')).toBeVisible();
});

test('Scenario: Create instance from concept', async ({page}) => {
    await dismissUJeModal(page);
    await navigateFromInstanceOverviewToConceptOverview(page);

    await page.getByRole('link', {name: 'Akte van Belgische nationaliteit'}).click();
    await expect(page.getByRole('heading', {name: 'Concept: Akte van Belgische nationaliteit'})).toBeVisible();

    await page.getByText('Voeg toe').first().click();
    await expect(page.getByRole('heading', {name: 'Akte van Belgische nationaliteit'})).toBeVisible();

    const nieuweTitel = `Akte van Belgische nationaliteit ${uuid()}`;
    await page.locator(`input:below(label:text-is('Titel'))`).first().fill(nieuweTitel);

    await page.locator(`input:right-of(label:has-text('Titel Kost'))`).first().fill('Amount');
    await page.locator(`div.ProseMirror:right-of(label:has-text('Beschrijving kost'))`).first().fill('The application and the certificate are free.');

    await page.getByRole('link', {name: 'Eigenschappen'}).click();
    await expect(page.getByText('Wijzigingen bewaren?')).toBeVisible();

    await page.getByRole('button', {name: 'Bewaar'}).click();
    await expect(page.getByRole('heading', {name: 'Algemene info'})).toBeVisible();

    await page.locator(`input:below(label:text-is('Bevoegde overheid'))`).first().fill('pepi');
    await expect(page.getByRole('option', {name: 'Pepingen (Gemeente)'})).toBeVisible();
    await page.getByRole('option', {name: 'Pepingen (Gemeente)'}).click();

    await page.locator(`input:below(label:text-is('Geografisch toepassingsgebied'))`).first().fill('pepi');
    await expect(page.getByRole('option', {name: 'Pepingen'})).toBeVisible();
    await page.getByRole('option', {name: 'Pepingen'}).click();

    await page.getByRole('button', {name: 'Verzend naar Vlaamse overheid'}).click();

    await page.getByRole('dialog').getByRole('button', {name: 'Verzend naar Vlaamse overheid'}).click();

    const firstRowOfTable = page.locator(`:nth-match(table > tbody > tr, 1)`);
    await expect(firstRowOfTable.locator(':nth-match(td, 1)')).toHaveText(nieuweTitel);
    await expect(firstRowOfTable.locator(':nth-match(td, 6)')).toHaveText('Verzonden');

    const apiRequest = await request.newContext({
        extraHTTPHeaders: {
            'Accept': 'application/ld+json',
        }
    });
    const result = await verifyInstanceCreated(apiRequest, nieuweTitel);
    expect(result).toBeTruthy();

});


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
    const maxRetries = 45;
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
            });
            if (publishedInstanceWithTitel) {
                return publishedInstanceWithTitel;
            }
        } catch (error) {
            console.log('Error retrieving instances ', error);
            throw error;
        }
        console.log(`No response from IPDC Stub yet, retrying... number of tries (${waitTurn})`);
        await delay(1000);
        if (waitTurn > maxRetries) {
            console.log(`No response form IPDC Stub after ${waitTurn} retries, stopped waiting.`);
            return undefined;
        }
    }
}

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}