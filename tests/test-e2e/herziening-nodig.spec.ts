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
import {IpdcStub} from "./components/ipdc-stub";
import {VerzendNaarVlaamseOverheidModal} from "./modals/verzend-naar-vlaamse-overheid-modal";
import {BevestigHerzieningVerwerktModal} from "./modals/bevestig-herziening-verwerkt-modal";
import {virtuosoUrl} from "../test-api/test-helpers/test-options";

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

    test.beforeEach(async ({browser}) => {
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
        let newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        // update concept snapshot
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);
        await homePage.reloadUntil(async () => {
            await isConceptProcessed(request, conceptId, updateSnapshot.id);
        });
        const updateSnapshotNoFunctionalChangeIgnored = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);
        await homePage.reloadUntil(async () => {
            await isConceptProcessed(request, conceptId, updateSnapshotNoFunctionalChangeIgnored.id);
        });

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
        let href = await instantieDetailsPage.herzieningNodigAlertConceptBekijken.getAttribute('href');
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

        //create new functional changed snapshot
        const updateSnapshotWithFunctionalChange = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        //check link concept bekijken
        href = await instantieDetailsPage.herzieningNodigAlertConceptBekijken.getAttribute('href');
        expect(href).toContain(`/nl/concept/${createSnapshot.productId}/revisie/vergelijk?revisie1=${updateSnapshot.id}&revisie2=${updateSnapshotWithFunctionalChange.id}`);
        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

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
        href = await instantieDetailsPage.conceptGearchiveerdAlertConceptBekijken.getAttribute('href');
        expect(href).toContain(`/nl/concept/${createSnapshot.productId}/revisie/vergelijk?revisie1=${updateSnapshotWithFunctionalChange.id}&revisie2=${archivedConcept.id}`);
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

    test('Geen aanpassingen nodig, updates link to latest functional concept snapshot', async ({request}) => {
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
        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        // update concept snapshot
        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(conceptId);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        // instantie moet alert 'herziening nodig' hebben
        await expect(instantieDetailsPage.herzieningNodigAlert).toBeVisible();

        // click geen aanpassingen nodig
        await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();
        await instantieDetailsPage.eigenschappenTab.click();
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        // herziening nodig label is moet verdwenen zijn
        await homePage.expectToBeVisible();
        await expect(homePage.resultTable.row(first_row).locator).toContainText(conceptId);
        await expect(homePage.resultTable.row(first_row).locator).not.toContainText('Herziening nodig');

        // instance should be linked to latest functional changed concept snapshot
        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({
            titel: `Concept created ${conceptId}`,
            expectedFormalOrInformalTripleLanguage: 'nl-be-x-formal'
        });
        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

        expect(publicService['http://mu.semte.ch/vocabularies/ext/hasVersionedSource'][0]['@id']).toEqual(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${updateSnapshot.id}`);
        expect(publicService['http://mu.semte.ch/vocabularies/ext/hasVersionedSource'][0]['@id']).not.toEqual(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${createSnapshot.id}`);

    });

    test('Confirm herziening nodig should show ConfirmBijgewerktTot modal when saving form', async ({request}) => {
        //create instance with herziening nodig label
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

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        await expect(instantieDetailsPage.herzieningNodigAlert).toBeVisible();

        // popup should show when saving
        await instantieDetailsPage.beschrijvingEditor.fill(uuid());
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click()

        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();
    });

    test('Confirm herziening nodig should show ConfirmBijgewerktTot modal when navigating away with changes', async ({request}) => {
        //create instance with herziening nodig label
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

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        await expect(instantieDetailsPage.herzieningNodigAlert).toBeVisible();

        // popup should show bij wegklikken
        await instantieDetailsPage.beschrijvingEditor.fill(uuid());
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.eigenschappenTab.click();
        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click()

        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();
    });

    test('Confirm herziening nodig should show ConfirmBijgewerktTot modal when verzend naar overheid', async ({request}) => {
        //create instance with herziening nodig label
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

        await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link('Bewerk').click();

        await expect(instantieDetailsPage.herzieningNodigAlert).toBeVisible();

        // popup should show bij verzend naar overheid
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
        await expect(instantieDetailsPage.herzieningNodigAlert).not.toBeVisible();

        await homePage.expectToBeVisible();
        await homePage.reloadUntil(async () => {
            await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
            await expect(homePage.resultTable.row(first_row).locator).not.toContainText('Herziening nodig');
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Verzonden');
        });

    });


});

async function isConceptProcessed(request: APIRequestContext, conceptId: string, snapshotId: string) {
    const query = `
    ASK WHERE {
        <https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>.
        <https://ipdc.tni-vlaanderen.be/id/concept/${conceptId}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${snapshotId}>.
    }       
    `;
    const response = await request.get(`${virtuosoUrl}/sparql`, {
        params: {
            query: query,
            format: 'application/sparql-results+json'
        }
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    expect((await response.json()).boolean).toBeTruthy();
}
