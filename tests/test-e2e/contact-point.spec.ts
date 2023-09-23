import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {UJeModal} from "./modals/u-je-modal";
import {v4 as uuid} from 'uuid';
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";

test.describe('Contact point form fields', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal : WijzigingenBewarenModal;

    test.beforeEach(async ({browser}) => {
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

    test('Contact point info fields should show list items from existing instances', async () => {

        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await instantieDetailsPage.voegContactpuntToeButton.click();
        const email = `${uuid()}@example.com`
        await instantieDetailsPage.contactpuntEmailSelect.insertNewValue(email);
        const telefoon = '0499123123';
        await instantieDetailsPage.contactpuntTelefoonSelect.insertNewValue(telefoon);
        const websiteUrl = `https://${uuid()}.be`;
        await instantieDetailsPage.contactpuntWebsiteURLSelect.insertNewValue(websiteUrl);
        const openingsuren = `https://${uuid()}.be`;
        await instantieDetailsPage.contactpuntOpeningsurenSelect.insertNewValue(openingsuren);

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.voegContactpuntToeButton.click();

        expect(await instantieDetailsPage.contactpuntEmailSelect.searchValue(email)).toEqual(email);
        expect(await instantieDetailsPage.contactpuntTelefoonSelect.searchValue(telefoon)).toEqual(telefoon);
        expect(await instantieDetailsPage.contactpuntWebsiteURLSelect.searchValue(websiteUrl)).toEqual(websiteUrl);
        expect(await instantieDetailsPage.contactpuntOpeningsurenSelect.searchValue(openingsuren)).toEqual(openingsuren);
    });

});
