import { expect, Page, test } from "@playwright/test";
import { v4 as uuid } from 'uuid';
import { MockLoginPage } from "./pages/mock-login-page";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { UJeModal } from "./modals/u-je-modal";
// @ts-ignore
import moment from 'moment';
import { first_row } from './components/table';
import { IpdcStub } from './components/ipdc-stub';
import { verifyInstancePublishedOnIPDC } from './shared/verify-instance-published-on-ipdc';

test.describe.configure({ mode: 'parallel' });
test.describe('Create a new instance not based on a concept', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);

        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);

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

    test('create a new instance and verify prefilled fields', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        const today = new Date();
        let formattedToday = moment(today).format('DD-MM-YYYY');

        await expect(instantieDetailsPage.koppelConceptLink).toBeVisible();
        await expect(instantieDetailsPage.aangemaaktOpHeader).toContainText(formattedToday);
        await expect(instantieDetailsPage.bewerktOpHeader).toContainText(formattedToday);
        await expect(instantieDetailsPage.statusDocumentHeader).toContainText('Ontwerp');

        await instantieDetailsPage.eigenschappenTab.click();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(['Pepingen (Gemeente)']);
        await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText(['Pepingen (Gemeente)']);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Pepingen']);
    });

    test('create a new instance, fill in minimal fields, and publish to ipdc', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.volledigNieuwProductToevoegenButton.click();

        await instantieDetailsPage.expectToBeVisible();

        const newTitel = 'titel' + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);

        const newBeschrijving = 'beschrijving' + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(newBeschrijving);

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(newTitel);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Verzonden');

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: newTitel, expectedFormalOrInformalTripleLanguage: 'nl-be-x-formal' });
        expect(instancePublishedInIpdc).toBeTruthy();

        verifyInstancePublishedOnIPDC(
            instancePublishedInIpdc,
            {
                titel: { nl: newTitel },
                beschrijving: { nl: newBeschrijving },
                uuid: 'PRESENT',
                createdBy: 'http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                conceptStatus: 'http://lblod.data.gift/concepts/instance-status/verstuurd',
                aangemaaktOp: `PRESENT`,
                bewerktOp: `PRESENT`,
                bevoegdeOverheden: [
                    'http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                ],
                uitvoerendeOverheden: [
                    'http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                ],
                geografischeToepassingsgebieden: [
                    'http://data.europa.eu/nuts/code/BE24123064'
                ],
            },
            'nl-be-x-formal');

    });



});