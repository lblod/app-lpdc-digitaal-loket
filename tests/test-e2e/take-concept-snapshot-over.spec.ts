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
import moment from 'moment';

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
        const themasMap = {
            'BurgerOverheid': 'Burger en Overheid',
            'CultuurSportVrijeTijd': 'Cultuur, Sport en Vrije Tijd',
            'EconomieWerk': 'Economie en Werk',
            'MilieuEnergie': 'Milieu en Energie',
            'BouwenWonen': 'Bouwen en Wonen',
            'WelzijnGezondheid': 'Welzijn en Gezondheid',
        };

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

        //TODO LPDC-1171: also verify if when using the three way compare modal, we can edit the value in the input field and that value is saved in the main form, not just the 'overnemen' link

        test('given fields updated in concept snapshot can field by field update them', async () => {
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

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeEnabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            //basisinformatie
            await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['naam']['nl'], updateSnapshot['jsonlddata']['naam']['nl']);
            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot['jsonlddata']['naam']['nl']);

            await instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['beschrijving']['nl'], updateSnapshot['jsonlddata']['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['beschrijving']['nl']);

            await instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['verdereBeschrijving']['nl'], updateSnapshot['jsonlddata']['verdereBeschrijving']['nl']);
            expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['verdereBeschrijving']['nl']);

            await instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['uitzonderingen']['nl'], updateSnapshot['jsonlddata']['uitzonderingen']['nl']);
            expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toContain(updateSnapshot['jsonlddata']['uitzonderingen']['nl']);

            //TODO LPDC-1171: uncomment again
            /*
    
            //voorwaarden
            await instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl'], updateSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelVoorwaardeInput()).toHaveValue(updateSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toContain(updateSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl']);

            await instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl'], updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl']);
            await expect(instantieDetailsPage.titelBewijsstukInput()).toHaveValue(updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl']);

            await instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl'], updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toContain(updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl']);

            //procedures
            await instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['procedures'][0]['naam']['nl'], updateSnapshot['jsonlddata']['procedures'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toContain(updateSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl']);

            await instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl'], updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toContain(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl']);

            await instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url'], updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url']);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url']);

            //kosten
            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['kosten'][0]['naam']['nl'], updateSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelKostInput()).toHaveValue(updateSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toContain(updateSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            //financiele voordelen
            await instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl'], updateSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).toHaveValue(updateSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toContain(updateSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl']);

            //regelgeving
            await instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['regelgevingTekst']['nl'], updateSnapshot['jsonlddata']['regelgevingTekst']['nl']);
            expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toContain(updateSnapshot['jsonlddata']['regelgevingTekst']['nl']);

            await instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl'], updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelRegelgevendeBronInput()).toHaveValue(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toContain(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl']);

            await instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url'], updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url']);
            await expect(instantieDetailsPage.regelgevendeBronUrlInput()).toHaveValue(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url']);

            //meer info
            await instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['websites'][0]['naam']['nl'], updateSnapshot['jsonlddata']['websites'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelWebsiteInput()).toHaveValue(updateSnapshot['jsonlddata']['websites'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(createSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl'], updateSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toContain(updateSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl']);

            await instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(createSnapshot['jsonlddata']['websites'][0]['url'], updateSnapshot['jsonlddata']['websites'][0]['url']);
            await expect(instantieDetailsPage.websiteURLInput()).toHaveValue(updateSnapshot['jsonlddata']['websites'][0]['url']);
            */

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeDisabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeEnabled();

            await instantieDetailsPage.eigenschappenTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeEnabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            //TODO LPDC-1171: uncomment

            // algemene info (eigenschappen)            
           /* await instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(moment(createSnapshot['jsonlddata']['startDienstVerlening']).format('DD-MM-YYYY'), moment(updateSnapshot['jsonlddata']['startDienstVerlening']).format('DD-MM-YYYY'));
            await expect(instantieDetailsPage.productOfDienstGeldigVanafInput).toHaveValue(moment(updateSnapshot['jsonlddata']['startDienstVerlening']).format('DD-MM-YYYY'));

            await instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(moment(createSnapshot['jsonlddata']['eindeDienstVerlening']).format('DD-MM-YYYY'), moment(updateSnapshot['jsonlddata']['eindeDienstVerlening']).format('DD-MM-YYYY'));
            await expect(instantieDetailsPage.productOfDienstGeldigTotInput).toHaveValue(moment(updateSnapshot['jsonlddata']['eindeDienstVerlening']).format('DD-MM-YYYY'));

            await instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForSelect(createSnapshot['jsonlddata']['type'], updateSnapshot['jsonlddata']['type']);
            expect(await instantieDetailsPage.productTypeSelect.selectedItem.textContent()).toContain(updateSnapshot['jsonlddata']['type']);        

            await instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(createSnapshot['jsonlddata']['doelgroepen'].sort(), updateSnapshot['jsonlddata']['doelgroepen'].sort());
            await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['doelgroepen'].sort());
 
            await instantieDetailsPage.themasConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(createSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort(), updateSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort());
            await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort());
*/

            //TODO LPDC-1171: validate that the update link is visible for all the fields and update them
        });


    });

    async function verifyDataInModalAndAndTakeOverForInput(conceptWaaropInstantieIsGebaseerdInput: string, meestRecenteConceptText: string) {
        await conceptOvernemenModal.expectToBeVisible();

        await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeVisible();
        await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeDisabled();
        await expect(conceptOvernemenModal.meestRecenteConceptInput).toHaveValue(meestRecenteConceptText);

        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toBeVisible();
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toBeDisabled();
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toHaveValue(conceptWaaropInstantieIsGebaseerdInput);

        await expect(conceptOvernemenModal.instantieInput).toBeVisible();
        await expect(conceptOvernemenModal.instantieInput).toBeEditable();
        await expect(conceptOvernemenModal.instantieInput).toHaveValue(conceptWaaropInstantieIsGebaseerdInput);

        await conceptOvernemenModal.overnemenLink.click();

        await expect(conceptOvernemenModal.instantieInput).toHaveValue(meestRecenteConceptText);

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalAndAndTakeOverForRichText(conceptWaaropInstantieIsGebaseerdInput: string, meestRecenteConceptText: string) {

        await conceptOvernemenModal.expectToBeVisible();

        await expect(conceptOvernemenModal.meestRecenteConceptRichTextReadonly).toBeVisible();
        expect(await conceptOvernemenModal.meestRecenteConceptRichTextReadonly.textContent()).toContain(meestRecenteConceptText);

        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdRichTextReadonly).toBeVisible();
        expect(await conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdRichTextReadonly.textContent()).toContain(conceptWaaropInstantieIsGebaseerdInput);

        await expect(conceptOvernemenModal.instantieRichText).toBeVisible();
        expect(await conceptOvernemenModal.instantieRichText.textContent()).toContain(conceptWaaropInstantieIsGebaseerdInput);

        await conceptOvernemenModal.overnemenLink.click();

        expect(await conceptOvernemenModal.instantieRichText.textContent()).toContain(meestRecenteConceptText);

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalAndAndTakeOverForSelect(conceptWaaropInstantieIsGebaseerdValue: string, meestRecenteConceptValue: string) {
        await conceptOvernemenModal.expectToBeVisible();

        expect(await conceptOvernemenModal.meestRecenteConceptSelect.selectedItem.textContent()).toContain(meestRecenteConceptValue);
        expect(await conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdSelect.selectedItem.textContent()).toContain(conceptWaaropInstantieIsGebaseerdValue);
        expect(await conceptOvernemenModal.instantieSelect.selectedItem.textContent()).toContain(conceptWaaropInstantieIsGebaseerdValue);

        await conceptOvernemenModal.overnemenLink.click();

        expect(await conceptOvernemenModal.instantieSelect.selectedItem.textContent()).toContain(meestRecenteConceptValue);

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalAndAndTakeOverForMultiSelect(conceptWaaropInstantieIsGebaseerdValues: string[], meestRecenteConceptValues: string[]) {
        await conceptOvernemenModal.expectToBeVisible();

        await expect(conceptOvernemenModal.meestRecenteConceptMultiSelect.options()).toContainText(meestRecenteConceptValues);
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdMultiSelect.options()).toContainText(conceptWaaropInstantieIsGebaseerdValues);
        await expect(conceptOvernemenModal.instantieMultiSelect.options()).toContainText(conceptWaaropInstantieIsGebaseerdValues);

        await conceptOvernemenModal.overnemenLink.click();

        await expect(conceptOvernemenModal.instantieMultiSelect.options()).toContainText(meestRecenteConceptValues);

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

});
