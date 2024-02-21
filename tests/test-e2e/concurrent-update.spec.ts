import {expect, Page, test} from "@playwright/test";
import {UJeModal} from "./modals/u-je-modal";
import {MockLoginPage} from "./pages/mock-login-page";
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from "./pages/product-of-dienst-toevoegen-page";
import {first_row} from "./components/table";
import {ConceptDetailsPage} from "./pages/concept-details-page";
import {InstantieDetailsPage} from "./pages/instantie-details-page";
import {v4 as uuid} from "uuid";
import {WijzigingenBewarenModal} from "./modals/wijzigingen-bewaren-modal";
import {VerzendNaarVlaamseOverheidModal} from "./modals/verzend-naar-vlaamse-overheid-modal";
import {IpdcStub} from "./components/ipdc-stub";
import {Toaster} from "./components/toaster";

test.describe.configure({ mode: 'parallel'});
test.describe('Concurrent Update', () => {

    let page: Page;
    let pageOtherUser: Page;

    test.beforeEach(async ({browser}) => {
        page = await browser.newPage();
        pageOtherUser = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
        await pageOtherUser.close();
    });

    test('Second update should fail', async () => {
        await login(page);
        await login(pageOtherUser);
        const instantieTitel = await createMinimalInstance(page);
        await pageOtherUser.reload();

        let instantieDetailsPage = await openInstantie(page, instantieTitel);
        let instantieDetailsPageOtherUser = await openInstantie(pageOtherUser, instantieTitel);

        const verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        const homePage = LpdcHomePage.create(page);

        await instantieDetailsPage.beschrijvingEditor.fill("first description");
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.wijzigingenBewarenButton.click()
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await instantieDetailsPageOtherUser.beschrijvingEditor.fill("second description");
        await instantieDetailsPageOtherUser.beschrijvingEditor.blur();
        await instantieDetailsPageOtherUser.wijzigingenBewarenButton.click();
        const toaster = new Toaster(pageOtherUser);
        await expect(toaster.message).toContainText("De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in.");
        await toaster.closeButton.click();

        instantieDetailsPage = await openInstantie(page, instantieTitel);
        expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain("first description");

        instantieDetailsPageOtherUser = await openInstantie(pageOtherUser, instantieTitel);
        expect(await instantieDetailsPageOtherUser.beschrijvingEditor.textContent()).toContain("first description");

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(instantieTitel);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(instantieTitel);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Verzonden');

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({title: instantieTitel, expectedFormalOrInformalTripleLanguage: 'nl-be-x-formal'});
        expect(instancePublishedInIpdc).toBeTruthy();

        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');
        expect(publicService['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(publicService['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": "nl-be-x-formal",
                "@value": `<p data-indentation-level="0">first description</p>`
            }
        ]));

    })

    test('Two different updates in details page should not fail', async () => {
        await login(page);

        const instantieTitel = await createMinimalInstance(page);
        let instantieDetailsPage = await openInstantie(page, instantieTitel);

        await instantieDetailsPage.beschrijvingEditor.fill("first description");
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.wijzigingenBewarenButton.click()
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        await instantieDetailsPage.beschrijvingEditor.fill("second description");
        await instantieDetailsPage.beschrijvingEditor.blur();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        const toaster = new Toaster(page);
        await expect(toaster.message).not.toBeVisible()

        instantieDetailsPage = await openInstantie(page, instantieTitel);
        expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain("second description");

    });

});


async function login(page: Page) {
    const mockLoginPage = MockLoginPage.createForLpdc(page);
    const homePage = LpdcHomePage.create(page);

    await mockLoginPage.goto();
    await mockLoginPage.searchInput.fill('Pepingen');
    await mockLoginPage.login('Gemeente Pepingen');

    await homePage.expectToBeVisible();

    const uJeModal = UJeModal.create(page);
    await uJeModal.expectToBeVisible();
    await uJeModal.laterKiezenButton.click();
    await uJeModal.expectToBeClosed();
}

async function createMinimalInstance(page: Page): Promise<string> {
    const homePage = LpdcHomePage.create(page);
    const toevoegenPage = ProductOfDienstToevoegenPage.create(page);
    const conceptDetailsPage = ConceptDetailsPage.create(page);
    const instantieDetailsPage = InstantieDetailsPage.create(page);
    const wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);

    await homePage.goto();
    await homePage.productOfDienstToevoegenButton.click();

    await toevoegenPage.expectToBeVisible();
    await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();

    await conceptDetailsPage.expectToBeVisible();
    await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
    await conceptDetailsPage.voegToeButton.click();

    await instantieDetailsPage.expectToBeVisible();
    await expect(instantieDetailsPage.heading).toHaveText(`Akte van Belgische nationaliteit - nl`);
    await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
    await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

    const titel = await instantieDetailsPage.titelInput.inputValue();
    const newTitel = titel + uuid();
    await instantieDetailsPage.titelInput.fill(newTitel);

    await instantieDetailsPage.eigenschappenTab.click();

    await wijzigingenBewarenModal.expectToBeVisible();
    await wijzigingenBewarenModal.bewaarButton.click();
    await wijzigingenBewarenModal.expectToBeClosed();

    await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
    await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

    await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText([]);
    await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

    await instantieDetailsPage.wijzigingenBewarenButton.click();
    await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();
    await instantieDetailsPage.terugNaarHetOverzichtButton.click();
    await homePage.expectToBeVisible();

    return newTitel;
}

async function openInstantie(page: Page, title: string): Promise<InstantieDetailsPage> {
    const homePage = LpdcHomePage.create(page);
    const instantieDetailsPage = InstantieDetailsPage.create(page);

    await homePage.goto();
    await homePage.expectToBeVisible();
    await homePage.searchInput.fill(title);
    await expect(homePage.resultTable.row(first_row).locator).toContainText(title);
    await homePage.resultTable.row(first_row).link('Bewerk').click();

    await expect(instantieDetailsPage.heading).toHaveText(title);
    await expect(instantieDetailsPage.titelInput).toHaveValue(title)

    return instantieDetailsPage;
}