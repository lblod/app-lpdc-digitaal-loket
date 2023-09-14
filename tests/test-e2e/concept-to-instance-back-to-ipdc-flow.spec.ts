import { test, expect } from '@playwright/test';
import { Page, request, APIRequestContext } from "@playwright/test";
import { v4 as uuid } from 'uuid';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './pages/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage} from './pages/product-of-dienst-toevoegen-page';
import { first_row, second_row } from './pages/table';
import { ConceptDetailsPage as ConceptDetailsPage } from './pages/concept-details-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { WijzigingenBewarenModal } from './pages/wijzigingen-bewaren-modal';

test.describe('Concept to Instance back to IPDC Flow', () => {

    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;

    test.beforeEach(async ({ page }) => {

        mockLoginPage = MockLoginPage.createForLpdc(page);
        await mockLoginPage.goto();
        await mockLoginPage.searchFor('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        homePage = LpdcHomePage.create(page);
        homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
    });

    test('Load concept overview from ldes-stream', async ({ page }) => {
        await homePage.productOfDienstToevoegenButton.click();
        
        await toevoegenPage.expectToBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row)).toBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Concept 1 edited', second_row)).toBeVisible();
    });

    test('Load concept detail', async ({page}) => {
        //TODO LPDC-680: add test to verify in detail all fields of the concept
    });

    test('Create instance from concept and send to IPDC', async ({ page }) => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText('Akte van Belgische nationaliteit');
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        const nieuweTitel = `Akte van Belgische nationaliteit ${uuid()}`;
        await instantieDetailsPage.titelInput.fill(nieuweTitel);

        await instantieDetailsPage.titelKostEngels.fill('Amount');
        await instantieDetailsPage.beschrijvingKostEngels.fill('The application and the certificate are free.');

        await instantieDetailsPage.eigenschappenTab.click();
        
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);
        
        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        await instantieDetailsPage.bevoegdeOverheidMultiSelect.type('pepi');
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.option('Pepingen (Gemeente)').click();

        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.type('pepi');
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.option('Pepingen').click();

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



