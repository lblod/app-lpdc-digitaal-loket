import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {BevestigHerzieningVerwerktModal} from "./modals/bevestig-herziening-verwerkt-modal";
import {VerzendNaarVlaamseOverheidModal} from "./modals/verzend-naar-vlaamse-overheid-modal";
import {UJeModal} from "./modals/u-je-modal";
import {IpdcStub} from "./components/ipdc-stub";
import {v4 as uuid} from 'uuid';
import {first_row} from "./components/table";
import {ConceptDetailsPage} from "./pages/concept-details-page";


test.describe.configure({mode: 'serial'});
test.describe('Engelse vertaling', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let bevestigHerzieningVerwerktModal: BevestigHerzieningVerwerktModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        bevestigHerzieningVerwerktModal = BevestigHerzieningVerwerktModal.create(page);
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

    //TODO LPDC-1152: Fix e2e test
    test.skip('When instance is YourEurope shows correct buttons when published and in read only', async () => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const instanceTitle = "Akte van Belgische nationaliteit - nl"
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(instanceTitle);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(instanceTitle);
        });
        await toevoegenPage.searchConcept(instanceTitle);
        await toevoegenPage.resultTable.row(first_row).link(instanceTitle).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(instanceTitle);
        await conceptDetailsPage.voegToeButton.click();
        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(instanceTitle);

        await instantieDetailsPage.actiesMenu.open();
        await instantieDetailsPage.actiesMenu.bekijkEngelseVertalingNaPublicatieButton.isDisabled();
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click()

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();


        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(instanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(instanceTitle);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Your europe');
        });

    })
});
