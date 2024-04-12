import {Browser, expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {v4 as uuid} from 'uuid';
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";

import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {first_row} from "./components/table";
import {VerzendNaarVlaamseOverheidModal} from "./modals/verzend-naar-vlaamse-overheid-modal";

test.describe('U-je conversie nodig', ()=>{

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal :VerzendNaarVlaamseOverheidModal;
    let uJeModal :UJeModal;
    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();

        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        uJeModal =UJeModal.create(page)

    });

    test('view and filter on u-je conversie nodig label',async ()=>{
        const gemeenteNaam = 'Diest';

        await mockLoginPage.goto();
        await loginAs(gemeenteNaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        // maak instantie
        await homePage.productOfDienstToevoegenButton.click();

        const titelInstantieWaarUJeConversieNodigIs = await createInstance('titel' + uuid());
        await expect(homePage.uJeConversieNodigFilter).not.toBeVisible();

        // make choice
        await logout(gemeenteNaam);
        await loginAs(gemeenteNaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(titelInstantieWaarUJeConversieNodigIs);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNodigIs);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('u->je');
        });

        const titelInstantieWaarUJeConversieNietNodigIs = await createInstance('titel' + uuid());

        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(titelInstantieWaarUJeConversieNietNodigIs);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNietNodigIs);
            await expect(homePage.resultTable.row(first_row).locator).not.toContainText('u->je');
        });

        await homePage.searchInput.clear();
        await expect(homePage.uJeConversieNodigFilter).toBeVisible();
        await homePage.uJeConversieNodigFilter.check();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNodigIs);

        await homePage.searchInput.fill(titelInstantieWaarUJeConversieNietNodigIs);
        await expect(homePage.resultTable.row(first_row).locator).not.toBeVisible();
        await homePage.uJeConversieNodigFilter.uncheck();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNietNodigIs);
    });

    test('when choosing informal, then formal instances should have alerts depending status',async ()=>{
        const gemeentenaam = 'Holsbeek'

        await mockLoginPage.goto();
        await loginAs(gemeentenaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        // maak instanties
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();
        await instantieDetailsPage.expectToBeVisible();

        const draftInstanceTitle = 'titel' + uuid();
        await instantieDetailsPage.titelInput.fill(draftInstanceTitle);

        const draftInstanceBeschrijving = 'beschrijving' + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(draftInstanceBeschrijving);
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();

        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();
        await instantieDetailsPage.expectToBeVisible();

        const publishedInstanceTitle = 'titel' + uuid();
        await instantieDetailsPage.titelInput.fill(publishedInstanceTitle);

        const publishedInstanceBeschrijving = 'beschrijving' + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(publishedInstanceBeschrijving);

        await instantieDetailsPage.eigenschappenTab.click();

        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();


        // make choice
        await logout(gemeentenaam);
        await loginAs(gemeentenaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        //published instance alert
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(publishedInstanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(publishedInstanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('u->je');
        });
        await homePage.resultTable.row(first_row).link('Bekijk').click();
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.expectToBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await homePage.expectToBeVisible();

        //draft instance alert
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(draftInstanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(draftInstanceTitle);
            await expect(homePage.resultTable.row

            (first_row).locator).toContainText('u->je');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();
        await instantieDetailsPage.draftInstanceConversionAlert.expectToBeVisible();

    })
    async function loginAs(gemeenteNaam: string) {
        await mockLoginPage.searchInput.fill(gemeenteNaam);
        await mockLoginPage.login(`Gemeente ${gemeenteNaam}`);

        await homePage.expectToBeVisible();
    }

    async function logout(gemeente: string) {
        await page.getByText(`Gemeente ${gemeente} - Gemeente ${gemeente}`).click();
        await page.getByText('Afmelden').click();

    }
    async function createInstance(titel: string) {
        await homePage.goto();
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();
        await instantieDetailsPage.expectToBeVisible();

        await instantieDetailsPage.titelInput.fill(titel);

        const beschrijving = 'beschrijving' + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(beschrijving);
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await homePage.goto();
        return titel;
    }
})
