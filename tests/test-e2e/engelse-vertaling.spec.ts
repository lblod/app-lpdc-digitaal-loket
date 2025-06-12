import { expect, Page, test } from "@playwright/test";
import { MockLoginPage } from "./pages/mock-login-page";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { WijzigingenBewarenModal } from "./modals/wijzigingen-bewaren-modal";
import { BevestigHerzieningVerwerktModal } from "./modals/bevestig-herziening-verwerkt-modal";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { UJeModal } from "./modals/u-je-modal";
import { v4 as uuid } from 'uuid';
import { first_column, first_row } from "./components/table";
import { ConceptDetailsPage } from "./pages/concept-details-page";
import {ProductOfDienstOpnieuwBewerkenModal} from "./modals/product-of-dienst-opnieuw-bewerken-modal";


test.describe.configure({ mode: 'parallel' });
test.describe('Engelse vertaling', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let productOfDienstOpnieuwBewerkenModal: ProductOfDienstOpnieuwBewerkenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        productOfDienstOpnieuwBewerkenModal = ProductOfDienstOpnieuwBewerkenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);

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

    test('When instance has publication medium YourEurope shows correct action menu items buttons when published and in read only', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptTitel = "Akte van Belgische nationaliteit - nl"
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
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton).not.toBeVisible();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).toBeDisabled();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).toBeVisible();

        let instanceTitel = conceptTitel + uuid();
        await instantieDetailsPage.titelInput.fill(instanceTitel);
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.titelInput.click();

        await instantieDetailsPage.eigenschappenTab.click();

        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click()

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(instanceTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(instanceTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Your Europe');
        });

        await homePage.resultTable.row(first_row).cell(first_column).click();

        await instantieDetailsPage.actiesMenu.locator.click();        
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton).toBeVisible();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton).toBeEnabled();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).not.toBeVisible();

        const instanceUuid = page.url().replace('/inhoud', '').replace('http://localhost:4200/', '');

        let href = await instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton.getAttribute('href');
        expect(href).toContain(`en/instantie/${instanceUuid}`);

        let target = await instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton.getAttribute('target');
        expect(target).toEqual(`blank`);

        await instantieDetailsPage.productOpnieuwBewerkenButton.click();
        await productOfDienstOpnieuwBewerkenModal.productOpnieuwBewerkenButton.click();
        await instantieDetailsPage.actiesMenu.locator.click();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).toBeVisible();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).toBeDisabled();
    });

    test('When instance does not have publication medium YourEurope does not show correct action menu items buttons when published and in read only', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await instantieDetailsPage.actiesMenu.locator.click();        
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton).not.toBeVisible();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).not.toBeVisible();

        let instanceTitel = 'Instance without YourEurope' + uuid();
        await instantieDetailsPage.titelInput.fill(instanceTitel);
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill(`${instanceTitel} - beschrijving`);
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.click();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill(`${instanceTitel} - aanvullende beschrijving`);
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.blur();
        await instantieDetailsPage.uitzonderingenEditor.click();
        await instantieDetailsPage.uitzonderingenEditor.fill(`${instanceTitel} - uitzonderingen`);
        await instantieDetailsPage.uitzonderingenEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();
        
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(instanceTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(instanceTitel);
        });

        await homePage.resultTable.row(first_row).cell(first_column).click();
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(instanceTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(instanceTitel);
        });

        await homePage.resultTable.row(first_row).cell(first_column).click();

        await instantieDetailsPage.actiesMenu.locator.click();        
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingButton).not.toBeVisible();
        await expect(instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton).not.toBeVisible();
    });

});
