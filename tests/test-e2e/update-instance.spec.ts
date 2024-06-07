import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {UJeModal} from "./modals/u-je-modal";
import {v4 as uuid} from 'uuid';

test.describe.configure({ mode: 'parallel'});
test.describe('Update an instance and verify edits are working', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        await homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.expectToBeVisible();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Update a new instance and do consecutive edits on all simple fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        
        await instantieDetailsPage.titelInput.fill('een nieuwe titel');
        await instantieDetailsPage.titelInput.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelInput.inputValue()).toEqual('een nieuwe titel');

        await instantieDetailsPage.titelInput.fill('');
        await instantieDetailsPage.titelInput.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelInput.inputValue()).toEqual('');

        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill('een nieuwe beschrijving');
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toEqual('een nieuwe beschrijving');

        await instantieDetailsPage.beschrijvingEditor.click();
        await instantieDetailsPage.beschrijvingEditor.fill('');
        await instantieDetailsPage.beschrijvingEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toEqual('');
        
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.click();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill('een nieuwe aanvullende beschrijving');
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toEqual('een nieuwe aanvullende beschrijving');
        
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.click();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill('');
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toEqual('');
        
        await instantieDetailsPage.uitzonderingenEditor.click();
        await instantieDetailsPage.uitzonderingenEditor.fill('een nieuwe uitzondering');
        await instantieDetailsPage.uitzonderingenEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toEqual('een nieuwe uitzondering');

        await instantieDetailsPage.uitzonderingenEditor.click();
        await instantieDetailsPage.uitzonderingenEditor.fill('');
        await instantieDetailsPage.uitzonderingenEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toEqual('');

        await instantieDetailsPage.beschrijvingRegelgevingEditor().fill('een nieuwe uitzondering');
        await instantieDetailsPage.beschrijvingRegelgevingEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toEqual('een nieuwe uitzondering');

        await instantieDetailsPage.beschrijvingRegelgevingEditor().fill('');
        await instantieDetailsPage.beschrijvingRegelgevingEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toEqual('');

    });

    test('Update a new instance and do consecutive edits on conditions fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegVoorwaardeToeButton.click();

        await instantieDetailsPage.titelVoorwaardeInput().fill('een nieuwe titel voor voorwaarde');
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().click();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill('een nieuwe beschrijving voor voorwaarde');
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('een nieuwe titel voor voorwaarde');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('een nieuwe beschrijving voor voorwaarde');

        await instantieDetailsPage.titelVoorwaardeInput().fill('');
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().click();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill('');
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderVoorwaardeButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderVoorwaardeButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor()).not.toBeVisible();

        await instantieDetailsPage.voegVoorwaardeToeButton.click();
        await instantieDetailsPage.voegBewijsstukToeButton().click();

        await instantieDetailsPage.titelBewijsstukInput().fill('een nieuwe titel bewijsstuk');
        await instantieDetailsPage.beschrijvingBewijsstukEditor().click();
        await instantieDetailsPage.beschrijvingBewijsstukEditor().fill('een nieuwe beschrijving bewijsstuk');
        await instantieDetailsPage.beschrijvingBewijsstukEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');

        expect(await instantieDetailsPage.titelBewijsstukInput().inputValue()).toEqual('een nieuwe titel bewijsstuk');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toEqual('een nieuwe beschrijving bewijsstuk');

        await instantieDetailsPage.titelBewijsstukInput().fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEditor().click();
        await instantieDetailsPage.beschrijvingBewijsstukEditor().fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');

        expect(await instantieDetailsPage.titelBewijsstukInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderBewijsButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');
        await expect(instantieDetailsPage.titelBewijsstukInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.verwijderBewijsButton()).not.toBeVisible();

        await instantieDetailsPage.verwijderVoorwaardeButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderVoorwaardeButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor()).not.toBeVisible();

        await expect(instantieDetailsPage.titelBewijsstukInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.verwijderBewijsButton()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on procedure fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegProcedureToeButton.click();

        await instantieDetailsPage.titelProcedureInput().fill('een nieuwe titel voor procedure');
        await instantieDetailsPage.beschrijvingProcedureEditor().click();
        await instantieDetailsPage.beschrijvingProcedureEditor().fill('een nieuwe beschrijving voor procedure');
        await instantieDetailsPage.beschrijvingProcedureEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelProcedureInput().inputValue()).toEqual('een nieuwe titel voor procedure');
        expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toEqual('een nieuwe beschrijving voor procedure');

        await instantieDetailsPage.titelProcedureInput().fill('');
        await instantieDetailsPage.beschrijvingProcedureEditor().click();
        await instantieDetailsPage.beschrijvingProcedureEditor().fill('');
        await instantieDetailsPage.beschrijvingProcedureEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelProcedureInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderProcedureButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderProcedureButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingProcedureEditor()).not.toBeVisible();

        await instantieDetailsPage.voegProcedureToeButton.click();
        await instantieDetailsPage.voegWebsiteToeButtonVoorProcedure().click();

        await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill('een nieuwe titel voor procedure website');
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().click();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().fill('een nieuwe beschrijving voor procedure website');
        await instantieDetailsPage.websiteURLVoorProcedureInput().fill('http://website-for-procedure.be');
        await instantieDetailsPage.websiteURLVoorProcedureInput().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput().inputValue()).toEqual('een nieuwe titel voor procedure website');
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toEqual('een nieuwe beschrijving voor procedure website');
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput().inputValue()).toEqual('http://website-for-procedure.be');

        await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill('');
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().click();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().fill('');
        await instantieDetailsPage.websiteURLVoorProcedureInput().fill('');
        await instantieDetailsPage.websiteURLVoorProcedureInput().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput().inputValue()).toEqual('');

        await instantieDetailsPage.verwijderWebsiteButtonVoorProcedure().click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelProcedureInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toEqual('');

        await expect(instantieDetailsPage.voegWebsiteToeButtonVoorProcedure()).toBeVisible();
        await expect(instantieDetailsPage.verwijderWebsiteButtonVoorProcedure()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor()).not.toBeVisible();

        await instantieDetailsPage.verwijderProcedureButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderProcedureButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingProcedureEditor()).not.toBeVisible();

        await expect(instantieDetailsPage.voegWebsiteToeButtonVoorProcedure()).toBeVisible();
        await expect(instantieDetailsPage.verwijderWebsiteButtonVoorProcedure()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on costs fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegKostToeButton.click();

        await instantieDetailsPage.titelKostInput().fill('een nieuwe titel voor kost');
        await instantieDetailsPage.beschrijvingKostEditor().click();
        await instantieDetailsPage.beschrijvingKostEditor().fill('een nieuwe beschrijving voor kost');
        await instantieDetailsPage.beschrijvingKostEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual('een nieuwe titel voor kost');
        expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toEqual('een nieuwe beschrijving voor kost');

        await instantieDetailsPage.titelKostInput().fill('');
        await instantieDetailsPage.beschrijvingKostEditor().click();
        await instantieDetailsPage.beschrijvingKostEditor().fill('');
        await instantieDetailsPage.beschrijvingKostEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderKostButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderKostButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelKostInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingKostEditor()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on legal resource fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegRegelgevendeBronToeButton.click();

        await instantieDetailsPage.titelRegelgevendeBronInput().fill('een nieuwe titel voor regelgevende bron');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().click();
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().fill('een nieuwe beschrijving voor regelgevende bron');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelRegelgevendeBronInput().inputValue()).toEqual('een nieuwe titel voor regelgevende bron');
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toEqual('een nieuwe beschrijving voor regelgevende bron');

        await instantieDetailsPage.titelRegelgevendeBronInput().fill('');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().click();
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().fill('');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelRegelgevendeBronInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelRegelgevendeBronInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderRegelgevendeBronButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderRegelgevendeBronButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelRegelgevendeBronInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingRegelgevendeBronEditor()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on financial advantages fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegFinancieelVoordeelToeButton.click();

        await instantieDetailsPage.titelFinancieelVoordeelInput().fill('een nieuwe titel voor financieel voordeel');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().click();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().fill('een nieuwe beschrijving voor financieel voordeel');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue()).toEqual('een nieuwe titel voor financieel voordeel');
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toEqual('een nieuwe beschrijving voor financieel voordeel');

        await instantieDetailsPage.titelFinancieelVoordeelInput().fill('');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().click();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().fill('');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderFinancieelVoordeelButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderFinancieelVoordeelButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on contact punten fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegContactpuntToeButton.click();

        const email = `${uuid()}@example.com`
        await instantieDetailsPage.contactpuntEmailSelect().insertNewValue(email);
        const telefoon = '0499123123';
        await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue(telefoon);
        const websiteUrl = `https://${uuid()}.be`;
        await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue(websiteUrl);
        const openingsuren = `https://${uuid()}.be`;
        await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue(openingsuren);

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.contactpuntEmailSelect().searchValue(email)).toEqual(email);
        expect(await instantieDetailsPage.contactpuntTelefoonSelect().searchValue(telefoon)).toEqual(telefoon);
        expect(await instantieDetailsPage.contactpuntWebsiteURLSelect().searchValue(websiteUrl)).toEqual(websiteUrl);
        expect(await instantieDetailsPage.contactpuntOpeningsurenSelect().searchValue(openingsuren)).toEqual(openingsuren);

        await instantieDetailsPage.contactpuntEmailSelect().clearButton.click();
        await instantieDetailsPage.contactpuntTelefoonSelect().clearButton.click();
        await instantieDetailsPage.contactpuntWebsiteURLSelect().clearButton.click();
        await instantieDetailsPage.contactpuntOpeningsurenSelect().clearButton.click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();
        
        expect(await instantieDetailsPage.contactpuntEmailSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntTelefoonSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntWebsiteURLSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntOpeningsurenSelect().selectDiv.innerText()).toEqual('');

        await instantieDetailsPage.verwijderContactpuntButton().click();
        
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderContactpuntButton()).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntEmailSelect().selectDiv).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntTelefoonSelect().selectDiv).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntWebsiteURLSelect().selectDiv).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntOpeningsurenSelect().selectDiv).not.toBeVisible();

        await instantieDetailsPage.voegContactpuntToeButton.click();
        await instantieDetailsPage.voegAdresToeButton().click();

        await instantieDetailsPage.contactpuntAdresGemeenteSelect().selectValue('Harelbeke');
        await expect(instantieDetailsPage.contactpuntAdresValidatie()).toContainText('Niet genoeg info om adres te valideren');
        await instantieDetailsPage.contactpuntAdresStraatSelect().selectValue('Generaal Deprezstraat');
        await instantieDetailsPage.contactpuntAdresHuisnummerInput().fill('2');
        await instantieDetailsPage.contactpuntAdresBusnummerInput().fill('50');
        await expect(instantieDetailsPage.contactpuntAdresValidatie()).toContainText('Adres gevonden');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.contactpuntEmailSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntTelefoonSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntWebsiteURLSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntOpeningsurenSelect().selectDiv.innerText()).toEqual('');
        expect(await instantieDetailsPage.contactpuntAdresGemeenteSelect().selectedItem.textContent()).toContain('Harelbeke');
        expect(await instantieDetailsPage.contactpuntAdresStraatSelect().selectedItem.textContent()).toContain('Generaal Deprezstraat');
        expect(await instantieDetailsPage.contactpuntAdresHuisnummerInput().inputValue()).toEqual('2');
        expect(await instantieDetailsPage.contactpuntAdresBusnummerInput().inputValue()).toEqual('50');

        await instantieDetailsPage.verwijderAdresButton().click();
        await instantieDetailsPage.verwijderContactpuntButton().click();
        
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderContactpuntButton()).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntEmailSelect().selectDiv).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntTelefoonSelect().selectDiv).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntWebsiteURLSelect().selectDiv).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntOpeningsurenSelect().selectDiv).not.toBeVisible();

        await expect(instantieDetailsPage.verwijderAdresButton()).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntAdresGemeenteSelect().selectedItem).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntAdresStraatSelect().selectedItem).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntAdresHuisnummerInput()).not.toBeVisible();
        await expect(instantieDetailsPage.contactpuntAdresBusnummerInput()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on more info fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegWebsiteToeButton.click();

        await instantieDetailsPage.titelWebsiteInput().fill('een nieuwe titel voor website');
        await instantieDetailsPage.beschrijvingWebsiteEditor().click();
        await instantieDetailsPage.beschrijvingWebsiteEditor().fill('een nieuwe beschrijving voor website');
        await instantieDetailsPage.websiteURLInput().fill('http://www.website.com');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteInput().inputValue()).toEqual('een nieuwe titel voor website');
        expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toEqual('een nieuwe beschrijving voor website');
        expect(await instantieDetailsPage.websiteURLInput().inputValue()).toEqual('http://www.website.com');

        await instantieDetailsPage.titelWebsiteInput().fill('');
        await instantieDetailsPage.beschrijvingWebsiteEditor().click();
        await instantieDetailsPage.beschrijvingWebsiteEditor().fill('');
        await instantieDetailsPage.websiteURLInput().fill('');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.websiteURLInput().inputValue()).toEqual('');

        await instantieDetailsPage.verwijderWebsiteButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderWebsiteButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.websiteURLInput()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on more fields of properties tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.eigenschappenTab.click();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        const newProductOfDienstGeldigVanaf = '13-04-2019';
        await instantieDetailsPage.productOfDienstGeldigVanafInput.clear();
        await page.keyboard.type(newProductOfDienstGeldigVanaf);

        const newProductOfDienstGeldigTot = '27-11-2026';
        await instantieDetailsPage.productOfDienstGeldigTotInput.clear();
        await page.keyboard.type(newProductOfDienstGeldigTot);

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.productOfDienstGeldigVanafInput.inputValue()).toEqual('13-04-2019');
        expect(await instantieDetailsPage.productOfDienstGeldigTotInput.inputValue()).toEqual('27-11-2026');

        await instantieDetailsPage.productOfDienstGeldigVanafInput.clear();
        await instantieDetailsPage.productOfDienstGeldigTotInput.clear();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.productOfDienstGeldigVanafInput.inputValue()).toEqual('');
        expect(await instantieDetailsPage.productOfDienstGeldigTotInput.inputValue()).toEqual('');

        await instantieDetailsPage.productTypeSelect.selectValue('Infrastructuur en materiaal');
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.productTypeSelect.selectedItem.textContent()).toContain('Infrastructuur en materiaal');

        await instantieDetailsPage.productTypeSelect.clearButton.click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.productTypeSelect.selectDiv.innerText()).toEqual('');

        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Burger');
        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Onderneming');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(['Burger', 'Onderneming']);

        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Burger');
        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Onderneming');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText([]);

        await instantieDetailsPage.themasMultiSelect.selectValue('Economie en Werk');
        await instantieDetailsPage.themasMultiSelect.selectValue('Milieu en Energie');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(['Economie en Werk', 'Milieu en Energie']);

        await instantieDetailsPage.themasMultiSelect.selectValue('Economie en Werk');
        await instantieDetailsPage.themasMultiSelect.selectValue('Milieu en Energie');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText([]);

        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Vlaamse overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Lokale overheid');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(['Lokale overheid', 'Vlaamse overheid']);

        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Vlaamse overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Lokale overheid');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText([]);

        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(['Pepingen (Gemeente)']);
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText([]);

        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Federale overheid');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Lokale overheid');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(['Federale overheid', 'Lokale overheid']);

        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Federale overheid');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Lokale overheid');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText([]);

        await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText(['Pepingen (Gemeente)']);
        await instantieDetailsPage.uitvoerendeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText([]);

        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Pepingen']);
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Limburg');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Provincie Limburg']);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Pepingen']);

        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Pepingen');
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Limburg');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText([]);

        await instantieDetailsPage.tagsMultiSelect.insertNewValue('een-nieuwe-tag');
        await instantieDetailsPage.tagsMultiSelect.insertNewValue('nog-een-nieuwe-tag');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(['een-nieuwe-tag', 'nog-een-nieuwe-tag']);

        await instantieDetailsPage.tagsMultiSelect.optionsDeleteButtons().nth(0).click();
        await instantieDetailsPage.tagsMultiSelect.optionsDeleteButtons().nth(0).click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText([]);

        await instantieDetailsPage.publicatieKanalenMultiSelect.selectValue('Your Europe');
        await instantieDetailsPage.categorieenYourEuropeMultiSelect.selectValue('Medische behandeling ondergaan');
        await instantieDetailsPage.categorieenYourEuropeMultiSelect.selectValue('Rechten en verplichtingen tot preventieve openbare gezondheidsmaatregelen');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText('Your Europe');
        await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(['Medische behandeling ondergaan', 'Rechten en verplichtingen tot preventieve openbare gezondheidsmaatregelen']);

        await instantieDetailsPage.publicatieKanalenMultiSelect.selectValue('Your Europe');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText([]);
        await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText([]);
        
    });


});