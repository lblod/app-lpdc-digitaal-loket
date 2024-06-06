import { expect, Page, test } from '@playwright/test';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from './pages/product-of-dienst-toevoegen-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
// @ts-ignore
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { eighth_column, fifth_column, first_column, first_row, fourth_column, second_column, second_row, seventh_column, sixth_column, third_column } from './components/table';
import { ConceptDetailsPage } from './pages/concept-details-page';

test.describe.configure({ mode: 'parallel' });
test.describe('Verifies column contents, sorting, and filtering of overview screens', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Aarschot');
        await mockLoginPage.login('Gemeente Aarschot');

        await homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        const informalNotYetChosen = await uJeModal.isVisible();
        if (informalNotYetChosen) {
            await uJeModal.expectToBeVisible();
            await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
            await uJeModal.bevestigenButton.click();
            await uJeModal.expectToBeClosed();
        }
    });

    test.afterEach(async () => {
        await page.close();
    });

    test.describe('overview instances', () => {

        test('columns and values are visible', async () => {
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchConcept('Akte van Belgische nationaliteit');
                await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
            });
    
            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');

            const today = new Date();

            await conceptDetailsPage.voegToeButton.click();
    
            await instantieDetailsPage.expectToBeVisible();
            const titel = await instantieDetailsPage.titelInput.inputValue();
            const newTitel = titel + uuid();
            await instantieDetailsPage.titelInput.fill(newTitel);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.titelInput.click();
            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(newTitel);
                
                await expect(homePage.resultTable.header().cell(first_column)).toContainText('Productnaam');
                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);

                await expect(homePage.resultTable.header().cell(second_column)).toContainText('IPDC Concept ID');
                await expect(homePage.resultTable.row(first_row).cell(second_column)).toContainText(`1502`);

                await expect(homePage.resultTable.header().cell(third_column)).toContainText('Product type');
                await expect(homePage.resultTable.row(first_row).cell(third_column)).toContainText(`Financieel voordeel`);

                await expect(homePage.resultTable.header().cell(fourth_column)).toContainText('Doelgroepen');
                await expect(homePage.resultTable.row(first_row).cell(fourth_column)).toContainText(`Burger Onderneming`);

                await expect(homePage.resultTable.header().cell(fifth_column)).toContainText(`Thema\'s`);
                await expect(homePage.resultTable.row(first_row).cell(fifth_column)).toContainText(`Burger en Overheid Cultuur, Sport en Vrije Tijd`);

                await expect(homePage.resultTable.header().cell(sixth_column)).toContainText(`Publicatiekanaal`);
                await expect(homePage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);

                await expect(homePage.resultTable.header().cell(seventh_column)).toContainText(`Laatst bewerkt`);
                await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(today).format('DD-MM-YYYY - HH:mm')}`);
                
                await expect(homePage.resultTable.header().cell(eighth_column)).toContainText(`Status`);
                await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Ontwerp`);
            });

            

    
        });
    });


});