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

        await verifyInstanceInUI(title, description);
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
        const additionalDescription = `Verdere beschrijving`;
        const additionalDescriptionInEnglish = `The certificate states:the last name, first names, date and place of birth of the person to whom the certificate relatesthe legal foundation of the declaration on the basis of which the certificate was drawn upin the case nationality is granted on the basis of Articles 8, § 1, 2°, b), 9, 2°, b), and 11, § 2, of the Belgian Nationality Code: the last name, first names, date and place of birth of the declarant or declarants.Under certain conditions, you can request a copy of or an extract from the certificate of Belgian nationality:A copy contains the original data of the certificate and the history of the status of the person to whom the certificate relates.An extract, on the contrary, only states the current details of the certificate, without stating the history of the status of the person to whom the certificate relates. Therefore, an extract only shows the current status of the data.`;
        const exceptions = `uitzonderingen`;
        const exceptionsInEnglish = `Exceptions`;
        const requirementsTitle = 'Voorwaarden';
        const requirementsTitleInEnglish = 'Requirements';
        const requirementsDescription = 'De akte vermeldt:de naam, de voornamen, de geboortedatum en de geboorteplaats van de persoon op wie de akte betrekking heeftde wettelijke basis van de verklaring op basis waarvan de akte werd opgesteldin geval van nationaliteitstoekenning op basis van de artikelen 8, § 1, 2°, b), 9, 2°, b), en 11, § 2, van het Wetboek van de Belgische nationaliteit: de naam, de voornamen, de geboortedatum en de geboorteplaats van de verklaarder of verklaarders.Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen:Een afschrift vermeldt de oorspronkelijke gegevens van de akte en de historiek van de staat van de persoon op wie de akte betrekking heeft.Een uittreksel vermeldt daarentegen enkel de actuele gegevens van de akte, zonder vermelding van de historiek van de staat van de persoon op wie de akte betrekking heeft. Op een uittreksel is dus enkel de huidige toestand van de gegevens zichtbaar.Wie kan een afschrift of uittreksel aanvragen?Voor akten van Belgische nationaliteit wordt het recht op een afschrift of uittreksel beperkt tot:uzelfde echtgeno(o)te, overlevende echtgeno(o)te of wettelijk samenwonendeuw wettelijke vertegenwoordiger (bv. ouder, voogd, bewindvoerder)bloedverwanten in opgaande of neerdalende lijn (geen aanverwanten en zijtakken)uw erfgenamenbijzondere gemachtigden zoals een notaris of advocaat.Als de akte meer dan 100 jaar oud is, heeft iedereen recht op een afschrift of uittreksel. - nl';
        const requirementsDescriptionInEnglish = 'The right to receive a copy of or an extract from certificates of Belgian nationality is limited to:yourselfyour spouse, surviving spouse, or legal cohabitantyour legal representative (e.g. a parent, guardian, conservator)blood relatives in the ascending or descending line (no relatives by affinity and side branches)your heirsspecial agents, such as notaries or lawyers.If the certificate is more than 100 years old, anyone is entitled to request a copy or an extract.';
        const evidenceTitle = 'Bewijs';
        const evidenceTitleInEnglish = 'Evidence';
        const evidenceDescription = 'Als u het document zelf ophaalt:uw eigen identiteitskaart.Als u het document voor iemand anders aanvraagt:een volmacht van de betrokkene en een kopie van zijn of haar identiteitskaartuw eigen identiteitskaart. - nl';
        const evidenceDescriptionInEnglish = 'If you collect the document yourself:your own identity card.If you are requesting the document for someone else:a power of attorney from that person and a copy of their identity cardas well as your own identity card.';
        const procedureTitle = 'Procedure - nl';
        const procedureTitleInEnglish = 'Procedure - en';
        const procedureDescription = `U kunt een afschrift of een uittreksel van de akte van nationaliteit aanvragen in uw gemeente.Als u beschikt over een elektronische identiteitskaart (eID), kunt u een afschrift of uittreksel van de akte online aanvragen:via het e-loket van uw gemeenteof via de attestenpagina van 'Mijn Burgerprofiel'.Die elektronische afschriften en uittreksels zijn voorzien van een elektronisch zegel van het Ministerie van Binnenlandse Zaken. Ze hebben dezelfde juridische waarde als deze afgeleverd door de gemeente. Zolang de informatie op het bewijs correct is, kunt u het geldig gebruiken in om het even welke vorm (op papier of in digitale vorm).Sinds 31 maart 2019 worden akten van de burgerlijke stand uitsluitend digitaal geregistreerd. Dateert uw akte van voor 31 maart 2019, dan is die misschien nog niet in digitale vorm beschikbaar. Sommige gemeenten digitaliseren oude archieven naarmate afschriften of uittreksels van de akten worden opgevraagd of wijzigingen worden aangebracht.`;
        const procedureDescriptionInEnglish = `You can request a copy of or an extract from the certificate of nationality from your municipality.If you have an electronic identity card (eID), you can request a copy of or an extract from the certificate onlinevia the e-desk of your municipalityor via the certificates page of ‘My Citizen Profile’ ‘Mijn Burgerprofiel’).Those electronic copies and extracts bear the electronic seal of the Ministry of the Interior. They have the same legal value as those issued by the municipality. As long as the information on the certificate is correct, you can use it validly in any format (on paper or in digital format).Since 31 March 2019, certificates from the register office are registered in digital format only. If your certificate dates from before 31 March 2019, it may not yet be available digitally. Some municipalities digitise old archives when copies of or extracts from the certificates are requested or changes are made.`;
        const procedureWebsiteTitle = 'Procedure website titel';
        const procedureWebsiteTitleInEnglish = 'Procedure website title';
        const procedureWebsiteDescription = 'Procedure website beschrijving';
        const procedureWebsiteDescriptionInEnglish = 'Procedure website description';
        const procedureWebsiteUrl = 'https://procedure-website.com';
        const costTitle = 'Bedrag kost';
        const costTitleInEnglish = 'Amount cost';
        const costDescription = 'De aanvraag en het attest zijn gratis.';
        const costDescriptionInEnglish = 'The application and certificate are free.';
        const financialAdvantageTitle = 'Financieel voordeel';
        const financialAdvantageTitleInEnglish = 'Financial advantage';
        const financialAdvantageDescription = 'Beschrijving financieel voordeel';
        const financialAdvantageDescriptionInEnglish = 'Description financial advantage';

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
        await expect(instantieDetailsPage.titelEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelEngelsInput).toHaveValue(titleInEnglish);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(description);
        await expect(instantieDetailsPage.beschrijvingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingEngelsReadonly.textContent()).toContain(descriptionInEnglish);

        await expect(instantieDetailsPage.aanvullendeBeschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingReadonly.textContent()).toContain(additionalDescription);
        await expect(instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingEngelsReadonly.textContent()).toContain(additionalDescriptionInEnglish);

        await expect(instantieDetailsPage.uitzonderingenEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenReadonly.textContent()).toContain(exceptions);
        await expect(instantieDetailsPage.uitzonderingenEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenEngelsReadonly.textContent()).toContain(exceptionsInEnglish);

        await expect(instantieDetailsPage.titelVoorwaardeInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelVoorwaardeInput(0)).toHaveValue(requirementsTitle + ' - 1');
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(0)).toHaveValue(requirementsTitleInEnglish + ' - 1');

        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly(0).textContent()).toContain(requirementsDescription + ' - 1');
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsReadonly(0).textContent()).toContain(requirementsDescriptionInEnglish + ' - 1');

        await expect(instantieDetailsPage.titelBewijsstukInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelBewijsstukInput(0)).toHaveValue(evidenceTitle + ' - 1');
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelBewijsstukEngelsInput(0)).toHaveValue(evidenceTitleInEnglish + ' - 1');

        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly(0).textContent()).toContain(evidenceDescription + ' - 1');
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsReadonly(0).textContent()).toContain(evidenceDescriptionInEnglish + ' - 1');        

        await expect(instantieDetailsPage.titelVoorwaardeInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelVoorwaardeInput(1)).toHaveValue(requirementsTitle + ' - 2');
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelVoorwaardeEngelsInput(1)).toHaveValue(requirementsTitleInEnglish + ' - 2');

        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly(1).textContent()).toContain(requirementsDescription + ' - 2');
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsReadonly(1).textContent()).toContain(requirementsDescriptionInEnglish + ' - 2');

        await expect(instantieDetailsPage.titelBewijsstukInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelBewijsstukInput(1)).toHaveValue(evidenceTitle + ' - 2');
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelBewijsstukEngelsInput(1)).toHaveValue(evidenceTitleInEnglish + ' - 2');

        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly(1).textContent()).toContain(evidenceDescription + ' - 2');
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsReadonly(1).textContent()).toContain(evidenceDescriptionInEnglish + ' - 2');                

        await expect(instantieDetailsPage.titelProcedureInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelProcedureInput(0)).toHaveValue(procedureTitle + ' - 1');
        await expect(instantieDetailsPage.titelProcedureEngelsInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelProcedureEngelsInput(0)).toHaveValue(procedureTitleInEnglish + ' - 1');

        await expect(instantieDetailsPage.beschrijvingProcedureEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly(0).textContent()).toContain(procedureDescription + ' - 1');
        await expect(instantieDetailsPage.beschrijvingProcedureEngelsEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsReadonly(0).textContent()).toContain(procedureDescriptionInEnglish + ' - 1');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 0)).toHaveValue(procedureWebsiteTitle + ' - 1 - 1');
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(0, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(0, 0)).toHaveValue(procedureWebsiteTitleInEnglish + ' - 1 - 1');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(0, 0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(0, 0).textContent()).toContain(procedureWebsiteDescription + ' - 1 - 1');
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor(0, 0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(0, 0).textContent()).toContain(procedureWebsiteDescriptionInEnglish + ' - 1 - 1');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(0, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(0, 0)).toHaveValue(procedureWebsiteUrl + '11');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 0)).toHaveValue(procedureWebsiteTitle + ' - 1 - 2');
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(1, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(1, 0)).toHaveValue(procedureWebsiteTitleInEnglish + ' - 1 - 2');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(1, 0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(1, 0).textContent()).toContain(procedureWebsiteDescription + ' - 1 - 2');
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor(1, 0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(1, 0).textContent()).toContain(procedureWebsiteDescriptionInEnglish + ' - 1 - 2');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(1, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(1, 0)).toHaveValue(procedureWebsiteUrl + '12');

        await expect(instantieDetailsPage.titelProcedureInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelProcedureInput(1)).toHaveValue(procedureTitle + ' - 2');
        await expect(instantieDetailsPage.titelProcedureEngelsInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelProcedureEngelsInput(1)).toHaveValue(procedureTitleInEnglish + ' - 2');

        await expect(instantieDetailsPage.beschrijvingProcedureEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly(1).textContent()).toContain(procedureDescription + ' - 2');
        await expect(instantieDetailsPage.beschrijvingProcedureEngelsEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsReadonly(1).textContent()).toContain(procedureDescriptionInEnglish + ' - 2');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 1)).toHaveValue(procedureWebsiteTitle + ' - 2 - 1');
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(0, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(0, 1)).toHaveValue(procedureWebsiteTitleInEnglish + ' - 2 - 1');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(0, 1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(0, 1).textContent()).toContain(procedureWebsiteDescription + ' - 2 - 1');
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor(0, 1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(0, 1).textContent()).toContain(procedureWebsiteDescriptionInEnglish + ' - 2 - 1');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(0, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(0, 1)).toHaveValue(procedureWebsiteUrl + '21');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 1)).toHaveValue(procedureWebsiteTitle + ' - 2 - 2');
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(1, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(1, 1)).toHaveValue(procedureWebsiteTitleInEnglish + ' - 2 - 2');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(1, 1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(1, 1).textContent()).toContain(procedureWebsiteDescription + ' - 2 - 2');
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor(1, 1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(1, 1).textContent()).toContain(procedureWebsiteDescriptionInEnglish + ' - 2 - 2');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(1, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(1, 1)).toHaveValue(procedureWebsiteUrl + '22');

        await expect(instantieDetailsPage.titelKostInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelKostInput(0)).toHaveValue(costTitle + ' - 1');
        await expect(instantieDetailsPage.titelKostEngelsInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelKostEngelsInput(0)).toHaveValue(costTitleInEnglish + ' - 1');

        await expect(instantieDetailsPage.beschrijvingKostEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly(0).textContent()).toContain(costDescription + ' - 1');
        await expect(instantieDetailsPage.beschrijvingKostEngelsEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostEngelsReadonly(0).textContent()).toContain(costDescriptionInEnglish + ' - 1');

        await expect(instantieDetailsPage.titelKostInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelKostInput(1)).toHaveValue(costTitle + ' - 2');
        await expect(instantieDetailsPage.titelKostEngelsInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelKostEngelsInput(1)).toHaveValue(costTitleInEnglish + ' - 2');

        await expect(instantieDetailsPage.beschrijvingKostEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly(1).textContent()).toContain(costDescription + ' - 2');
        await expect(instantieDetailsPage.beschrijvingKostEngelsEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostEngelsReadonly(1).textContent()).toContain(costDescriptionInEnglish + ' - 2');

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelFinancieelVoordeelInput(0)).toHaveValue(financialAdvantageTitle + ' - 1');
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelFinancieelVoordeelEngelsInput(0)).toHaveValue(financialAdvantageTitleInEnglish + ' - 1');

        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly(0).textContent()).toContain(financialAdvantageDescription + ' - 1');
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsReadonly(0).textContent()).toContain(financialAdvantageDescriptionInEnglish + ' - 1');

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelFinancieelVoordeelInput(1)).toHaveValue(financialAdvantageTitle + ' - 2');
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelFinancieelVoordeelEngelsInput(1)).toHaveValue(financialAdvantageTitleInEnglish + ' - 2');

        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly(1).textContent()).toContain(financialAdvantageDescription + ' - 2');
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsReadonly(1).textContent()).toContain(financialAdvantageDescriptionInEnglish + ' - 2');


        await expect(instantieDetailsPage.productOpnieuwBewerkenButton).toBeVisible();        

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

        await verifyInstanceInUI(title, description);
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

        await verifyInstanceInUI(title, description);

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        expect(instancePublishedInIpdc).toBeTruthy();

        const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

        const {title: titleArchived} = await InstanceSnapshotLdesStub.createSnapshot(instanceId, true);    

        const archivedInstancePublishedInIpdc = await IpdcStub.findPublishedInstance({ tombstonedId: isVersionOf });
        expect(archivedInstancePublishedInIpdc).toBeTruthy();

        //TODO LPDC-910: add unarchiving ... 
    });

    async function verifyInstanceInUI(title: string, description: string) {
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


