import { test, expect, Page } from '@playwright/test';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { first_row } from './components/table';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { IpdcStub } from './components/ipdc-stub';

test.describe.configure({ mode: 'parallel' });

test.describe('Instance Snapshot to Instance and published to IPDC Flow', () => {

    //note: Gent is chosen as an example of a instance snapshot through ldes provider

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let instantieDetailsPage: InstantieDetailsPage;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        instantieDetailsPage = InstantieDetailsPage.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Gent');
        await mockLoginPage.login('Gemeente Gent');

        await homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        const informalNotYetChosen = await uJeModal.isVisible();
        if (informalNotYetChosen) {
            await uJeModal.expectToBeVisible();
            await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
            await uJeModal.bevestigenButton.click();
            await uJeModal.expectToBeClosed();
        }
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Verify a minimal instance was created from instance snapshot from ldes stream and verify its publishment to ipdc', async () => {

        const title = 'Essentiële instantie';
        const description = `Beschrijving van de essentiële instantie`;

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(title);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(title);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Verzonden');

        await homePage.resultTable.row(first_row).link('Bekijk').click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.titelHeading).toBeVisible();

        await expect(instantieDetailsPage.titelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelInput).toHaveValue(title);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(description);

        await expect(instantieDetailsPage.productOpnieuwBewerkenButton).toBeVisible();

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        expect(instancePublishedInIpdc).toBeTruthy();

        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

        expect(publicService['http://purl.org/dc/terms/title']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": 'nl-be-x-informal', "@value": title }
        ]));

        expect(publicService['http://purl.org/dc/terms/description']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": 'nl-be-x-informal',
                "@value": `<p data-indentation-level=\"0\">${description}</p>`
            }
        ]));

        expect(publicService['http://data.europa.eu/m8g/hasCompetentAuthority']).toHaveLength(1);
        expect(publicService['http://data.europa.eu/m8g/hasCompetentAuthority']).toEqual(expect.arrayContaining([
            { "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }
        ]));

        expect(publicService['http://mu.semte.ch/vocabularies/core/uuid']).toHaveLength(1);

        expect(publicService['http://purl.org/dc/terms/created']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/created'][0]).toEqual(expect.objectContaining(
            {
                "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
                "@value": "2024-02-20T11:42:12.357Z"
            }
        ));

        expect(publicService['http://purl.org/dc/terms/modified']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/modified'][0]).toEqual(expect.objectContaining(
            {
                "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
                "@value": "2024-02-21T13:59:25.236Z"
            }
        ));

        expect(publicService['http://purl.org/dc/terms/spatial']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/spatial']).toEqual(expect.arrayContaining([
            { "@id": "http://vocab.belgif.be/auth/refnis2019/44021" }]));

        expect(publicService['http://purl.org/pav/createdBy']).toHaveLength(1);
        expect(publicService['http://purl.org/pav/createdBy'][0]).toEqual(
            { "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }
        );

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority']).toHaveLength(1);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority']).toEqual(expect.arrayContaining([
            {"@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }
        ]));

    });


});