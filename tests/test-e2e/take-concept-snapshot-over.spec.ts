import { expect, Page, test } from "@playwright/test";
import { IpdcStub } from "./components/ipdc-stub";
import { first_row } from "./components/table";
import { MockLoginPage } from "./pages/mock-login-page";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { ConceptDetailsPage } from "./pages/concept-details-page";
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { WijzigingenBewarenModal } from "./modals/wijzigingen-bewaren-modal";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { UJeModal } from "./modals/u-je-modal";
import { v4 as uuid } from "uuid";
import { WijzigingenOvernemenModal } from "./modals/wijzigingen-overnemen-modal";
import { BevestigHerzieningVerwerktModal } from "./modals/bevestig-herziening-verwerkt-modal";
import { ConceptOvernemenModal } from "./modals/concept-overnemen-modal";

test.describe('take concept snapshot over', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let wijzigingenOvernemenModal: WijzigingenOvernemenModal;
    let bevestigHerzieningVerwerktModal: BevestigHerzieningVerwerktModal
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let conceptOvernemenModal: ConceptOvernemenModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        wijzigingenOvernemenModal = WijzigingenOvernemenModal.create(page);
        bevestigHerzieningVerwerktModal = BevestigHerzieningVerwerktModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        conceptOvernemenModal = ConceptOvernemenModal.create(page);

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

    test.describe('Fully take concept snapshot over', () => {

        test('given updated title and cost in concept snapshot after instance is created then fields gets overriden', async ({ request }) => {
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
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

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
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.conceptVolledigOvernemenButton.click()
            await wijzigingenOvernemenModal.expectToBeClosed()

            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot.title);
            expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual(`Kost - ${conceptId} - ${updateSnapshot.id}`);
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toEqual(`Kost beschrijving - ${conceptId} - ${updateSnapshot.id}`);
        })

        test('given published instance when updated title and cost in concept snapshot after instance is created then is back in draft mode and modal does not show', async ({ request }) => {

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
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

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
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.conceptVolledigOvernemenButton.click();
            await wijzigingenOvernemenModal.expectToBeClosed();
            await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible()
        });

    });

    test.describe('Take concept snapshot over field by field', () => {

        const conceptId = uuid();
        let createSnapshot;

        test.beforeEach(async ({ request }) => {
            await homePage.productOfDienstToevoegenButton.click();

            await toevoegenPage.expectToBeVisible();

            createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId, true);
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

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        });

        test('when taking over wijzigingen per veld on a verstuurde instance, first it is reopened', async () => {
            await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link('Bewerk').click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();

            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link('Bekijk').click();

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.wijzigingenPerVeldBekijkenButton.click();
            await wijzigingenOvernemenModal.expectToBeClosed();

            await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');
            await expect(instantieDetailsPage.verzendNaarVlaamseOverheidButton).toBeVisible();
            await expect(instantieDetailsPage.productOpnieuwBewerkenButton).not.toBeVisible();
        });

        test('when taking over wijzigingen per veld on an instance in ontwerp, it remains in ontwerp', async () => {
            await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link('Bewerk').click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.wijzigingenPerVeldBekijkenButton.click();
            await wijzigingenOvernemenModal.expectToBeClosed();

            await expect(instantieDetailsPage.verzendNaarVlaamseOverheidButton).toBeVisible();
            await expect(instantieDetailsPage.productOpnieuwBewerkenButton).not.toBeVisible();
        });

        test('when taking over wijzigingen per veld on an instance for which only the title and description was updated, for all other fields no wijzigingen overnemen links appear', async () => {
            await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link('Bewerk').click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');

            //TODO LPDC-1171: add asserts that the links are not visible if that specific field has not changed ...
        });

        //TODO LPDC-1171: unskip test ...
        test.skip('given fields updated in concept snapshot can field by field update them', async () => {
            // update concept snapshot
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link('Bewerk').click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();

            await conceptOvernemenModal.expectToBeVisible();
            await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeVisible();
            await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeDisabled();
            await expect(conceptOvernemenModal.conceptWaaropInstantieGebaseerdIsInput).toBeVisible();
            await expect(conceptOvernemenModal.conceptWaaropInstantieGebaseerdIsInput).toBeDisabled();
            await expect(conceptOvernemenModal.instantieInput).toBeVisible();
            await expect(conceptOvernemenModal.instantieInput).toBeEditable();
            //TODO LPDC-1171: validate that the update link is visible for the title fields (all of them.)


        });

    });


});
