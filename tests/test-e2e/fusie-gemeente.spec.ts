import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {v4 as uuid} from "uuid";
import {first_column, first_row} from "./components/table";


test.describe.configure({mode: 'parallel'});
test.describe('Bestemd voor fusie gemeente', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;

    test.beforeEach(async ({ browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);

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

    test('Show and filter on fusie pill in overview', async () => {
        // create instance bestemd voor fusie
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();
        const titelBestemdVoorFusie = `title ${uuid()}`;
        await instantieDetailsPage.titelInput.fill(titelBestemdVoorFusie);
        await instantieDetailsPage.titelInput.blur();

        await instantieDetailsPage.eigenschappenTab.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();
        await instantieDetailsPage.bestemdVoorFusieGemeenteSwitch.check();

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        // create instance not bestemd voor fusie
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();
        const titelNietBestemdVoorFusie = `title ${uuid()}`;
        await instantieDetailsPage.titelInput.fill(titelNietBestemdVoorFusie);
        await instantieDetailsPage.titelInput.blur();

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await homePage.searchInput.fill(titelBestemdVoorFusie);
        await expect(homePage.resultTable.row(first_row).cell(first_column)).toContainText(titelBestemdVoorFusie);
        await expect(homePage.resultTable.row(first_row).pill('fusie')).toBeVisible();
        await homePage.wisFiltersButton.click();
        await homePage.goto();

        await expect(homePage.bestemdVoorFusieCheckbox).toBeVisible();

        await expect(homePage.resultTable.row(first_row).pill('fusie')).not.toBeVisible();
        await homePage.bestemdVoorFusieCheckbox.check();
        await expect(homePage.resultTable.row(first_row).pill('fusie')).toBeVisible();

    });


});