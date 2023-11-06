import {APIRequestContext, expect, Page, test} from "@playwright/test";
import {v4 as uuid} from 'uuid';
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {first_row} from "./components/table";
import {ConceptDetailsPage} from "./pages/concept-details-page";
import {ipdcStubUrl} from "../test-api/test-helpers/test-options";
import {AbstractPage} from "./pages/abstract-page";

test.describe('Herziening nodig status', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
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

    test('Updating concept after instance is created should set reviewStatus on instance to updated', async ({request}) => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();
        
        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const conceptTitle = `Concept created ${conceptId}`;
        await createConcept(request, conceptId);
        await refreshUntil(toevoegenPage, async () => {
            await toevoegenPage.searchConcept(conceptTitle);
            const text = await toevoegenPage.resultTable.row(first_row).locator.innerText();
            return text.includes(conceptTitle);
        });
        await toevoegenPage.searchConcept(conceptTitle);
        await toevoegenPage.resultTable.row(first_row).link(conceptTitle).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${conceptTitle}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(conceptTitle);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        const newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        // update concept
        await homePage.goto();
        await updateConcept(request, conceptId);
        await refreshUntil(homePage, async () => {
            const text = await homePage.resultTable.row(first_row).locator.innerText();
            return text.includes('Herziening nodig');
        });

        // instantie moet vlagje 'herziening nodig' hebben
        await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        // instantie moet alert 'herziening nodig' hebben
        await expect(instantieDetailsPage.herzieningNodigAlert).toBeVisible();
        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // update concept
        await homePage.goto();
        await archiveConcept(request, conceptId);
        await refreshUntil(homePage, async () => {
            const text = await homePage.resultTable.row(first_row).locator.innerText();
            return text.includes('Herziening nodig');
        });

        // instantie moet vlagje 'herziening nodig' hebben
        await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        // instantie moet alert 'concept gearchiveerd' hebben
        await expect(instantieDetailsPage.conceptGearchiveerdAlert).toBeVisible();
        await instantieDetailsPage.conceptGearchiveerdAlertGeenAanpassigenNodig.click();
        await expect(instantieDetailsPage.conceptGearchiveerdAlert).not.toBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
    });

});

async function createConcept(request: APIRequestContext, uuid: string) {
    await request.post(`${ipdcStubUrl}/conceptsnapshot/${uuid}/create`);
}

async function updateConcept(request: APIRequestContext, uuid: string) {
    await request.post(`${ipdcStubUrl}/conceptsnapshot/${uuid}/update`);
}

async function archiveConcept(request: APIRequestContext, uuid: string) {
    await request.post(`${ipdcStubUrl}/conceptsnapshot/${uuid}/archive`);
}

async function refreshUntil(page: AbstractPage, assertion:  () => Promise<boolean>) {
    const maxRefreshAttempts = 5;
    for (let i = 0; i < maxRefreshAttempts; i++) {
        await delay(5000);
        await page.getPage().reload();
        await delay(500);
        const dataChanged = await assertion();
        if (dataChanged) {
            return;
        }
    }
}

function delay(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}