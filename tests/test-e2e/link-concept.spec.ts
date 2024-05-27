import {expect, Page, request, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {UJeModal} from "./modals/u-je-modal";
import {v4 as uuid} from "uuid";
import {KoppelConceptPage} from "./pages/koppel-concept-page";
import {IpdcStub} from "./components/ipdc-stub";
import {first_row} from "./components/table";
import {ConceptDetailsPage} from "./pages/concept-details-page";

test.describe.configure({ mode: 'parallel'});
test.describe('Link concept', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let koppelConceptPage: KoppelConceptPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let conceptDetailsPage: ConceptDetailsPage;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        koppelConceptPage = KoppelConceptPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);

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

    test('link and unlink instance to concept', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        const titel = uuid();
        await instantieDetailsPage.titelInput.fill(titel);
        await instantieDetailsPage.titelInput.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await instantieDetailsPage.koppelConceptLink.click()

        await koppelConceptPage.expectToBeVisible();

        // Create concept
        const conceptId = uuid();
        await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await koppelConceptPage.reloadUntil(async () => {
            await koppelConceptPage.searchInput.fill(conceptId);
            await expect(koppelConceptPage.resultTable.row(first_row).locator).toContainText(conceptId);
        });

        // koppel concept
        await koppelConceptPage.resultTable.row(first_row).link('Koppelen').click();

        // verify concept linked
        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.gekoppeldConceptLink).toContainText("3000");
        await expect(instantieDetailsPage.conceptLoskoppelenButton).toBeVisible();

        // verify concept has 'toegevoegd' label
        await homePage.goto();
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(conceptId);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText('Toegevoegd');
        });

        // unlink concept
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(titel);
            await homePage.resultTable.row(first_row).link('Bewerk').click();
        });
        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(titel);
        await expect(instantieDetailsPage.gekoppeldConceptLink).toContainText("3000");

        // Unlink concept
        await instantieDetailsPage.conceptLoskoppelenButton.click();
        await instantieDetailsPage.instantieLoskoppelenAlert.expectToBeVisible();
        await instantieDetailsPage.instantieLoskoppelenAlertLoskoppelenButton.click();
        await instantieDetailsPage.instantieLoskoppelenAlert.expectToBeInvisible();

        //verify concept has not 'Toegevoegd' label
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await homePage.expectToBeVisible();
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(conceptId);
            await expect(toevoegenPage.resultTable.row(first_row).locator).not.toContainText('Toegevoegd');
        });
    });

    test('remove `nieuw` label on concept', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();

        // Create concept
        const conceptId = uuid();
        await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(conceptId)
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(conceptId);
        });

        await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText('Nieuw');
        await toevoegenPage.resultTable.row(first_row).link(`Concept created - ${conceptId}`).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: Concept created - ${conceptId}`);

        await conceptDetailsPage.nieuwConceptAlert.expectToBeVisible();
        await conceptDetailsPage.nieuwConceptAlertBerichtNietMeerTonenButton.click();
        await conceptDetailsPage.nieuwConceptAlert.expectToBeInvisible();

        await conceptDetailsPage.bekijkAndereConceptenButton.click();
        await toevoegenPage.expectToBeVisible();

        await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(conceptId);
        await expect(toevoegenPage.resultTable.row(first_row).locator).not.toContainText('Nieuw');
    });

});