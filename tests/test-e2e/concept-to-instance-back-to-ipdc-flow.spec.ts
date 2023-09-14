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

        mockLoginPage = MockLoginPage.createForLpdc(page);
        await mockLoginPage.goto();
        await mockLoginPage.searchFor('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        homePage = LpdcHomePage.create(page);
        homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
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

    test('Create instance from concept and send to IPDC', async () => {
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

        const nieuweTitel = `Akte van Belgische nationaliteit ${uuid()}`;
        await instantieDetailsPage.titelInput.fill(nieuweTitel);

        await instantieDetailsPage.titelKostEngels.fill('Amount');
        await instantieDetailsPage.beschrijvingKostEngels.fill('The application and the certificate are free.');

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

        //TODO LPDC-680 figure out about the 'unsaved changes ... ' ???
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();

        await expect(homePage.resultTable.row(first_row)).toContainText(nieuweTitel);
        await expect(homePage.resultTable.row(first_row)).toContainText('Verzonden');

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(nieuweTitel);
        expect(instancePublishedInIpdc).toBeTruthy();
    });

});



