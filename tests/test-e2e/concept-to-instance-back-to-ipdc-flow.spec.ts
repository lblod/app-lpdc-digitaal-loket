import { test, expect } from '@playwright/test';
import { Page, request, APIRequestContext } from "@playwright/test";
import { v4 as uuid } from 'uuid';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModalPage } from './pages/u-je-modal-page';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage} from './pages/product-of-dienst-toevoegen-page';
import { first_row, second_row } from './pages/table';

test.describe('Concept to Instance back to IPDC Flow', () => {

    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;

    test.beforeEach(async ({ page }) => {

        mockLoginPage = MockLoginPage.createForLpdc(page);
        await mockLoginPage.goto();
        await mockLoginPage.searchFor('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        homePage = LpdcHomePage.create(page);
        homePage.expectToBeVisible();

        const ujeModalPage = UJeModalPage.create(page);
        await ujeModalPage.expectToBeVisible();
        await ujeModalPage.laterKiezenButton.click();
        await ujeModalPage.expectToBeClosed();

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);

    });

    test('Load concept from ldes-stream', async ({ page }) => {
        await homePage.productOfDienstToevoegenButton.click();
        
        await toevoegenPage.expectToBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row)).toBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Concept 1 edited', second_row)).toBeVisible();
    });

    test('Create instance from concept and send to IPDC', async ({ page }) => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row).click();

        await expect(page.getByRole('heading', { name: 'Concept: Akte van Belgische nationaliteit' })).toBeVisible();

        await page.getByText('Voeg toe').first().click();
        await expect(page.getByRole('heading', { name: 'Akte van Belgische nationaliteit' })).toBeVisible();

        const nieuweTitel = `Akte van Belgische nationaliteit ${uuid()}`;
        await page.locator(`input:below(label:text-is('Titel'))`).first().fill(nieuweTitel);

        await page.locator(`input:right-of(label:has-text('Titel Kost'))`).first().fill('Amount');
        await page.locator(`div.ProseMirror:right-of(label:has-text('Beschrijving kost'))`).first().fill('The application and the certificate are free.');

        await page.getByRole('link', { name: 'Eigenschappen' }).click();
        await expect(page.getByText('Wijzigingen bewaren?')).toBeVisible();

        await page.getByRole('button', { name: 'Bewaar' }).click();
        await expect(page.getByRole('heading', { name: 'Algemene info' })).toBeVisible();

        await page.locator(`input:below(label:text-is('Bevoegde overheid'))`).first().fill('pepi');
        await expect(page.getByRole('option', { name: 'Pepingen (Gemeente)' })).toBeVisible();
        await page.getByRole('option', { name: 'Pepingen (Gemeente)' }).click();

        await page.locator(`input:below(label:text-is('Geografisch toepassingsgebied'))`).first().fill('pepi');
        await expect(page.getByRole('option', { name: 'Pepingen' })).toBeVisible();
        await page.getByRole('option', { name: 'Pepingen' }).click();

        await page.getByRole('button', { name: 'Verzend naar Vlaamse overheid' }).click();

        await page.getByRole('dialog').getByRole('button', { name: 'Verzend naar Vlaamse overheid' }).click();

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

});



