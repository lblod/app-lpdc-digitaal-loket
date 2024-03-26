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
        await instantieDetailsPage.titelEngelsInput.fill('a new title');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelInput.inputValue()).toEqual('een nieuwe titel');
        expect(await instantieDetailsPage.titelEngelsInput.inputValue()).toEqual('a new title');

        await instantieDetailsPage.titelInput.fill('');
        await instantieDetailsPage.titelEngelsInput.fill('');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelInput.inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelEngelsInput.inputValue()).toEqual('');

        await instantieDetailsPage.beschrijvingEditor.fill('een nieuwe beschrijving');
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.beschrijvingEngelsEditor.fill('a new description');
        await instantieDetailsPage.beschrijvingEngelsEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toEqual('een nieuwe beschrijving');
        expect(await instantieDetailsPage.beschrijvingEngelsEditor.textContent()).toEqual('a new description');

        await instantieDetailsPage.beschrijvingEditor.fill('');
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.beschrijvingEngelsEditor.fill('');
        await instantieDetailsPage.beschrijvingEngelsEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingEngelsEditor.textContent()).toEqual('');

        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill('een nieuwe aanvullende beschrijving');
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.blur();
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.fill('a new additional description');
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toEqual('een nieuwe aanvullende beschrijving');
        expect(await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.textContent()).toEqual('a new additional description');

        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill('');
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.blur();
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.fill('');
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toEqual('');
        expect(await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.textContent()).toEqual('');

        await instantieDetailsPage.uitzonderingenEditor.fill('een nieuwe uitzondering');
        await instantieDetailsPage.uitzonderingenEditor.blur();
        await instantieDetailsPage.uitzonderingenEngelsEditor.fill('a new exception');
        await instantieDetailsPage.uitzonderingenEngelsEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toEqual('een nieuwe uitzondering');
        expect(await instantieDetailsPage.uitzonderingenEngelsEditor.textContent()).toEqual('a new exception');

        await instantieDetailsPage.uitzonderingenEditor.fill('');
        await instantieDetailsPage.uitzonderingenEditor.blur();
        await instantieDetailsPage.uitzonderingenEngelsEditor.fill('');
        await instantieDetailsPage.uitzonderingenEngelsEditor.blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toEqual('');
        expect(await instantieDetailsPage.uitzonderingenEngelsEditor.textContent()).toEqual('');

        await instantieDetailsPage.beschrijvingRegelgevingEditor().fill('een nieuwe uitzondering');
        await instantieDetailsPage.beschrijvingRegelgevingEditor().blur();
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().fill('a new exception');
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toEqual('een nieuwe uitzondering');
        expect(await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().textContent()).toEqual('a new exception');

        await instantieDetailsPage.beschrijvingRegelgevingEditor().fill('');
        await instantieDetailsPage.beschrijvingRegelgevingEditor().blur();
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().textContent()).toEqual('');

    });

    test('Update a new instance and do consecutive edits on conditions fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegVoorwaardeToeButton.click();

        await instantieDetailsPage.titelVoorwaardeInput().fill('een nieuwe titel voor voorwaarde');
        await instantieDetailsPage.titelVoorwaardeEngelsInput().fill('a new titel for conditions');
        await instantieDetailsPage.titelVoorwaardeEngelsInput().blur();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill('een nieuwe beschrijving voor voorwaarde');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().fill('a new description for conditions');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('een nieuwe titel voor voorwaarde');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput().inputValue()).toEqual('a new titel for conditions');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('een nieuwe beschrijving voor voorwaarde');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().textContent()).toEqual('a new description for conditions');
    
        await instantieDetailsPage.titelVoorwaardeInput().fill('');
        await instantieDetailsPage.titelVoorwaardeEngelsInput().fill('');
        await instantieDetailsPage.titelVoorwaardeEngelsInput().blur();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill('');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderVoorwaardeButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderVoorwaardeButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor()).not.toBeVisible();

        await instantieDetailsPage.voegVoorwaardeToeButton.click();
        await instantieDetailsPage.voegBewijsstukToeButton().click();

        await instantieDetailsPage.titelBewijsstukInput().fill('een nieuwe titel bewijsstuk');
        await instantieDetailsPage.titelBewijsstukEngelsInput().fill('a new title evidence');
        await instantieDetailsPage.beschrijvingBewijsstukEditor().fill('een nieuwe beschrijving bewijsstuk');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().fill('a new description evidence');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().textContent()).toEqual('');

        expect(await instantieDetailsPage.titelBewijsstukInput().inputValue()).toEqual('een nieuwe titel bewijsstuk');
        expect(await instantieDetailsPage.titelBewijsstukEngelsInput().inputValue()).toEqual('a new title evidence');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toEqual('een nieuwe beschrijving bewijsstuk');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().textContent()).toEqual('a new description evidence');

        await instantieDetailsPage.titelBewijsstukInput().fill('');
        await instantieDetailsPage.titelBewijsstukEngelsInput().fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEditor().fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().textContent()).toEqual('');

        expect(await instantieDetailsPage.titelBewijsstukInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelBewijsstukEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderBewijsButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().textContent()).toEqual('');    
        await expect(instantieDetailsPage.titelBewijsstukInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.verwijderBewijsButton()).not.toBeVisible();

        await instantieDetailsPage.verwijderVoorwaardeButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderVoorwaardeButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor()).not.toBeVisible();

        await expect(instantieDetailsPage.titelBewijsstukInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor()).not.toBeVisible();
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
        await instantieDetailsPage.titelProcedureEngelsInput().fill('a new titel for procedure');
        await instantieDetailsPage.titelProcedureEngelsInput().blur();
        await instantieDetailsPage.beschrijvingProcedureEditor().fill('een nieuwe beschrijving voor procedure');
        await instantieDetailsPage.beschrijvingProcedureEngelsEditor().fill('a new description for procedure');
        await instantieDetailsPage.beschrijvingProcedureEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelProcedureInput().inputValue()).toEqual('een nieuwe titel voor procedure');
        expect(await instantieDetailsPage.titelProcedureEngelsInput().inputValue()).toEqual('a new titel for procedure');
        expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toEqual('een nieuwe beschrijving voor procedure');
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsEditor().textContent()).toEqual('a new description for procedure');

        await instantieDetailsPage.titelProcedureInput().fill('');
        await instantieDetailsPage.titelProcedureEngelsInput().fill('');
        await instantieDetailsPage.titelProcedureEngelsInput().blur();
        await instantieDetailsPage.beschrijvingProcedureEditor().fill('');
        await instantieDetailsPage.beschrijvingProcedureEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingProcedureEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelProcedureInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelProcedureEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderProcedureButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderProcedureButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelProcedureEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingProcedureEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingProcedureEngelsEditor()).not.toBeVisible();

        await instantieDetailsPage.voegProcedureToeButton.click();
        await instantieDetailsPage.voegWebsiteToeButtonVoorProcedure().click();

        await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill('een nieuwe titel voor procedure website');
        await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput().fill('a new titel for procedure website');
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().fill('een nieuwe beschrijving voor procedure website');
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor().fill('a new description for procedure website');
        await instantieDetailsPage.websiteURLVoorProcedureInput().fill('http://website-for-procedure.be');
        await instantieDetailsPage.websiteURLVoorProcedureInput().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput().inputValue()).toEqual('een nieuwe titel voor procedure website');
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput().inputValue()).toEqual('a new titel for procedure website');
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toEqual('een nieuwe beschrijving voor procedure website');
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor().textContent()).toEqual('a new description for procedure website');
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput().inputValue()).toEqual('http://website-for-procedure.be');

        await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill('');
        await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput().fill('');
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().fill('');
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor().fill('');
        await instantieDetailsPage.websiteURLVoorProcedureInput().fill('');
        await instantieDetailsPage.websiteURLVoorProcedureInput().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput().inputValue()).toEqual('');

        await instantieDetailsPage.verwijderWebsiteButtonVoorProcedure().click();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelProcedureInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelProcedureEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsEditor().textContent()).toEqual('');

        await expect(instantieDetailsPage.voegWebsiteToeButtonVoorProcedure()).toBeVisible();
        await expect(instantieDetailsPage.verwijderWebsiteButtonVoorProcedure()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor()).not.toBeVisible();

        await instantieDetailsPage.verwijderProcedureButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderProcedureButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelProcedureEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingProcedureEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingProcedureEngelsEditor()).not.toBeVisible();

        await expect(instantieDetailsPage.voegWebsiteToeButtonVoorProcedure()).toBeVisible();
        await expect(instantieDetailsPage.verwijderWebsiteButtonVoorProcedure()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor()).not.toBeVisible();


    });

    test('Update a new instance and do consecutive edits on costs fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegKostToeButton.click();

        await instantieDetailsPage.titelKostInput().fill('een nieuwe titel voor kost');
        await instantieDetailsPage.titelKostEngelsInput().fill('a new titel for kost');
        await instantieDetailsPage.titelKostEngelsInput().blur();
        await instantieDetailsPage.beschrijvingKostEditor().fill('een nieuwe beschrijving voor kost');
        await instantieDetailsPage.beschrijvingKostEngelsEditor().fill('a new description for kost');
        await instantieDetailsPage.beschrijvingKostEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual('een nieuwe titel voor kost');
        expect(await instantieDetailsPage.titelKostEngelsInput().inputValue()).toEqual('a new titel for kost');
        expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toEqual('een nieuwe beschrijving voor kost');
        expect(await instantieDetailsPage.beschrijvingKostEngelsEditor().textContent()).toEqual('a new description for kost');

        await instantieDetailsPage.titelKostInput().fill('');
        await instantieDetailsPage.titelKostEngelsInput().fill('');
        await instantieDetailsPage.titelKostEngelsInput().blur();
        await instantieDetailsPage.beschrijvingKostEditor().fill('');
        await instantieDetailsPage.beschrijvingKostEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingKostEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingKostEngelsEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderKostButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderKostButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelKostInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelKostEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingKostEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingKostEngelsEditor()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on legal resource fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegRegelgevendeBronToeButton.click();

        await instantieDetailsPage.titelRegelgevendeBronInput().fill('een nieuwe titel voor regelgevende bron');
        await instantieDetailsPage.titelRegelgevendeBronEngelsInput().fill('a new titel for regelgevende bron');
        await instantieDetailsPage.titelRegelgevendeBronEngelsInput().blur();
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().fill('een nieuwe beschrijving voor regelgevende bron');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor().fill('a new description for regelgevende bron');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelRegelgevendeBronInput().inputValue()).toEqual('een nieuwe titel voor regelgevende bron');
        expect(await instantieDetailsPage.titelRegelgevendeBronEngelsInput().inputValue()).toEqual('a new titel for regelgevende bron');
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toEqual('een nieuwe beschrijving voor regelgevende bron');
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor().textContent()).toEqual('a new description for regelgevende bron');

        await instantieDetailsPage.titelRegelgevendeBronInput().fill('');
        await instantieDetailsPage.titelRegelgevendeBronEngelsInput().fill('');
        await instantieDetailsPage.titelRegelgevendeBronEngelsInput().blur();
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().fill('');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelRegelgevendeBronInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelRegelgevendeBronInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderRegelgevendeBronButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderRegelgevendeBronButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelRegelgevendeBronInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelRegelgevendeBronEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingRegelgevendeBronEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingRegelgevendeBronEngelsEditor()).not.toBeVisible();

    });

    test('Update a new instance and do consecutive edits on financial advantages fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegFinancieelVoordeelToeButton.click();

        await instantieDetailsPage.titelFinancieelVoordeelInput().fill('een nieuwe titel voor financieel voordeel');
        await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().fill('a new titel for financieel voordeel');
        await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().blur();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().fill('een nieuwe beschrijving voor financieel voordeel');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().fill('a new description for financieel voordeel');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue()).toEqual('een nieuwe titel voor financieel voordeel');
        expect(await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().inputValue()).toEqual('a new titel for financieel voordeel');
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toEqual('een nieuwe beschrijving voor financieel voordeel');
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().textContent()).toEqual('a new description for financieel voordeel');

        await instantieDetailsPage.titelFinancieelVoordeelInput().fill('');
        await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().fill('');
        await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().blur();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().fill('');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().textContent()).toEqual('');

        await instantieDetailsPage.verwijderFinancieelVoordeelButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderFinancieelVoordeelButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor()).not.toBeVisible();

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
        await instantieDetailsPage.titelWebsiteEngelsInput().fill('a new titel for website');
        await instantieDetailsPage.titelWebsiteEngelsInput().blur();
        await instantieDetailsPage.beschrijvingWebsiteEditor().fill('een nieuwe beschrijving voor website');
        await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().fill('a new description for website');
        await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().blur();
        await instantieDetailsPage.websiteURLInput().fill('http://www.website.com');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteInput().inputValue()).toEqual('een nieuwe titel voor website');
        expect(await instantieDetailsPage.titelWebsiteEngelsInput().inputValue()).toEqual('a new titel for website');
        expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toEqual('een nieuwe beschrijving voor website');
        expect(await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().textContent()).toEqual('a new description for website');
        expect(await instantieDetailsPage.websiteURLInput().inputValue()).toEqual('http://www.website.com');

        await instantieDetailsPage.titelWebsiteInput().fill('');
        await instantieDetailsPage.titelWebsiteEngelsInput().fill('');
        await instantieDetailsPage.titelWebsiteEngelsInput().blur();
        await instantieDetailsPage.beschrijvingWebsiteEditor().fill('');
        await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().fill('');
        await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().blur();
        await instantieDetailsPage.websiteURLInput().fill('');

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelWebsiteInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelWebsiteEngelsInput().inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().textContent()).toEqual('');
        expect(await instantieDetailsPage.websiteURLInput().inputValue()).toEqual('');

        await instantieDetailsPage.verwijderWebsiteButton().click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderWebsiteButton()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteInput()).not.toBeVisible();
        await expect(instantieDetailsPage.titelWebsiteEngelsInput()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteEditor()).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingWebsiteEngelsEditor()).not.toBeVisible();
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