import {expect, Page, test} from "@playwright/test";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {UJeModal} from "./modals/u-je-modal";

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

        await instantieDetailsPage.beschrijvingRegelgevingEditor(0).fill('een nieuwe uitzondering');
        await instantieDetailsPage.beschrijvingRegelgevingEditor(0).blur();
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor(0).fill('a new exception');
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor(0).blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingRegelgevingEditor(0).textContent()).toEqual('een nieuwe uitzondering');
        expect(await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor(0).textContent()).toEqual('a new exception');

        await instantieDetailsPage.beschrijvingRegelgevingEditor(0).fill('');
        await instantieDetailsPage.beschrijvingRegelgevingEditor(0).blur();
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor(0).fill('');
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor(0).blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.beschrijvingRegelgevingEditor(0).textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor(0).textContent()).toEqual('');

    });

    test('Update a new instance and do consecutive edits on conditions fields of inhoud tab to verify they can be saved and cleared', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);

        await instantieDetailsPage.voegVoorwaardeToeButton.click();

        await instantieDetailsPage.titelVoorwaardeInput(0).fill('een nieuwe titel voor voorwaarde 1');
        await instantieDetailsPage.titelVoorwaardeEngelsInput(0).fill('a new titel for conditions 1');
        await instantieDetailsPage.titelVoorwaardeEngelsInput(0).blur();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).fill('een nieuwe beschrijving voor voorwaarde 1');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).fill('a new description for conditions 1');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput(0).inputValue()).toEqual('een nieuwe titel voor voorwaarde 1');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(0).inputValue()).toEqual('a new titel for conditions 1');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).textContent()).toEqual('een nieuwe beschrijving voor voorwaarde 1');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).textContent()).toEqual('a new description for conditions 1');
    
        await instantieDetailsPage.titelVoorwaardeInput(0).fill('');
        await instantieDetailsPage.titelVoorwaardeEngelsInput(0).fill('');
        await instantieDetailsPage.titelVoorwaardeEngelsInput(0).blur();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).fill('');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).fill('');
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).textContent()).toEqual('');

        await instantieDetailsPage.verwijderVoorwaardeButton(0).click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderVoorwaardeButton(0)).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0)).not.toBeVisible();

        await instantieDetailsPage.voegVoorwaardeToeButton.click();
        await instantieDetailsPage.voegBewijsstukToeButton(0).click();

        await instantieDetailsPage.titelBewijsstukInput(0).fill('een nieuwe titel bewijsstuk');
        await instantieDetailsPage.titelBewijsstukEngelsInput(0).fill('a new title evidence');
        await instantieDetailsPage.beschrijvingBewijsstukEditor(0).fill('een nieuwe beschrijving bewijsstuk');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0).fill('a new description evidence');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0).blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).textContent()).toEqual('');

        expect(await instantieDetailsPage.titelBewijsstukInput(0).inputValue()).toEqual('een nieuwe titel bewijsstuk');
        expect(await instantieDetailsPage.titelBewijsstukEngelsInput(0).inputValue()).toEqual('a new title evidence');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEditor(0).textContent()).toEqual('een nieuwe beschrijving bewijsstuk');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0).textContent()).toEqual('a new description evidence');

        await instantieDetailsPage.titelBewijsstukInput(0).fill('');
        await instantieDetailsPage.titelBewijsstukEngelsInput(0).fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEditor(0).fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0).fill('');
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0).blur();

        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).textContent()).toEqual('');

        expect(await instantieDetailsPage.titelBewijsstukInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelBewijsstukEngelsInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEditor(0).textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0).textContent()).toEqual('');

        await instantieDetailsPage.verwijderBewijsButton(0).click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        expect(await instantieDetailsPage.titelVoorwaardeInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(0).inputValue()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor(0).textContent()).toEqual('');
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0).textContent()).toEqual('');    
        await expect(instantieDetailsPage.titelBewijsstukInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0)).not.toBeVisible();
        await expect(instantieDetailsPage.verwijderBewijsButton(0)).not.toBeVisible();

        await instantieDetailsPage.verwijderVoorwaardeButton(0).click();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await expect(instantieDetailsPage.verwijderVoorwaardeButton(0)).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0)).not.toBeVisible();

        await expect(instantieDetailsPage.titelBewijsstukInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor(0)).not.toBeVisible();
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0)).not.toBeVisible();
        await expect(instantieDetailsPage.verwijderBewijsButton(0)).not.toBeVisible();

    });


});