import {expect, Page, test} from "@playwright/test";
import {v4 as uuid} from 'uuid';
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {first_row} from "./components/table";
import {ConceptDetailsPage} from "./pages/concept-details-page";
import {IpdcStub} from "./components/ipdc-stub";

test.describe('Concept Snapshot Updates Are Processed', () => {

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

    test('Updating concept snapshot after instance is created should set reviewStatus on instance to updated; when concept snapshot deleted, the reviewstatus on instance to archived', async ({request}) => {
        // maak instantie van concept 
        await homePage.productOfDienstToevoegenButton.click();
        
        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchConcept(createSnapshot.title);
        await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(createSnapshot.title);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        const newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        // update concept snapshot
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        // instantie moet alert 'herziening nodig' hebben
        await expect(instantieDetailsPage.herzieningNodigAlert).toBeVisible();

        //check link concept bekijken
        const href = await instantieDetailsPage.herzieningNodigAlertConceptBekijken.getAttribute('href');
        expect(href).toContain(`/nl/concept/${createSnapshot.productId}/revisie/vergelijk?revisie1=${createSnapshot.id}&revisie2=${updateSnapshot.id}`);

        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // concept moet updated tekst bevatten
        await homePage.expectToBeVisible();
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(updateSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
        });

        // archive concept
        const archivedConcept = await IpdcStub.createSnapshotOfTypeArchive(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        // instantie moet alert 'concept gearchiveerd' hebben
        await expect(instantieDetailsPage.conceptGearchiveerdAlert).toBeVisible();
        await instantieDetailsPage.conceptGearchiveerdAlertGeenAanpassigenNodig.click();
        await expect(instantieDetailsPage.conceptGearchiveerdAlert).not.toBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // gearchiveerde concepten mogen niet meer gevonden worden
        await homePage.expectToBeVisible();
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(archivedConcept.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).not.toContainText(archivedConcept.title);
        });
    });

});

