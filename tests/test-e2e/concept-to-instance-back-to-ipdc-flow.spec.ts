import { test, expect } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from './pages/product-of-dienst-toevoegen-page';
import { first_row, second_row } from './components/table';
import { ConceptDetailsPage as ConceptDetailsPage } from './pages/concept-details-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { WijzigingenBewarenModal } from './modals/wijzigingen-bewaren-modal';
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
import { IpdcStub } from './components/ipdc-stub';

test.describe('Concept to Instance back to IPDC Flow', () => {

    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ page }) => {
        //TODO LPDC-680: can creation be moved to before all ? 
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        const uJeModal = UJeModal.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Pepingen');
        //TODO LPDC-680: expose row in table, and click it.
        await mockLoginPage.login('Gemeente Pepingen');

        await homePage.expectToBeVisible();

        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();
    });

    test('Load concept overview from ldes-stream', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row)).toBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Concept 1 edited', second_row)).toBeVisible();
    });

    test('Load concept detail', async () => {
        //TODO LPDC-680: add test to verify in detail all fields of the concept
    });

    test('Create instance from concept and edit fully and send to IPDC and verify readonly version fully', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText('Akte van Belgische nationaliteit');
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        expect(titel).toContain('Akte van Belgische nationaliteit');
        const nieuweTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(nieuweTitel);
        const titelEngels = await instantieDetailsPage.titelEngelsInput.inputValue();
        expect(titelEngels).toContain('Certificate of Belgian nationality');
        const nieuweTitelEngels = titelEngels + uuid();
        await instantieDetailsPage.titelEngelsInput.fill(nieuweTitelEngels);

        const beschrijving = await instantieDetailsPage.beschrijvingEditor.textContent();
        expect(beschrijving).toContain('De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen.');
        const newBeschrijving = beschrijving + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(newBeschrijving);
        const beschrijvingEngels = await instantieDetailsPage.beschrijvingEngelsEditor.textContent();
        expect(beschrijvingEngels).toContain('The certificate of Belgian nationality is granted to citizens who have acquired Belgian nationality through the procedure of nationality declaration or naturalisation.');
        const newBeschrijvingEngels = beschrijvingEngels + uuid();
        await instantieDetailsPage.beschrijvingEngelsEditor.fill(newBeschrijvingEngels);

        //TODO LPDC-680: aanvullendeBeschrijving from concept does not flow through to instantie ...
/*        const aanvullendeBeschrijving = await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent();
        expect(beschrijving).toContain('Akte van Belgische nationaliteit nederlands');
        const newAanvullendeBeschrijving = aanvullendeBeschrijving + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill(newAanvullendeBeschrijving);*/
        const aanvullendeBeschrijvingEngels = await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.textContent();
        expect(aanvullendeBeschrijvingEngels).toContain('The certificate states:the last name, first names, date and place of birth of the person to whom the certificate relatesthe legal foundation of the declaration on the basis of which the certificate was drawn upin the case nationality is granted on the basis of Articles 8, § 1, 2°, b), 9, 2°, b), and 11, § 2, of the Belgian Nationality Code: the last name, first names, date and place of birth of the declarant or declarants.Under certain conditions, you can request a copy of or an extract from the certificate of Belgian nationality:A copy contains the original data of the certificate and the history of the status of the person to whom the certificate relates.An extract, on the contrary, only states the current details of the certificate, without stating the history of the status of the person to whom the certificate relates. Therefore, an extract only shows the current status of the data.');
        const newAanvullendeBeschrijvingEngels = aanvullendeBeschrijvingEngels + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.fill(newAanvullendeBeschrijvingEngels);

        const uitzonderingen = await instantieDetailsPage.uitzonderingenEditor.textContent();
        expect(uitzonderingen).toContain('Uitzonderingen nl');
        const newUitzonderingen = uitzonderingen + uuid();
        await instantieDetailsPage.uitzonderingenEditor.fill(newUitzonderingen);
        const uitzonderingenEngels = await instantieDetailsPage.uitzonderingenEngelsEditor.textContent();
        expect(uitzonderingenEngels).toContain('Uitzonderingen en');
        const newUitzonderingenEngels = uitzonderingenEngels + uuid();
        await instantieDetailsPage.uitzonderingenEngelsEditor.fill(newUitzonderingenEngels);

        const titelVoorwaarde = await instantieDetailsPage.titelVoorwaardeInput.inputValue();
        expect(titelVoorwaarde).toContain('Voorwaarden nl');
        const newTitelVoorwaarde = titelVoorwaarde + uuid();
        await instantieDetailsPage.titelVoorwaardeInput.fill(newTitelVoorwaarde);
        const titelVoorwaardeEngels = await instantieDetailsPage.titelVoorwaardeEngelsInput.inputValue();
        expect(titelVoorwaardeEngels).toContain('Requirements');
        const newTitelVoorwaardeEngels = titelVoorwaardeEngels + uuid();
        await instantieDetailsPage.titelVoorwaardeEngelsInput.fill(newTitelVoorwaardeEngels);

        await instantieDetailsPage.titelKostEngelsInput.fill('Amount');
        await instantieDetailsPage.beschrijvingKostEngelsEditor.fill('The application and the certificate are free.');

        await instantieDetailsPage.eigenschappenTab.click();

        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        await instantieDetailsPage.bevoegdeOverheidMultiSelect.type('pepi');
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.option('Pepingen (Gemeente)').click();

        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.type('pepi');
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.option('Pepingen').click();

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();

        await expect(homePage.resultTable.row(first_row)).toContainText(nieuweTitel);
        await expect(homePage.resultTable.row(first_row)).toContainText('Verzonden');

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(nieuweTitel);
        expect(instancePublishedInIpdc).toBeTruthy();

        await homePage.resultTable.linkWithTextInRow('Bekijk', first_row).click();
        
        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.titelHeading).toBeVisible();

        await expect(instantieDetailsPage.titelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelInput).toHaveValue(nieuweTitel);
        await expect(instantieDetailsPage.titelEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelEngelsInput).toHaveValue(nieuweTitelEngels);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(newBeschrijving);
        await expect(instantieDetailsPage.beschrijvingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingEngelsReadonly.textContent()).toContain(newBeschrijvingEngels);

        //TODO LPDC-680: add asserts for aanvullendeBeschrijvingEditor and readonly
        await expect(instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingEngelsReadonly.textContent()).toContain(newAanvullendeBeschrijvingEngels);

        await expect(instantieDetailsPage.uitzonderingenEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenReadonly.textContent()).toContain(newUitzonderingen);
        await expect(instantieDetailsPage.uitzonderingenEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenEngelsReadonly.textContent()).toContain(newUitzonderingenEngels);

        await expect(instantieDetailsPage.titelVoorwaardeInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeInput).toHaveValue(newTitelVoorwaarde);
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput).toHaveValue(newTitelVoorwaardeEngels);
        
        await instantieDetailsPage.eigenschappenTab.click();
        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText('Pepingen (Gemeente)');
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText('Pepingen');

    });

});



