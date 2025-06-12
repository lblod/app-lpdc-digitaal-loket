import { expect, Page, test } from "@playwright/test";
import { v4 as uuid } from 'uuid';
import { MockLoginPage } from "./pages/mock-login-page";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { ConceptDetailsPage as ConceptDetailsPage } from './pages/concept-details-page';
import { WijzigingenBewarenModal } from './modals/wijzigingen-bewaren-modal';
import { UJeModal } from "./modals/u-je-modal";
import { first_row } from './components/table';
import { IpdcStub } from './components/ipdc-stub';
import { ProductOfDienstOpnieuwBewerkenModal } from "./modals/product-of-dienst-opnieuw-bewerken-modal";
import { wait } from "./shared/shared";
import { ProductOfDienstVerwijderenModal } from "./modals/product-of-dienst-verwijderen-modal";

test.describe.configure({ mode: 'parallel'});
test.describe('Delete an instance', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let productOfDienstOpnieuwBewerkenModal: ProductOfDienstOpnieuwBewerkenModal;
    let productOfDienstVerwijderenModal: ProductOfDienstVerwijderenModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        productOfDienstOpnieuwBewerkenModal = ProductOfDienstOpnieuwBewerkenModal.create(page);
        productOfDienstVerwijderenModal = ProductOfDienstVerwijderenModal.create(page);

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

    test(`Create an instance, Send it to Vlaamse Overheid And then Delete It`, async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        expect(titel).toEqual(`Akte van Belgische nationaliteit - nl`);
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

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(newTitel);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
        await expect(homePage.resultTable.row(first_row).pill('Verzonden')).toBeVisible();

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: newTitel, expectedFormalOrInformalTripleLanguage: "nl-be-x-formal" });
        expect(instancePublishedInIpdc).toBeTruthy();
        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService');
        const publicServiceUri = publicService['@id'];

        await homePage.resultTable.row(first_row).link(newTitel).click();

        await instantieDetailsPage.actiesMenu.locator.click();
        await instantieDetailsPage.actiesMenu.productVerwijderenButton.isDisabled();

        await instantieDetailsPage.expectToBeVisible();
        await instantieDetailsPage.productOpnieuwBewerkenButton.click();

        await productOfDienstOpnieuwBewerkenModal.expectToBeVisible();
        await wait(3000); // reason unclear, initialization seems to be slow, clicking too fast on the button gives no reaction application
        await productOfDienstOpnieuwBewerkenModal.productOpnieuwBewerkenButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.titelInput).toHaveValue(newTitel);

        await instantieDetailsPage.actiesMenu.expectToBeVisible();
        await instantieDetailsPage.actiesMenu.locator.click();
        await instantieDetailsPage.actiesMenu.productVerwijderenButton.click();
        await productOfDienstVerwijderenModal.expectToBeVisible();
        await productOfDienstVerwijderenModal.verwijderenButton.click();

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(newTitel);
        await expect(homePage.resultTable.alertMessage).toContainText('Er werden geen producten of diensten gevonden');

        const instanceRepublishedInIpdc = await IpdcStub.findPublishedInstance({ tombstonedId: publicServiceUri });
        expect(instanceRepublishedInIpdc).toBeTruthy();

        const tombstonedPublicService = IpdcStub.getObjectByType(instanceRepublishedInIpdc, 'https://www.w3.org/ns/activitystreams#Tombstone');

        expect(Object.keys(tombstonedPublicService)).toHaveLength(4);

        expect(tombstonedPublicService['@id']).toEqual(publicServiceUri);
        
        expect(tombstonedPublicService['@type']).toHaveLength(1);
        expect(tombstonedPublicService['@type']).toEqual(['https://www.w3.org/ns/activitystreams#Tombstone']);

        const activityStreamDeleted = tombstonedPublicService['https://www.w3.org/ns/activitystreams#deleted'];
        expect(activityStreamDeleted).toHaveLength(1);
        expect(activityStreamDeleted[0]['@type']).toEqual('http://www.w3.org/2001/XMLSchema#dateTime');

        const activityStreamFormerType = tombstonedPublicService['https://www.w3.org/ns/activitystreams#formerType'];
        expect(activityStreamFormerType).toHaveLength(1);
        expect(activityStreamFormerType).toEqual([{ '@id': 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService' }]);

    });


});