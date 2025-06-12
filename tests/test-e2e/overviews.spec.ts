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
import { KoppelConceptPage } from './pages/koppel-concept-page';
import { IpdcStub } from './components/ipdc-stub';
import { WijzigingenBewarenModal } from './modals/wijzigingen-bewaren-modal';

test.describe.configure({ mode: 'parallel' });
test.describe('Verifies column contents, sorting, and filtering of overview screens', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let koppelConceptPage: KoppelConceptPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        koppelConceptPage = KoppelConceptPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);

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

    test.describe.configure({ mode: 'parallel' });
    test.describe('overview instances', () => {

        test('columns and values are visible', async () => {
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');
                await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
            });

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');

            const now = new Date();

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

                await expect(homePage.resultTable.header().cell(first_column).locator).toContainText('Productnaam');
                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);
            });

            await expect(homePage.resultTable.header().cell(second_column).locator).toContainText('IPDC Concept ID');
            await expect(homePage.resultTable.row(first_row).cell(second_column)).toContainText(`1502`);

            await expect(homePage.resultTable.header().cell(third_column).locator).toContainText('Producttype');
            await expect(homePage.resultTable.row(first_row).cell(third_column)).toContainText(`Financieel voordeel`);

            await expect(homePage.resultTable.header().cell(fourth_column).locator).toContainText('Doelgroepen');
            await expect(homePage.resultTable.row(first_row).cell(fourth_column)).toContainText(`Burger Onderneming`);

            await expect(homePage.resultTable.header().cell(fifth_column).locator).toContainText(`Thema\'s`);
            await expect(homePage.resultTable.row(first_row).cell(fifth_column)).toContainText(`Burger en Overheid Cultuur, Sport en Vrije Tijd`);

            await expect(homePage.resultTable.header().cell(sixth_column).locator).toContainText(`Publicatiekanaal`);
            await expect(homePage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);

            await expect(homePage.resultTable.header().cell(seventh_column).locator).toContainText(`Laatst bewerkt`);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(now).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);

            await expect(homePage.resultTable.header().cell(eighth_column).locator).toContainText(`Status`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Ontwerp`);
        });

        test('laatst gewijzigd and status columns are sortable', async () => {
            const titelPrefix = uuid();

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();

            const creationTimeOldest = new Date();

            await instantieDetailsPage.expectToBeVisible();
            const titelOldest = titelPrefix + ' - instance voor sorteren - ' + uuid();

            await instantieDetailsPage.titelInput.fill(titelOldest);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${titelOldest} beschrijving`);
            await instantieDetailsPage.titelInput.click();
            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();

            await homePage.expectToBeVisible();

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();

            const creationTimeMostRecent = new Date();

            await instantieDetailsPage.expectToBeVisible();
            const titelMostRecent = titelPrefix + ' - instance voor sorteren - ' + uuid();

            await instantieDetailsPage.titelInput.fill(titelMostRecent);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${titelMostRecent} beschrijving`);
            await instantieDetailsPage.titelInput.click();
            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await homePage.goto();

            //first clear the screen 
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(uuid());

                await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
            });

            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(titelPrefix + ' - instance voor sorteren');

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelMostRecent);
            });

            //default sorting is most recent laatst bewerkt first
            await expect(homePage.resultTable.header().cell(seventh_column).sortDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Ontwerp`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Verzonden`);

            //remove sorting on laatst bewerkt
            await homePage.resultTable.header().cell(seventh_column).sortDownIcon.click();

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

            //sort on oldest laatst bewerkt first
            await homePage.resultTable.header().cell(seventh_column).sortUpDownIcon.click();

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Verzonden`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Ontwerp`);

            //sort on status, ontwerp -> verzonden
            await homePage.resultTable.header().cell(eighth_column).sortUpDownIcon.click();

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Ontwerp`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Verzonden`);

            //sort on status, verzonden -> ontwerp
            await homePage.resultTable.header().cell(eighth_column).sortUpIcon.click();

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortDownIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Verzonden`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Ontwerp`);

            //remove all sorting again
            await homePage.resultTable.header().cell(eighth_column).sortDownIcon.click();

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

        });

        test('Can filter on YourEurope', async () => {
            const instantieTitelMetYourEurope = 'Instantie met your europe - ' + uuid();

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();

            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(instantieTitelMetYourEurope);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${instantieTitelMetYourEurope} beschrijving`);
            await instantieDetailsPage.titelInput.click();

            await instantieDetailsPage.eigenschappenTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();
            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            await instantieDetailsPage.publicatieKanalenMultiSelect.selectValue('Your Europe');

            await instantieDetailsPage.inhoudTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();
            await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

            await homePage.reloadUntil(async () => {
                await homePage.goto();
                await homePage.searchInput.fill(instantieTitelMetYourEurope);
                await homePage.yourEuropeCheckbox.click();

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitelMetYourEurope);
            });

            const instantieTitelZonderYourEurope = 'Instantie zonder your europe - ' + uuid();
            await homePage.goto();
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();

            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(instantieTitelZonderYourEurope);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${instantieTitelZonderYourEurope} beschrijving`);
            await instantieDetailsPage.titelInput.click();

            await instantieDetailsPage.eigenschappenTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();
            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            await homePage.reloadUntil(async () => {
                await homePage.goto();
                await homePage.searchInput.fill(instantieTitelZonderYourEurope);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitelZonderYourEurope);
            });

            await homePage.yourEuropeCheckbox.click();
            await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
        });

        test('Can filter on status', async () => {
            const instantieTitel = 'Instantie om te filteren op status - ' + uuid();

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();

            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(instantieTitel);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${instantieTitel} beschrijving`);
            await instantieDetailsPage.titelInput.click();

            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();

            await homePage.expectToBeVisible();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });

            await homePage.statusMultiSelect.selectValue('Ontwerp');
            await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.statusMultiSelect.optionsDeleteButtons().nth(0).click();
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);

            await homePage.statusMultiSelect.selectValue('Verzonden', false);
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);

        });

        test('Can filter on type, doelgroepen, thema\'s', async () => {
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');
                await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
            });

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');

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

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);
            });

            await homePage.producttypeMultiSelect.selectValue('Voorwerp');
            await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.producttypeMultiSelect.optionsDeleteButtons().nth(0).click();
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);
            await homePage.producttypeMultiSelect.selectValue('Financieel Voordeel', false);
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);

            await homePage.doelgroepenMultiSelect.selectValue('Organisatie');
            await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
            await homePage.doelgroepenMultiSelect.optionsDeleteButtons().nth(0).click();
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);
            await homePage.doelgroepenMultiSelect.selectValue('Burger');
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);

            await homePage.themasMultiSelect.selectValue('Economie en Werk', false);
            await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
            await homePage.themasMultiSelect.optionsDeleteButtons().nth(0).click();
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);
            await homePage.themasMultiSelect.selectValue('Burger en Overheid', false);
            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(newTitel);

        });

        test('Can search on title, description, additional description, keyword, regulation, exceptions', async () => {
            const titel = 'Akte van Belgische nationaliteit';
            const beschrijving = 'De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen.'
            const aanvullendeBeschrijving = "Verdere beschrijving"
            const regelgeving ="Regelgeving"
            const uitzonderingen ="Uitzonderingen"
            const tags = "Akte - nl"
            
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();
            
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(titel);
                await toevoegenPage.resultTable.row(first_row).link(titel).click();
            });

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');

            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toContainText(titel);
            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(titel);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(titel);
            });
            
            await homePage.searchInput.clear();
            await homePage.searchInput.fill(beschrijving)
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titel);
           
            await homePage.searchInput.clear();
            await homePage.searchInput.fill(aanvullendeBeschrijving)
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titel);
            
            await homePage.searchInput.clear();
            await homePage.searchInput.fill(tags)
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titel);
            
            await homePage.searchInput.clear();
            await homePage.searchInput.fill(regelgeving)
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titel);
            
            await homePage.searchInput.clear();
            await homePage.searchInput.fill(uitzonderingen)
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titel);
            
        });
        
    });

    test.describe('overview concepts: toevoegen en koppelen', () => {

        const instantieTitel = 'Instance te koppelen aan concept - ' + uuid();

        test.beforeEach(async () => {
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();

            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(instantieTitel);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${instantieTitel} beschrijving`);
            await instantieDetailsPage.titelInput.click();
            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await homePage.goto();
            await homePage.expectToBeVisible();
        });

        test('columns and values are visible for product toevoegen', async () => {
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');

                await expect(toevoegenPage.resultTable.header().cell(first_column).locator).toContainText('Productnaam');
                await expect(toevoegenPage.resultTable.row(first_row).cell(first_column)).toContainText('Akte van Belgische nationaliteit - nl');
            });

            await expect(toevoegenPage.resultTable.header().cell(second_column).locator).toContainText('IPDC Concept ID');
            await expect(toevoegenPage.resultTable.row(first_row).cell(second_column)).toContainText('1502');

            await expect(toevoegenPage.resultTable.header().cell(third_column).locator).toContainText('Producttype');
            await expect(toevoegenPage.resultTable.row(first_row).cell(third_column)).toContainText('Financieel voordeel');

            await expect(toevoegenPage.resultTable.header().cell(fourth_column).locator).toContainText('Doelgroepen');
            await expect(toevoegenPage.resultTable.row(first_row).cell(fourth_column)).toContainText('Burger Onderneming');

            await expect(toevoegenPage.resultTable.header().cell(fifth_column).locator).toContainText(`Thema\'s`);
            await expect(toevoegenPage.resultTable.row(first_row).cell(fifth_column)).toContainText(`Burger en Overheid Cultuur, Sport en Vrije Tijd`);

            await expect(toevoegenPage.resultTable.header().cell(sixth_column).locator).toContainText(`Publicatiekanaal`);
            await expect(toevoegenPage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);
        });

        test('columns and values are visible for koppel concept aan instantie', async () => {

            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });

            await homePage.resultTable.row(first_row).cell(first_column).click();

            await instantieDetailsPage.koppelConceptLink.click();

            await koppelConceptPage.expectToBeVisible();

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill('Akte van Belgische nationaliteit');

                await expect(koppelConceptPage.resultTable.header().cell(first_column).locator).toContainText('Productnaam');
                await expect(koppelConceptPage.resultTable.row(first_row).cell(first_column)).toContainText('Akte van Belgische nationaliteit - nl');
            });

            await expect(koppelConceptPage.resultTable.header().cell(second_column).locator).toContainText('IPDC Concept ID');
            await expect(koppelConceptPage.resultTable.row(first_row).cell(second_column)).toContainText('1502');

            await expect(koppelConceptPage.resultTable.header().cell(third_column).locator).toContainText('Producttype');
            await expect(koppelConceptPage.resultTable.row(first_row).cell(third_column)).toContainText('Financieel voordeel');

            await expect(koppelConceptPage.resultTable.header().cell(fourth_column).locator).toContainText('Doelgroepen');
            await expect(koppelConceptPage.resultTable.row(first_row).cell(fourth_column)).toContainText('Burger Onderneming');

            await expect(koppelConceptPage.resultTable.header().cell(fifth_column).locator).toContainText(`Thema\'s`);
            await expect(koppelConceptPage.resultTable.row(first_row).cell(fifth_column)).toContainText(`Burger en Overheid Cultuur, Sport en Vrije Tijd`);

            await expect(koppelConceptPage.resultTable.header().cell(sixth_column).locator).toContainText(`Publicatiekanaal`);
            await expect(koppelConceptPage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);
        });

        test('Can filter on nieuwe producten', async () => {
            const conceptId = uuid();
            let createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId, false);

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();
            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(createSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
            await conceptDetailsPage.nieuwConceptAlertBerichtNietMeerTonenButton.click();

            await conceptDetailsPage.bekijkAndereConceptenButton.click();

            await toevoegenPage.nieuweProductenCheckbox.click();

            await expect(toevoegenPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();
            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(createSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await koppelConceptPage.nieuweProductenCheckbox.click();

            await expect(koppelConceptPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
        });

        test('Can filter on toegevoegde producten', async () => {
            const conceptId = uuid();
            let createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId, false);

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();
            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(createSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toHaveText(createSnapshot['jsonlddata']['naam']['nl-BE-x-generated-informal']);

            await homePage.goto();
            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });

            await toevoegenPage.nietToegevoegdeProductenCheckbox.click();
            await expect(toevoegenPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();
            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(createSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });

            await koppelConceptPage.nietToegevoegdeProductenCheckbox.click();
            await expect(koppelConceptPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
        });

        test('Can filter on YourEurope', async () => {
            const conceptId = uuid();
            let createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId, false);
            let updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

            const otherConceptId = uuid();
            let otherCreateSnapshot = await IpdcStub.createSnapshotOfTypeCreate(otherConceptId, false);

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(updateSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);
            });

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(otherCreateSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(otherCreateSnapshot.title);
            });

            await toevoegenPage.yourEuropeCheckbox.click();
            await expect(toevoegenPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(updateSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
            });

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(updateSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);
            });

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(otherCreateSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(otherCreateSnapshot.title);
            });

            await koppelConceptPage.yourEuropeCheckbox.click();
            await expect(koppelConceptPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(updateSnapshot.title);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
            });

        });

        test('Can filter on producttype', async () => {
            const conceptIdVoorwerp = uuid();
            let createSnapshotVoorwerp = await IpdcStub.createSnapshotOfTypeCreate(conceptIdVoorwerp, false);
            let updateSnapshotVoorwerp = await IpdcStub.createSnapshotOfTypeUpdate(conceptIdVoorwerp, false, "type.Voorwerp");

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(updateSnapshotVoorwerp.title);
                await toevoegenPage.producttypeMultiSelect.selectValue('Voorwerp');
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshotVoorwerp.title);
            });

            await toevoegenPage.producttypeMultiSelect.optionsDeleteButtons().nth(0).click();

            await toevoegenPage.producttypeMultiSelect.selectValue('Bewijs');
            await expect(toevoegenPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(updateSnapshotVoorwerp.title);
                await koppelConceptPage.producttypeMultiSelect.selectValue('Voorwerp');
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(updateSnapshotVoorwerp.title);
            });

            await koppelConceptPage.producttypeMultiSelect.optionsDeleteButtons().nth(0).click();

            await koppelConceptPage.producttypeMultiSelect.selectValue('Bewijs');
            await expect(koppelConceptPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

        });

        test('Can filter on doelgroepen', async () => {
            const conceptIdOnderneming = uuid();
            let createSnapshotOnderneming = await IpdcStub.createSnapshotOfTypeCreate(conceptIdOnderneming, false);
            let updateSnapshotOnderneming = await IpdcStub.createSnapshotOfTypeUpdate(conceptIdOnderneming, false, "doelgroepen.Onderneming");

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(updateSnapshotOnderneming.title);
                await toevoegenPage.doelgroepenMultiSelect.selectValue('Onderneming');
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshotOnderneming.title);
            });

            await toevoegenPage.doelgroepenMultiSelect.optionsDeleteButtons().nth(0).click();

            await toevoegenPage.doelgroepenMultiSelect.selectValue('Burger');
            await expect(toevoegenPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(updateSnapshotOnderneming.title);
                await koppelConceptPage.doelgroepenMultiSelect.selectValue('Onderneming');
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(updateSnapshotOnderneming.title);
            });

            await koppelConceptPage.doelgroepenMultiSelect.optionsDeleteButtons().nth(0).click();

            await koppelConceptPage.doelgroepenMultiSelect.selectValue('Burger');
            await expect(koppelConceptPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
        });

        test('Can filter on themas', async () => {
            const conceptIdEconomieEnWerk = uuid();
            let createSnapshotEconomieEnWerk = await IpdcStub.createSnapshotOfTypeCreate(conceptIdEconomieEnWerk, false);
            let updateSnapshotEconomieEnWerk = await IpdcStub.createSnapshotOfTypeUpdate(conceptIdEconomieEnWerk, false, "themas.EconomieWerk");

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(updateSnapshotEconomieEnWerk.title);
                await toevoegenPage.themasMultiSelect.selectValue('Economie en Werk', false);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshotEconomieEnWerk.title);
            });

            await toevoegenPage.themasMultiSelect.optionsDeleteButtons().nth(0).click();

            await toevoegenPage.themasMultiSelect.selectValue('Milieu en Energie', false);
            await expect(toevoegenPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(instantieTitel);

                await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(instantieTitel);
            });
            await homePage.resultTable.row(first_row).cell(first_column).click();
            await instantieDetailsPage.koppelConceptLink.click();
            await koppelConceptPage.expectToBeVisible();

            await koppelConceptPage.reloadUntil(async () => {
                await koppelConceptPage.searchInput.fill(updateSnapshotEconomieEnWerk.title);
                await koppelConceptPage.themasMultiSelect.selectValue('Economie en Werk', false);
                await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(updateSnapshotEconomieEnWerk.title);
            });

            await koppelConceptPage.themasMultiSelect.optionsDeleteButtons().nth(0).click();

            await koppelConceptPage.themasMultiSelect.selectValue('Milieu en Energie', false);
            await expect(koppelConceptPage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
        });

        test('Can search on title, description, additional description, keyword, regulation, exceptions', async () => {
            const titel = 'Akte van Belgische nationaliteit';
            const beschrijving = 'De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen.'
            const aanvullendeBeschrijving = "Verdere beschrijving"
            const regelgeving ="Regelgeving"
            const uitzonderingen ="Uitzonderingen"
            const tags = "Akte - nl"

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.searchInput.fill(titel);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(titel);

            await toevoegenPage.searchInput.clear();
            await toevoegenPage.searchInput.fill(beschrijving)
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(titel);

            await toevoegenPage.searchInput.clear();
            await toevoegenPage.searchInput.fill(aanvullendeBeschrijving)
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(titel);

            await toevoegenPage.searchInput.clear();
            await toevoegenPage.searchInput.fill(tags)
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(titel);

            await toevoegenPage.searchInput.clear();
            await toevoegenPage.searchInput.fill(regelgeving)
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(titel);

            await toevoegenPage.searchInput.clear();
            await toevoegenPage.searchInput.fill(uitzonderingen)
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(titel);

        })

    });

});
