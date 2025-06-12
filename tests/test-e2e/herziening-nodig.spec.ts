import { expect, Page, test } from "@playwright/test";
import { v4 as uuid } from 'uuid';
import { MockLoginPage } from "./pages/mock-login-page";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { WijzigingenBewarenModal } from "./modals/wijzigingen-bewaren-modal";
import { UJeModal } from "./modals/u-je-modal";
import { first_row } from "./components/table";
import { ConceptDetailsPage } from "./pages/concept-details-page";
import { IpdcStub } from "./components/ipdc-stub";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { BevestigHerzieningVerwerktModal } from "./modals/bevestig-herziening-verwerkt-modal";

test.describe.configure({ mode: 'serial' });
test.describe('Herziening nodig', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let bevestigHerzieningVerwerktModal: BevestigHerzieningVerwerktModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
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

    test('Updating concept snapshot after instance is created should set reviewStatus on instance to updated; when concept snapshot deleted, the reviewstatus on instance to archived', async ({ request, browser }) => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
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
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        const updateSnapshotNoFunctionalChangeIgnored = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await homePage.herzieningNodigCheckbox.click();
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        //check link concept bekijken
        let href = await instantieDetailsPage.herzieningNodigAlertConceptBekijken.getAttribute('href');
        expect(href).toContain(`/nl/concept/${createSnapshot.productId}/revisie/vergelijk?revisie1=${createSnapshot.uuid}&revisie2=${updateSnapshot.uuid}`);

        let target = await instantieDetailsPage.herzieningNodigAlertConceptBekijken.getAttribute('target');
        expect(target).toEqual(`blank`);

        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // concept moet updated tekst bevatten
        await homePage.expectToBeVisible();
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(updateSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
        });

        //create new functional changed snapshot
        const updateSnapshotWithFunctionalChange = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        //check link concept bekijken
        href = await instantieDetailsPage.herzieningNodigAlertConceptBekijken.getAttribute('href');
        expect(href).toContain(`/nl/concept/${createSnapshot.productId}/revisie/vergelijk?revisie1=${updateSnapshot.uuid}&revisie2=${updateSnapshotWithFunctionalChange.uuid}`);
        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // archive concept
        const archivedConcept = await IpdcStub.createSnapshotOfTypeArchive(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        // instantie moet alert 'concept gearchiveerd' hebben
        await instantieDetailsPage.conceptGearchiveerdAlert.expectToBeVisible();
        href = await instantieDetailsPage.conceptGearchiveerdAlertConceptBekijken.getAttribute('href');
        expect(href).toContain(`/nl/concept/${createSnapshot.productId}/revisie/vergelijk?revisie1=${updateSnapshotWithFunctionalChange.uuid}&revisie2=${archivedConcept.uuid}`);
        await instantieDetailsPage.conceptGearchiveerdAlertGeenAanpassigenNodig.click();
        await instantieDetailsPage.conceptGearchiveerdAlert.expectToBeInvisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // gearchiveerde concepten mogen niet meer gevonden worden
        await homePage.expectToBeVisible();
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(archivedConcept.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).not.toContainText(archivedConcept.title);
        });
    });

    test('Updating concept snapshot after instance is created should display the changed fields', async ({ request }) => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
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
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
        await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');
    });

    test('Updating cost in concept snapshot after instance is created should display cost as changed field', async ({ request }) => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
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
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
        await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

    });

    test('Geen aanpassingen nodig, updates link to latest functional concept snapshot', async ({ request }) => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
        await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // update concept snapshot
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(conceptId);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(conceptId);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        // click geen aanpassingen nodig
        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
        await instantieDetailsPage.eigenschappenTab.click();
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        // herziening nodig label is moet verdwenen zijn
        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(conceptId);
        await expect(homePage.resultTable.row(first_row).locator).toContainText(conceptId);
        await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).not.toBeVisible();
    });

    test('Confirm herziening nodig should show ConfirmBijgewerktTot modal when saving form', async ({ request }) => {
        //create instance with herziening nodig label
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
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

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        // popup should show when saving
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill(uuid());
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click()

        await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
    });

    test('Confirm herziening nodig should show ConfirmBijgewerktTot modal when navigating away with changes', async ({ request }) => {
        //create instance with herziening nodig label
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
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

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        // popup should show bij wegklikken
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill(uuid());
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.eigenschappenTab.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click()

        await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
    });

    test('Confirm herziening nodig should show ConfirmBijgewerktTot modal when verzend naar overheid', async ({ request }) => {
        //create instance with herziening nodig label
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
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

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        // popup should show bij verzend naar overheid
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill(uuid());
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.eigenschappenTab.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.nee.click();
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).not.toBeVisible();
            await expect(homePage.resultTable.row(first_row).pill('Verzonden')).toBeVisible();
        });

        await homePage.reloadUntil(async () => {
            await homePage.goto();
            await homePage.expectToBeVisible();
            await homePage.searchInput.fill(newTitel);
            await homePage.herzieningNodigCheckbox.click();
            await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');
        });

    });

    test('Updating the review status should not trigger a concurrent update warning to the user', async ({ request }) => {
        // maak instantie van concept
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchInput.fill(createSnapshot.title);
        await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(createSnapshot.title);

        let titel = await instantieDetailsPage.titelInput.inputValue();
        let newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.titelInput.click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        titel = await instantieDetailsPage.titelInput.inputValue();
        newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);
        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.titelInput.click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.nee.click();
        await bevestigHerzieningVerwerktModal.expectToBeClosed();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).pill('Herziening nodig')).toBeVisible();
        });
        await homePage.resultTable.row(first_row).link(newTitel).click();

        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        await expect(instantieDetailsPage.titelInput).toHaveValue(newTitel);
    });


});
