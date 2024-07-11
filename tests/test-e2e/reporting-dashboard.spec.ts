import { APIRequestContext, expect, Page, test } from '@playwright/test';
import { lpdcUrl, reportGenerationUrl } from "../test-api/test-helpers/test-options";
import { MockLoginPage } from "./pages/mock-login-page";
import { first_row } from "./components/table";
import fs from "fs";
import { UJeModal } from "./modals/u-je-modal";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { ConceptDetailsPage } from "./pages/concept-details-page";
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { v4 as uuid } from "uuid";
import Papa from "papaparse";
import * as path from "path";
import { wait } from "./shared/shared";
import { pepingenId } from "../test-api/test-helpers/login";
import { InstanceStatus } from "../test-api/test-helpers/codelists";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { IpdcStub } from "./components/ipdc-stub";
import { WijzigingenBewarenModal } from "./modals/wijzigingen-bewaren-modal";
import { ProductOfDienstOpnieuwBewerkenModal } from "./modals/product-of-dienst-opnieuw-bewerken-modal";
import { ProductOfDienstVerwijderenModal } from "./modals/product-of-dienst-verwijderen-modal";
import {InstanceSnapshotLdesStub} from "./components/instance-snapshot-ldes-stub";

test.describe.configure({ mode: 'serial' });

