import { Browser, expect, Page, test } from "@playwright/test";
import { MockLoginPage } from "./pages/mock-login-page";
import { v4 as uuid } from 'uuid';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";

import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { WijzigingenBewarenModal } from "./modals/wijzigingen-bewaren-modal";
import { UJeModal } from "./modals/u-je-modal";
import { first_row } from "./components/table";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { InstantieAutomatischOmzettenVanUNaarJeModal } from "./modals/instantie-automatisch-omzetten-van-u-naar-je-modal";
import { randomGemeenteZonderFormeleInformeleKeuze } from "./shared/bestuurseenheid-config";
import {ProductOfDienstOpnieuwBewerkenModal} from "./modals/product-of-dienst-opnieuw-bewerken-modal";

test.describe.configure({ mode: 'parallel' });
test.describe('U-je conversie nodig', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let instantieAutomatischOmzettenVanUNaarJeModal: InstantieAutomatischOmzettenVanUNaarJeModal;
    let productOfDienstOpnieuwBewerkenModal: ProductOfDienstOpnieuwBewerkenModal;
    let uJeModal: UJeModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();

        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        instantieAutomatischOmzettenVanUNaarJeModal = InstantieAutomatischOmzettenVanUNaarJeModal.create(page);
        productOfDienstOpnieuwBewerkenModal = ProductOfDienstOpnieuwBewerkenModal.create(page);
        uJeModal = UJeModal.create(page)
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('view and filter on u-je conversie nodig label', async () => {
        const gemeenteNaam = randomGemeenteZonderFormeleInformeleKeuze();

        await mockLoginPage.goto();
        await loginAs(gemeenteNaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        // maak instantie
        await homePage.productOfDienstToevoegenButton.click();

        const titelInstantieWaarUJeConversieNodigIs = await createInstance('titel' + uuid());
        await expect(homePage.uJeConversieNodigCheckbox).not.toBeVisible();

        // make choice
        await homePage.logout(gemeenteNaam);
        await loginAs(gemeenteNaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(titelInstantieWaarUJeConversieNodigIs);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNodigIs);
            await expect(homePage.resultTable.row(first_row).pill('u→je')).toBeVisible();
        });

        const titelInstantieWaarUJeConversieNietNodigIs = await createInstance('titel' + uuid());

        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(titelInstantieWaarUJeConversieNietNodigIs);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNietNodigIs);
            await expect(homePage.resultTable.row(first_row).pill('u→je')).not.toBeVisible();
        });

        await homePage.searchInput.clear();
        await expect(homePage.uJeConversieNodigCheckbox).toBeVisible();
        await homePage.uJeConversieNodigCheckbox.check();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNodigIs);

        await homePage.searchInput.fill(titelInstantieWaarUJeConversieNietNodigIs);
        await expect(homePage.resultTable.row(first_row).locator).not.toBeVisible();
        await homePage.uJeConversieNodigCheckbox.uncheck();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNietNodigIs);
    });

    test('when choosing informal, then formal instances should have alerts depending status', async () => {
        const gemeentenaam = randomGemeenteZonderFormeleInformeleKeuze();

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
        await instantieDetailsPage.beschrijvingEditor.click();
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
        await instantieDetailsPage.beschrijvingEditor.click();
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
        await homePage.logout(gemeentenaam);
        await loginAs(gemeentenaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        //published instance alert
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(publishedInstanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(publishedInstanceTitle);
            await expect(homePage.resultTable.row(first_row).pill('u→je')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(publishedInstanceTitle).click();
        await instantieDetailsPage.expectToBeVisible();
        await instantieDetailsPage.reloadUntil(async () => {
            await instantieDetailsPage.omzettenNaarDeJeVormAlert.expectToBeVisible();
        });

        await instantieDetailsPage.productOpnieuwBewerkenButton.click();
        await productOfDienstOpnieuwBewerkenModal.productOpnieuwBewerkenButton.click();
        await instantieDetailsPage.draftInstanceConversionAlert.expectToBeVisible();

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await homePage.expectToBeVisible();

        //draft instance alert
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(draftInstanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(draftInstanceTitle);
            await expect(homePage.resultTable.row(first_row).pill('u→je')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(draftInstanceTitle).click();
        await instantieDetailsPage.draftInstanceConversionAlert.expectToBeVisible();

    });

    test('Confim instance is already informal', async () => {
        const gemeentenaam = randomGemeenteZonderFormeleInformeleKeuze();

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
        await instantieDetailsPage.beschrijvingEditor.click();
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
        await instantieDetailsPage.beschrijvingEditor.click();
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
        await homePage.logout(gemeentenaam);
        await loginAs(gemeentenaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        //published instance alert
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(publishedInstanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(publishedInstanceTitle);
            await expect(homePage.resultTable.row(first_row).pill('u→je')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(publishedInstanceTitle).click();
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.expectToBeVisible();
        await expect(instantieDetailsPage.uJeVersie).toContainText("u-versie");
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.button('Inhoud is al in de je-vorm').click();
        await expect(instantieDetailsPage.uJeVersie).toContainText("je-versie");
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await homePage.expectToBeVisible();
    });

    test('Convert instance to informal', async () => {
        const gemeentenaam = randomGemeenteZonderFormeleInformeleKeuze();

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

        const instantieTitel = 'titel' + uuid();
        await instantieDetailsPage.titelInput.fill(instantieTitel);

        const instantieBeschrijving = 'beschrijving' + uuid();
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill(instantieBeschrijving);
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        // make choice
        await homePage.logout(gemeentenaam);
        await loginAs(gemeentenaam);

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        //published instance alert
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(instantieTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(instantieTitel);
            await expect(homePage.resultTable.row(first_row).pill('u→je')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(instantieTitel).click();
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.expectToBeVisible();
        await expect(instantieDetailsPage.uJeVersie).toContainText("u-versie");
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.button('Omzetten naar de je-vorm').click();

        await instantieAutomatischOmzettenVanUNaarJeModal.expectToBeVisible();
        await instantieAutomatischOmzettenVanUNaarJeModal.doorgaan.click();
        
        await expect(instantieDetailsPage.titelInput).toHaveValue(instantieTitel + ' - informal');
        await expect(instantieDetailsPage.uJeVersie).toContainText("je-versie");
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.expectToBeInvisible();
        await expect(instantieDetailsPage.verzendNaarVlaamseOverheidButton).toBeVisible();
    });

    async function loginAs(gemeenteNaam: string) {
        await mockLoginPage.searchInput.fill(gemeenteNaam);
        await mockLoginPage.login(`Gemeente ${gemeenteNaam}`);

        await homePage.expectToBeVisible();
    }

    async function createInstance(titel: string) {
        await homePage.goto();
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();
        await instantieDetailsPage.expectToBeVisible();

        await instantieDetailsPage.titelInput.fill(titel);

        const beschrijving = 'beschrijving' + uuid();
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill(beschrijving);
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await homePage.goto();
        return titel;
    }
})
