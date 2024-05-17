import {expect, Page, test} from "@playwright/test";
import {IpdcStub} from "./components/ipdc-stub";
import {first_row} from "./components/table";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {ConceptDetailsPage} from "./pages/concept-details-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {VerzendNaarVlaamseOverheidModal} from "./modals/verzend-naar-vlaamse-overheid-modal";
import {UJeModal} from "./modals/u-je-modal";
import {v4 as uuid} from "uuid";
import {ConceptOvernemenModal} from "./modals/concept-overnemen-modal";
import {BevestigHerzieningVerwerktModal} from "./modals/bevestig-herziening-verwerkt-modal";

test.describe('fully take concept snapshot over',()=> {
    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let conceptOvernemenModal: ConceptOvernemenModal
    let bevestigHerzieningVerwerktModal: BevestigHerzieningVerwerktModal
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        conceptOvernemenModal = ConceptOvernemenModal.create(page);
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

    test('given updated title and cost in concept snapshot after instance is created then fields gets overriden', async ({request}) => {
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
        let newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        // update concept snapshot
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, true);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
        await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('Het concept waarop dit product is gebaseerd, werd aangepast voor de volgende velden: basisinformatie, kosten');

        await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
        await conceptOvernemenModal.expectToBeVisible();
        await conceptOvernemenModal.wijzigingenOvernemen.click()
        await conceptOvernemenModal.expectToBeClosed()

        const titelKost = await instantieDetailsPage.titelKostInput().inputValue();
        const beschrijvingKost = await instantieDetailsPage.beschrijvingKostEditor().textContent();

        await expect(instantieDetailsPage.titelInput).toHaveValue(`Concept updated ${conceptId}`);
        expect(titelKost).toEqual('Kost');
        expect(beschrijvingKost).toEqual('Kost beschrijving');

    })

    test('given published instance when updated title and cost in concept snapshot after instance is created then is back in draft mode and modal does not show', async ({request}) => {

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
        let newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);
        await instantieDetailsPage.titelInput.blur();

        await instantieDetailsPage.eigenschappenTab.click();

        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText([]);
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        // update concept snapshot
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, true);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bekijk').click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
        await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('Het concept waarop dit product is gebaseerd, werd aangepast voor de volgende velden: basisinformatie, kosten');

        await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
        await conceptOvernemenModal.expectToBeVisible();
        await conceptOvernemenModal.wijzigingenOvernemen.click()
        await conceptOvernemenModal.expectToBeClosed()
        await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');
        await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible()
    })

})
