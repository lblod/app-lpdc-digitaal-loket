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
import { wait } from './shared/shared';
import { KoppelConceptPage } from './pages/koppel-concept-page';
import { IpdcStub } from './components/ipdc-stub';

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

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        koppelConceptPage = KoppelConceptPage.create(page);

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
            //TODO LPDC-711: click while results are not yet processed gives an error, and an empty screen... 
            await wait(5000);

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

            //sort on oldest laatst bewerkt first
            await homePage.resultTable.header().cell(seventh_column).sortUpDownIcon.click();
            //TODO LPDC-711: click while results are not yet processed gives an error, and an empty screen... 
            await wait(5000);

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Verzonden`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Ontwerp`);

            //sort on status, verzonden -> ontwerp
            await homePage.resultTable.header().cell(eighth_column).sortUpDownIcon.click();
            //TODO LPDC-711: click while results are not yet processed gives an error, and an empty screen... 
            await wait(5000);

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortDownIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Verzonden`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Ontwerp`);

            //sort on status, verzonden -> ontwerp
            await homePage.resultTable.header().cell(eighth_column).sortDownIcon.click();
            //TODO LPDC-711: click while results are not yet processed gives an error, and an empty screen... 
            await wait(5000);

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpIcon).toBeVisible();

            await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelMostRecent);
            await expect(homePage.resultTable.row(first_row).cell(seventh_column)).toContainText(`${moment(creationTimeMostRecent).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(first_row).cell(eighth_column)).toContainText(`Ontwerp`);

            await expect(homePage.resultTable.row(second_row).cell(first_column)).toContainText(titelOldest);
            await expect(homePage.resultTable.row(second_row).cell(seventh_column)).toContainText(`${moment(creationTimeOldest).utcOffset(2).format('DD-MM-YYYY - HH:mm')}`);
            await expect(homePage.resultTable.row(second_row).cell(eighth_column)).toContainText(`Verzonden`);

            //remove all sorting again
            await homePage.resultTable.header().cell(eighth_column).sortUpIcon.click();
            //TODO LPDC-711: click while results are not yet processed gives an error, and an empty screen... 
            await wait(5000);

            await expect(homePage.resultTable.header().cell(seventh_column).sortUpDownIcon).toBeVisible();
            await expect(homePage.resultTable.header().cell(eighth_column).sortUpDownIcon).toBeVisible();

        });
    });

    test.describe('overview concepts: toevoegen en koppelen', () => {

        const instantieTitel = 'Instance te koppelen aan concept - ' + uuid();

        test.beforeEach(async() => {
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

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();

            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill(updateSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).cell(sixth_column)).toContainText(`Your Europe`);
            });

            const otherConceptId = uuid();
            let otherCreateSnapshot = await IpdcStub.createSnapshotOfTypeCreate(otherConceptId, false);
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
            
        });

        test('Can filter on producttype', async() => {
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
        });

        test('Can filter on doelgroepen', async() => {
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
        });

        test('Can filter on themas', async() => {
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
        });

    });

});