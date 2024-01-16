import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {UJeModal} from "./modals/u-je-modal";
// @ts-ignore
import moment from 'moment';

test.describe('Create a new instance not based on a concept', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        await homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.expectToBeVisible();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('create a new instance and verify prefilled fields', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        const today = new Date();
        let formattedToday = moment(today).format('DD-MM-YYYY');
    
        await expect(instantieDetailsPage.koppelConceptLink).toBeVisible();
        await expect(instantieDetailsPage.aangemaaktOpHeader).toContainText(formattedToday);
        await expect(instantieDetailsPage.bewerktOpHeader).toContainText(formattedToday);
        await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');

        await instantieDetailsPage.eigenschappenTab.click();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(['Pepingen (Gemeente)']);
        await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText(['Pepingen (Gemeente)']);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Pepingen']);


    });


});