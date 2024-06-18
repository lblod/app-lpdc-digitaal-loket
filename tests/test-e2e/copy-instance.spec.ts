import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {first_row} from "./components/table";
import {ConceptDetailsPage} from "./pages/concept-details-page";
import {BevestigKopierenModal} from "./modals/bevestig-kopieren-modal";


test.describe.configure({ mode: "parallel" });
test.describe('Copy instance', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let bevestigKopierenModal: BevestigKopierenModal;

    test.beforeEach(async ({ browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        bevestigKopierenModal = BevestigKopierenModal.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        await homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('copy instance niet bestemd voor fusie', async () => {
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        const conceptTitel = "Akte van Belgische nationaliteit - nl";
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(conceptTitel);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(conceptTitel);
        });
        await toevoegenPage.resultTable.row(first_row).link(conceptTitel).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${conceptTitel}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(conceptTitel);

        await instantieDetailsPage.actiesMenu.locator.click();
        await instantieDetailsPage.actiesMenu.productKopierenButton.click();
        await bevestigKopierenModal.expectToBeVisible();
        await bevestigKopierenModal.annuleer.click();

        await instantieDetailsPage.actiesMenu.locator.click();
        await instantieDetailsPage.actiesMenu.productKopierenButton.click();
        await bevestigKopierenModal.expectToBeVisible();
        await bevestigKopierenModal.neeEnkelKopieren.click();

        await expect(instantieDetailsPage.heading).toHaveText(`Kopie van ${conceptTitel}`);
        await instantieDetailsPage.eigenschappenTab.click();
        await expect(instantieDetailsPage.bestemdVoorFusieGemeenteSwitch).not.toBeChecked();
    });

    test('copy instance bestemd voor fusie', async () => {
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        const conceptTitel = "Akte van Belgische nationaliteit - nl";
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(conceptTitel);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(conceptTitel);
        });
        await toevoegenPage.resultTable.row(first_row).link(conceptTitel).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${conceptTitel}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(conceptTitel);

        await instantieDetailsPage.actiesMenu.locator.click();
        await instantieDetailsPage.actiesMenu.productKopierenButton.click();
        await bevestigKopierenModal.expectToBeVisible();
        await bevestigKopierenModal.jaBestemdVoorFusie.click();

        await expect(instantieDetailsPage.heading).toHaveText(`Kopie van ${conceptTitel}`);
        await instantieDetailsPage.eigenschappenTab.click();
        await expect(instantieDetailsPage.bestemdVoorFusieGemeenteSwitch).toBeChecked();
    });


});