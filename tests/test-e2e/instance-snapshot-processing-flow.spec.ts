import { test, expect, Page } from '@playwright/test';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { first_row } from './components/table';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { IpdcStub } from './components/ipdc-stub';
import {InstanceSnapshotLdesStub} from "./components/instance-snapshot-ldes-stub";
import {v4 as uuid} from 'uuid';

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

        await verifyInstanceInUI(title, undefined, description, undefined);
        await verifyPublishmentInIPDC(
            title,
            expect.arrayContaining([{ "@language": 'nl-be-x-informal', "@value": title }]),
            description,
            expect.arrayContaining([{ "@language": 'nl-be-x-informal', "@value": expect.stringContaining(description) }]),
            expect.arrayContaining([{ "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }]),
            expect.objectContaining({ "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2024-02-20T11:42:12.357Z" }),
            expect.objectContaining({ "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2024-02-21T13:59:25.236Z" }));
    });

    test('Verify a full instance was created from instance snapshot from ldes stream and verify its publishment to ipdc', async () => {

        const title = 'Akte van Belgische nationaliteit';
        const titleInEnglish = `Certificate of Belgian nationality`;
        const description = `De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen.`;
        const descriptionInEnglish = `The certificate of Belgian nationality is granted to citizens who have acquired Belgian nationality through the procedure of nationality declaration or naturalisation.`;

        await verifyInstanceInUI(title, titleInEnglish, description, descriptionInEnglish);
        await verifyPublishmentInIPDC(
            title,
            expect.arrayContaining([{ "@language": 'nl-be-x-informal', "@value": title }, { "@language": 'en', "@value": titleInEnglish }]),
            description,
            expect.arrayContaining([{ "@language": 'nl-be-x-informal', "@value": expect.stringContaining(description) }, { "@language": 'en', "@value": expect.stringContaining(descriptionInEnglish) }]),
            expect.arrayContaining([{ "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" },
            { "@id": "http://data.lblod.info/id/bestuurseenheden/c5623baf3970c5efa9746dff01afd43092c1321a47316dbe81ed79604b56e8ea" }]),
            expect.objectContaining({ "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2024-02-14T13:42:12.357Z" }),
            expect.objectContaining({ "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2024-02-14T13:59:25.237Z" }));
    });

    test('Verify a minimal instance was created and updated from instance snapshot from ldes stream and verify its publishment to ipdc', async () => {

        const title = 'Minimalistische instantie updatet';
        const description = `Beschrijving van de minimalistische instantie updatet`;

        await verifyInstanceInUI(title, undefined, description, undefined);
        await verifyPublishmentInIPDC(
            title,
            expect.arrayContaining([{ "@language": 'nl-be-x-informal', "@value": title }]),
            description,
            expect.arrayContaining([{ "@language": 'nl-be-x-informal', "@value": expect.stringContaining(description) }]),
            expect.arrayContaining([{ "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }]),
            expect.objectContaining({ "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2024-02-14T13:42:12.357Z" }),
            expect.objectContaining({ "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2024-02-15T14:59:30.236Z" }));
    });

    test('Verify an instance can be archived and again unarchived', async () => {
        const instanceId = uuid();
        const {title, description, isVersionOf} = await InstanceSnapshotLdesStub.createSnapshot(instanceId, false);

        await verifyInstanceInUI(title, undefined, description, undefined);

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        expect(instancePublishedInIpdc).toBeTruthy();

        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

        const {title: titleArchived} = await InstanceSnapshotLdesStub.createSnapshot(instanceId, true);    

        const archivedInstancePublishedInIpdc = await IpdcStub.findPublishedInstance({ tombstonedId: isVersionOf });
        expect(archivedInstancePublishedInIpdc).toBeTruthy();

        //TODO LPDC-910: add unarchiving ... 
    });

    async function verifyInstanceInUI(title: string, titleInEnglish: string | undefined, description: string, descriptionInEnglish: string | undefined) {
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
        if (titleInEnglish) {
            await expect(instantieDetailsPage.titelEngelsInput).not.toBeEditable();
            await expect(instantieDetailsPage.titelEngelsInput).toHaveValue(titleInEnglish);
        }

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(description);
        if (descriptionInEnglish) {
            await expect(instantieDetailsPage.beschrijvingEngelsEditor).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingEngelsReadonly.textContent()).toContain(descriptionInEnglish);
        }

        await expect(instantieDetailsPage.productOpnieuwBewerkenButton).toBeVisible();
    }

    async function verifyPublishmentInIPDC(title: string, titleExpection, description: string, descriptionExpectation, competentAuthorityExpectation, dateCreateExpectation: any | undefined, dateModifiedExpectation: any | undefined) {
        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        expect(instancePublishedInIpdc).toBeTruthy();

        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

        expect(publicService['http://purl.org/dc/terms/title']).toEqual(titleExpection);
        expect(publicService['http://purl.org/dc/terms/description']).toEqual(descriptionExpectation);

        expect(publicService['http://data.europa.eu/m8g/hasCompetentAuthority']).toEqual(competentAuthorityExpectation);

        expect(publicService['http://mu.semte.ch/vocabularies/core/uuid']).toHaveLength(1);

        if(dateCreateExpectation) {
        expect(publicService['http://purl.org/dc/terms/created']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/created'][0]).toEqual(dateCreateExpectation);
    }

        if(dateModifiedExpectation) {
        expect(publicService['http://purl.org/dc/terms/modified']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/modified'][0]).toEqual(dateModifiedExpectation);
        }

        expect(publicService['http://purl.org/dc/terms/spatial']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/spatial']).toEqual(expect.arrayContaining([
            { "@id": "http://vocab.belgif.be/auth/refnis2019/44021" }
        ]));

        expect(publicService['http://purl.org/pav/createdBy']).toHaveLength(1);
        expect(publicService['http://purl.org/pav/createdBy'][0]).toEqual(
            { "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }
        );

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority']).toHaveLength(1);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority']).toEqual(expect.arrayContaining([
            { "@id": "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5" }
        ]));
    }


});