test.describe('Reporting dashboard', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let wijzigingenBewarenModel: WijzigingenBewarenModal;
    let productOfDienstOpnieuwBewerkenModal: ProductOfDienstOpnieuwBewerkenModal;
    let productOfDienstVerwijderenModal: ProductOfDienstVerwijderenModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        wijzigingenBewarenModel = WijzigingenBewarenModal.create(page);
        productOfDienstOpnieuwBewerkenModal = ProductOfDienstOpnieuwBewerkenModal.create(page);
        productOfDienstVerwijderenModal = ProductOfDienstVerwijderenModal.create(page);
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Generate and view lpdcConceptsReport', async ({ request }) => {
        let instanceIri: string | undefined = undefined;
        page.on('request', request => {
            if (request.method() === 'GET'
                && request.url().startsWith(`${lpdcUrl}/lpdc-management/public-services/`)
                && request.url().includes(`/form/`)
            ) {
                instanceIri = extractIriFromURL(request.url());
            }
        });

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Pepingen');
        await mockLoginPage.login('Gemeente Pepingen');

        await homePage.expectToBeVisible();

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');
            await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
        });

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        const titel = await instantieDetailsPage.titelInput.inputValue();
        const newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);
        await instantieDetailsPage.titelInput.blur();
        await instantieDetailsPage.wijzigingenBewarenButton.click();
        await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

        // generate report
        const filePath = await generateReportManually(request, 'lpdcConceptsReport');
        const reportCsv = fs.readFileSync(filePath, "utf8");
        const report = Papa.parse(reportCsv, { header: true });

        const row = report.data.find(instance => instance.uriPublicService === instanceIri)
        expect(row).toBeDefined();
        expect(row.uriPublicService).toEqual(instanceIri);
        expect(row.uriBestuurseenheid).toEqual(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`);
        expect(row.naam).toEqual("Pepingen");
        expect(row.statusLabel).toEqual("Ontwerp");
        expect(row.status).toEqual(InstanceStatus.ontwerp);
        expect(row.concept).toEqual("https://ipdc.tni-vlaanderen.be/id/concept/705d401c-1a41-4802-a863-b22499f71b84");
    });

    test('Generate and view instancesStuckinPublishingForLPDCReport', async ({ request }) => {
        let instanceIri: string | undefined = undefined;
        try {
            page.on('request', request => {
                if (request.method() === 'GET'
                    && request.url().startsWith(`${lpdcUrl}/lpdc-management/public-services/`)
                    && request.url().includes(`/form/`)
                ) {
                    instanceIri = extractIriFromURL(request.url());
                }
            });

            await mockLoginPage.goto();
            await mockLoginPage.searchInput.fill('Pepingen');
            await mockLoginPage.login('Gemeente Pepingen');

            await homePage.expectToBeVisible();

            const uJeModal = UJeModal.create(page);
            await uJeModal.expectToBeVisible();
            await uJeModal.laterKiezenButton.click();
            await uJeModal.expectToBeClosed();

            await homePage.productOfDienstToevoegenButton.click();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');
                await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
            });
            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            const titel = await instantieDetailsPage.titelInput.inputValue();
            const newTitel = titel + uuid();
            await instantieDetailsPage.titelInput.fill(newTitel);
            await instantieDetailsPage.titelInput.blur();

            await instantieDetailsPage.eigenschappenTab.click();
            await wijzigingenBewarenModel.expectToBeVisible();
            await wijzigingenBewarenModel.bewaarButton.click();
            await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');
            await IpdcStub.publishShouldFail(instanceIri, 400, { message: "something went wrong" });
            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();
            await homePage.expectToBeVisible();

            // generate report
            const row = await retry<Promise<any>>(
                async () => {
                    const filePath = await generateReportManually(request, 'instancesStuckinPublishingForLPDCReport');
                    const reportCsv = fs.readFileSync(filePath, "utf8");
                    const report = Papa.parse(reportCsv, { header: true });
                    return report.data.find(instance => instance.publicService === instanceIri)
                },
                (row) => row !== undefined
            );
            expect(row).toBeDefined();
            expect(row.publicService).toEqual(instanceIri);
            expect(row.type).toEqual('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService');
            expect(row.title).toEqual(newTitel);
            expect(row.bestuurseenheidLabel).toEqual('Pepingen');
            expect(row.classificatieLabel).toEqual('Gemeente');
            expect(row.errorCode).toEqual("400");
            expect(row.errorMessage).toEqual("{\"message\":\"something went wrong\"}");
            expect(row.datePublishAttempt).not.toEqual("");
            expect(row.lastSentDate).not.toEqual("");
        } finally {
            await IpdcStub.publishShouldNotFail(instanceIri);
        }
    });

    test('Generate and view instancesStuckinPublishingForLPDCReport for republished instance', async ({ request }) => {
        let instanceIri: string | undefined = undefined;
        try {

            page.on('request', request => {
                if (request.method() === 'GET'
                    && request.url().startsWith(`${lpdcUrl}/lpdc-management/public-services/`)
                    && request.url().includes(`/form/`)
                ) {
                    instanceIri = extractIriFromURL(request.url());
                }
            });

            await mockLoginPage.goto();
            await mockLoginPage.searchInput.fill('Pepingen');
            await mockLoginPage.login('Gemeente Pepingen');

            await homePage.expectToBeVisible();

            const uJeModal = UJeModal.create(page);
            await uJeModal.expectToBeVisible();
            await uJeModal.laterKiezenButton.click();
            await uJeModal.expectToBeClosed();

            await homePage.productOfDienstToevoegenButton.click();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');
                await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
            });

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            const titel = await instantieDetailsPage.titelInput.inputValue();
            const newTitel = titel + uuid();
            await instantieDetailsPage.titelInput.fill(newTitel);
            await instantieDetailsPage.titelInput.blur();

            await instantieDetailsPage.eigenschappenTab.click();
            await wijzigingenBewarenModel.expectToBeVisible();
            await wijzigingenBewarenModel.bewaarButton.click();
            await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');
            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();
            await homePage.expectToBeVisible();
            await IpdcStub.findPublishedInstance({
                title: newTitel,
                expectedFormalOrInformalTripleLanguage: 'nl-be-x-formal'
            });

            await homePage.searchInput.fill(newTitel);
            await homePage.resultTable.row(first_row).link(newTitel).click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toHaveText(newTitel);

            await instantieDetailsPage.productOpnieuwBewerkenButton.click();
            await productOfDienstOpnieuwBewerkenModal.productOpnieuwBewerkenButton.click();
            await IpdcStub.publishShouldFail(instanceIri, 400, { message: "something went wrong when republishing" });
            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();
            await homePage.expectToBeVisible();

            // generate report
            const row = await retry<Promise<any>>(
                async () => {
                    const filePath = await generateReportManually(request, 'instancesStuckinPublishingForLPDCReport');
                    const reportCsv = fs.readFileSync(filePath, "utf8");
                    const report = Papa.parse(reportCsv, { header: true });
                    return report.data.find(instance => instance.publicService === instanceIri)
                },
                (row) => row !== undefined
            );
            expect(row).toBeDefined();
            expect(row.publicService).toEqual(instanceIri);
            expect(row.type).toEqual('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService');
            expect(row.title).toEqual(newTitel);
            expect(row.bestuurseenheidLabel).toEqual('Pepingen');
            expect(row.classificatieLabel).toEqual('Gemeente');
            expect(row.errorCode).toEqual("400");
            expect(row.errorMessage).toEqual("{\"message\":\"something went wrong when republishing\"}");
            expect(row.datePublishAttempt).not.toEqual("");
            expect(row.lastSentDate).not.toEqual("");
        }
        finally {
            await IpdcStub.publishShouldNotFail(instanceIri);
        }
    });

    test('Generate and view instancesStuckinPublishingForLPDCReport for deleted instance', async ({ request }) => {
        let instanceIri: string | undefined = undefined;
        try {

            page.on('request', request => {
                if (request.method() === 'GET'
                    && request.url().startsWith(`${lpdcUrl}/lpdc-management/public-services/`)
                    && request.url().includes(`/form/`)
                ) {
                    instanceIri = extractIriFromURL(request.url());
                }
            });

            await mockLoginPage.goto();
            await mockLoginPage.searchInput.fill('Pepingen');
            await mockLoginPage.login('Gemeente Pepingen');

            await homePage.expectToBeVisible();

            const uJeModal = UJeModal.create(page);
            await uJeModal.expectToBeVisible();
            await uJeModal.laterKiezenButton.click();
            await uJeModal.expectToBeClosed();

            await homePage.productOfDienstToevoegenButton.click();

            await toevoegenPage.expectToBeVisible();
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchInput.fill('Akte van Belgische nationaliteit');
                await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();
            });

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            const titel = await instantieDetailsPage.titelInput.inputValue();
            const newTitel = titel + uuid();
            await instantieDetailsPage.titelInput.fill(newTitel);
            await instantieDetailsPage.titelInput.blur();

            await instantieDetailsPage.eigenschappenTab.click();
            await wijzigingenBewarenModel.expectToBeVisible();
            await wijzigingenBewarenModel.bewaarButton.click();
            await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');
            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();
            await homePage.expectToBeVisible();
            await IpdcStub.findPublishedInstance({
                title: newTitel,
                expectedFormalOrInformalTripleLanguage: 'nl-be-x-formal'
            });

            await homePage.searchInput.fill(newTitel);
            await homePage.resultTable.row(first_row).link(newTitel).click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toHaveText(newTitel);

            await instantieDetailsPage.productOpnieuwBewerkenButton.click();
            await productOfDienstOpnieuwBewerkenModal.productOpnieuwBewerkenButton.click();
            await IpdcStub.publishShouldFail(instanceIri, 400, { message: "something went wrong when deleting" });
            await instantieDetailsPage.actiesMenu.expectToBeVisible();
            await instantieDetailsPage.actiesMenu.locator.click();
            await instantieDetailsPage.actiesMenu.productVerwijderenButton.click();

            await productOfDienstVerwijderenModal.expectToBeVisible();
            await productOfDienstVerwijderenModal.verwijderenButton.click();

            const row = await retry<Promise<any>>(
                async () => {
                    const filePath = await generateReportManually(request, 'instancesStuckinPublishingForLPDCReport');
                    const reportCsv = fs.readFileSync(filePath, "utf8");
                    const report = Papa.parse(reportCsv, { header: true });
                    return report.data.find(instance => instance.publicService === instanceIri)
                },
                (row) => row !== undefined
            );
            expect(row).toBeDefined();
            expect(row.publicService).toEqual(instanceIri);
            expect(row.type).toEqual('https://www.w3.org/ns/activitystreams#Tombstone');
            expect(row.title).toEqual("");
            expect(row.bestuurseenheidLabel).toEqual('Pepingen');
            expect(row.classificatieLabel).toEqual('Gemeente');
            expect(row.errorCode).toEqual("400");
            expect(row.errorMessage).toEqual("{\"message\":\"something went wrong when deleting\"}");
            expect(row.datePublishAttempt).not.toEqual("");
            expect(row.lastSentDate).not.toEqual("");
        }
        finally {
            await IpdcStub.publishShouldNotFail(instanceIri);
        }
    });

    test('Generate and view instanceSnapshotProcessingReport', async ({ request }) => {
        const instanceId = uuid();
        const snapshot1 = await InstanceSnapshotLdesStub.createSnapshot(instanceId, false);
        const snapshot2 = await InstanceSnapshotLdesStub.createInvalidSnapshot(instanceId);

        const {rowSnapshot1, rowSnapshot2} = await retry<Promise<any>>(
            async () => {
                const filePath = await generateReportManually(request, 'instanceSnapshotProcessingReport');
                const reportCsv = fs.readFileSync(filePath, "utf8");
                const report = Papa.parse(reportCsv, { header: true });
                return {
                    rowSnapshot1: report.data.find(reportRow => reportRow.snapshotId === snapshot1.id),
                    rowSnapshot2: report.data.find(reportRow => reportRow.snapshotId === snapshot2.id),
                };
            },
            (row) => row !== undefined
        );

        expect(rowSnapshot1).toEqual({
            bestuurseenheidId: 'http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5',
            bestuurseenheidLabel: 'Gent',
            classificatieLabel: 'Gemeente',
            dateProcessed: expect.anything(),
            ldesGraph: 'http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/gent',
            processedError: '',
            processedId: expect.anything(),
            processedStatus: 'success',
            snapshotGeneratedAtTime: expect.anything(),
            snapshotId: snapshot1.id,
            snapshotTitle: snapshot1.title,
            snapshotVersionOfInstanceId: snapshot1.isVersionOf,
        });

        expect(rowSnapshot2).toEqual({
            bestuurseenheidId: 'http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5',
            bestuurseenheidLabel: 'Gent',
            classificatieLabel: 'Gemeente',
            dateProcessed: expect.anything(),
            ldesGraph: 'http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/gent',
            processedError: 'All retries failed. Last error: Error: title mag niet ontbreken',
            processedId: expect.anything(),
            processedStatus: 'failed',
            snapshotGeneratedAtTime: expect.anything(),
            snapshotId: snapshot2.id,
            snapshotTitle: snapshot2.title,
            snapshotVersionOfInstanceId: snapshot2.isVersionOf,
        });
    })

    test('Generate and view conceptSnapshotProcessingReport', async ({ request }) => {
        const conceptId = uuid();
        const snapshot1 = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
        const snapshot2 = await IpdcStub.createInvalidSnapshot(conceptId);

        const {rowSnapshot1, rowSnapshot2} = await retry<Promise<any>>(
            async () => {
                const filePath = await generateReportManually(request, 'conceptSnapshotProcessingReport');
                const reportCsv = fs.readFileSync(filePath, "utf8");
                const report = Papa.parse(reportCsv, { header: true });
                return {
                    rowSnapshot1: report.data.find(reportRow => reportRow.snapshotId === snapshot1.id),
                    rowSnapshot2: report.data.find(reportRow => reportRow.snapshotId === snapshot2.id),
                };
            },
            (row) => row !== undefined
        );

        expect(rowSnapshot1).toEqual({
            dateProcessed: expect.anything(),
            ldesGraph: 'http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc',
            processedError: '',
            processedId: expect.anything(),
            processedStatus: 'success',
            snapshotGeneratedAtTime: expect.anything(),
            snapshotId: snapshot1.id,
            snapshotTitle: snapshot1.title,
            snapshotVersionOfConceptId: snapshot1.jsonlddata.isVersionOf,
        });

        expect(rowSnapshot2).toEqual({
            dateProcessed: expect.anything(),
            ldesGraph: 'http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc',
            processedError: 'All retries failed. Last error: Error: title mag niet ontbreken',
            processedId: expect.anything(),
            processedStatus: 'failed',
            snapshotGeneratedAtTime: expect.anything(),
            snapshotId: snapshot2.id,
            snapshotTitle: "",
            snapshotVersionOfConceptId: snapshot2.jsonlddata.isVersionOf,
        });
    })
});

async function generateReportManually(request: APIRequestContext, reportName: string) {
    const fileDir = './data-tests/files/';
    const filesToRemove = fs.readdirSync(fileDir);
    filesToRemove.forEach(file => fs.unlinkSync(path.join(fileDir, file)));
    await request.post(`${reportGenerationUrl}/reports`, {
        data: {
            data: {
                attributes: {
                    reportName: reportName
                }
            }
        }
    });
    const fileName = await readFileWithRetry(fileDir);
    return path.join(fileDir, fileName)
}

function extractIriFromURL(url: string): string {
    const decodedURL = decodeURIComponent(url);
    const startIri = decodedURL.indexOf('http://data.lblod.info/id/public-service/');
    const endIri = decodedURL.indexOf("/form/", startIri);
    return decodedURL.substring(startIri, endIri);
}

async function readFileWithRetry(fileDir: string): Promise<string> {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
        const files = fs.readdirSync(fileDir);
        if (files.length) {
            return files[0];
        }
        await wait(1000);
    }
}

async function retry<T>(action: () => Promise<T>, untilCondition: (actionResult: T) => boolean) {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
        const actionResult = await action();
        if (untilCondition(actionResult)) {
            return actionResult;
        }
        console.log('retry ' + i + ' times');
        await wait(1000);
    }
}