import {Browser, expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import { v4 as uuid } from 'uuid';
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";

import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {first_row} from "./components/table";

test.describe('U-je conversie nodig', ()=>{

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let uJeModal :UJeModal;
    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();

        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        uJeModal =UJeModal.create(page)

        await mockLoginPage.goto();
        await loginAsDiest();

        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();
    });

    test('view and filter on u-je conversie nodig label',async ()=>{
        // maak instantie
        await homePage.productOfDienstToevoegenButton.click();
        
        const titelInstantieWaarUJeConversieNodigIs = await createInstance('titel' + uuid());

        // make choice
        await logout();
        await loginAsDiest();

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
        await homePage.uJeConversieNodigFilter.check();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNodigIs);

        await homePage.searchInput.fill(titelInstantieWaarUJeConversieNietNodigIs);
        await homePage.resultTable.row(first_row).locator.isHidden();
        await homePage.uJeConversieNodigFilter.uncheck();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(titelInstantieWaarUJeConversieNietNodigIs);
    });

    async function loginAsDiest() {
        await mockLoginPage.searchInput.fill('Diest');
        await mockLoginPage.login('Gemeente Diest');

        await homePage.expectToBeVisible();
    }

    async function logout() {
       await page.getByText('Gemeente Diest - Gemeente Diest').click();
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
