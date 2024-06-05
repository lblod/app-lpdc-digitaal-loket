import { test, expect, Page } from '@playwright/test';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { first_row } from './components/table';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { IpdcStub } from './components/ipdc-stub';
import { InstanceSnapshotLdesStub, Snapshot } from "./components/instance-snapshot-ldes-stub";
import { Language } from "../test-api/test-helpers/language";
import { v4 as uuid } from 'uuid';
import { verifyInstancePublishedOnIPDC } from './shared/verify-instance-published-on-ipdc';

test.describe.configure({ mode: 'parallel' });

test.describe('Instance Snapshot to Instance and published to IPDC Flow', () => {

    //note: Gent is chosen as an example of a instance snapshot through ldes provider

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let instantieDetailsPage: InstantieDetailsPage;
    const bestuurseenheidUriGent = `http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`;

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

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        verifyInstancePublishedOnIPDC(
            instancePublishedInIpdc,
            {
                titel: { nl: title },
                beschrijving: { nl: description },
                uuid: `PRESENT`,
                createdBy: bestuurseenheidUriGent,
                aangemaaktOp: `2024-02-20T11:42:12.357Z`,
                bevoegdeOverheden: [`http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`],
                uitvoerendeOverheden: [`http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`],
                geografischeToepassingsgebieden: [`http://data.europa.eu/nuts/code/BE23444021`],
            },
            'nl-be-x-informal');
    });

    test('Verify a full instance was created from instance snapshot from ldes stream and verify its publishment to ipdc', async () => {

        const title = 'Akte van Belgische nationaliteit';
        const description = `De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen.`;
        const additionalDescription = `Verdere beschrijving`;
        const exceptions = `uitzonderingen`;
        const requirementsTitle = 'Voorwaarden';
        const requirementsDescriptionUnsanitized = `De akte vermeldt:<ul><li>de naam, de voornamen, de geboortedatum en de geboorteplaats van de persoon op wie de akte betrekking heeft</li><li>de wettelijke basis van de verklaring op basis waarvan de akte werd opgesteld</li><li>in geval van nationaliteitstoekenning op basis van de artikelen 8, § 1, 2°, b), 9, 2°, b), en 11, § 2, van het Wetboek van de Belgische nationaliteit: de naam, de voornamen, de geboortedatum en de geboorteplaats van de verklaarder of verklaarders.</li></ul>Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen:<ul><li>Een afschrift vermeldt de oorspronkelijke gegevens van de akte en de historiek van de staat van de persoon op wie de akte betrekking heeft.</li><li>Een uittreksel vermeldt daarentegen enkel de actuele gegevens van de akte, zonder vermelding van de historiek van de staat van de persoon op wie de akte betrekking heeft. Op een uittreksel is dus enkel de huidige toestand van de gegevens zichtbaar.</li></ul><h3>Wie kan een afschrift of uittreksel aanvragen?</h3>Voor akten van Belgische nationaliteit wordt het recht op een afschrift of uittreksel beperkt tot:<ul><li>uzelf</li><li>de echtgeno(o)te, overlevende echtgeno(o)te of wettelijk samenwonende</li><li>uw wettelijke vertegenwoordiger (bv. ouder, voogd, bewindvoerder)</li><li>bloedverwanten in opgaande of neerdalende lijn (geen aanverwanten en zijtakken)</li><li>uw erfgenamen</li><li>bijzondere gemachtigden zoals een notaris of advocaat.</li></ul>Als de akte meer dan 100 jaar oud is, heeft iedereen recht op een afschrift of uittreksel. - nl`;
        const requirementsDescription = requirementsDescriptionUnsanitized.replace(/<ul>/g, '').replace(/<\/ul>/g, '').replace(/<li>/g, '').replace(/<\/li>/g, '').replace(/<\/h3>/g, '').replace(/<h3>/g, '');
        const evidenceTitle = 'Bewijs';
        const evidenceDescriptionUnsanitized = `Als u het document zelf ophaalt:<ul><li>uw eigen identiteitskaart.</li></ul>Als u het document voor iemand anders aanvraagt:<ul><li>een volmacht van de betrokkene en een kopie van zijn of haar identiteitskaart</li><li>uw eigen identiteitskaart.</li></ul> - nl`;
        const evidenceDescription = evidenceDescriptionUnsanitized.replace(/<ul>/g, '').replace(/<\/ul>/g, '').replace(/<li>/g, '').replace(/<\/li>/g, '');
        const procedureTitle = 'Procedure - nl';
        const procedureDescriptionUnsanitized = `U kunt een afschrift of een uittreksel van de akte van nationaliteit aanvragen in uw gemeente.Als u beschikt over een elektronische identiteitskaart (eID), kunt u een afschrift of uittreksel van de akte online aanvragen:<ul><li>via het e-loket van uw gemeente</li><li>of via de attestenpagina van 'Mijn Burgerprofiel'.</li></ul>Die elektronische afschriften en uittreksels zijn voorzien van een elektronisch zegel van het Ministerie van Binnenlandse Zaken. Ze hebben dezelfde juridische waarde als deze afgeleverd door de gemeente. Zolang de informatie op het bewijs correct is, kunt u het geldig gebruiken in om het even welke vorm (op papier of in digitale vorm).Sinds 31 maart 2019 worden akten van de burgerlijke stand uitsluitend digitaal geregistreerd. Dateert uw akte van voor 31 maart 2019, dan is die misschien nog niet in digitale vorm beschikbaar. Sommige gemeenten digitaliseren oude archieven naarmate afschriften of uittreksels van de akten worden opgevraagd of wijzigingen worden aangebracht.`;
        const procedureDescription = procedureDescriptionUnsanitized.replace(/<ul>/g, '').replace(/<\/ul>/g, '').replace(/<li>/g, '').replace(/<\/li>/g, '');
        const procedureWebsiteTitle = 'Procedure website titel';
        const procedureWebsiteDescription = 'Procedure website beschrijving';
        const procedureWebsiteUrl = 'https://procedure-website.com';
        const costTitle = 'Bedrag kost';
        const costDescription = 'De aanvraag en het attest zijn gratis.';
        const financialAdvantageTitle = 'Financieel voordeel';
        const financialAdvantageDescription = 'Beschrijving financieel voordeel';
        const regulationDescription = 'Regelgeving';
        const legalResourceTitle = 'Titel regelgevende bron';
        const legalResourceDescription = 'Beschrijving regelgevende bron';
        const legalResourceUrl = 'https://codex.vlaanderen.be/regelgeving';
        const contactPointEmail = 'info@gent.be';
        const contactPointTelephone = '0412345678';
        const contactPointUrl = 'https://www.gent.be';
        const contactPointOpeningsHours = '24/24';
        const addressStraat1 = 'Burggravenlaan';
        const addressHuisnummer1 = '1';
        const addressBusnummer1 = 'a';
        const addressGemeente1 = 'Gent';
        const addressPostcode1 = '9000';
        const addressStraat2 = 'Burggravenlaantje';
        const addressHuisnummer2 = '15';
        const addressBusnummer2 = 'b';
        const addressGemeente2 = 'Gent-Sint-Pieter';
        const addressPostcode2 = '8000';
        const addressLand = 'België';
        const moreInfoWebsiteTitle = 'Website Belgische nationaliteit en naturalisatie beschrijving';
        const moreInfoWebsiteDescription = 'Website Belgische nationaliteit en naturalisatie beschrijving';
        const moreInfoWebsiteUrl = 'https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit'

        const linkedConceptUrl = 'https://ipdc.tni-vlaanderen.be/id/concept/705d401c-1a41-4802-a863-b22499f71b84';
        const linkedConceptProductId = '1502';
        const productType = 'Financieel voordeel';
        const productTypeAsIri = 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/FinancieelVoordeel';
        const dateCreatedFormatted = '14-02-2024 - 14:42';
        const dateCreated = `2024-02-14T13:42:12.357Z`;
        const dateModifiedFormatted = '14-02-2024 - 14:59';
        const dateModified = `2024-02-14T13:59:25.237Z`;
        const startDateFormatted = '26-08-2020';
        const startDate = '2020-08-26T11:40:20.026205Z';
        const endDateFormatted = '12-07-2025';
        const endDate = '2025-07-12T11:40:20.026205Z';
        const documentStatus = 'Verzonden';

        const targetAudiences = ['Burger', 'Onderneming'];
        const themes = ['Burger en Overheid', 'Cultuur, Sport en Vrije Tijd'];
        const themesAsIris = ['https://productencatalogus.data.vlaanderen.be/id/concept/Thema/BurgerOverheid', 'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/CultuurSportVrijeTijd']
        const languages = ['Engels', 'Nederlands'];
        const languagesAsIris = ['http://publications.europa.eu/resource/authority/language/ENG', 'http://publications.europa.eu/resource/authority/language/NLD']
        const competentAuthorityLevels = ['Europese overheid', 'Federale overheid'];
        const competentAuthorityLevelsAsIris = ['https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Europees', 'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Federaal']
        const competentAuthorities = ['Gent (Gemeente)', 'Gent (OCMW)'];
        const competentAuthoritiesAsIris = ['http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5', 'http://data.lblod.info/id/bestuurseenheden/c5623baf3970c5efa9746dff01afd43092c1321a47316dbe81ed79604b56e8ea']
        const executingAuthorityLevels = ['Derden', 'Lokale overheid'];
        const executingAuthorityLevelsAsIris = ['https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Derden', 'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Lokaal']
        const executingAuthorities = ['Gent (Gemeente)'];
        const executingAuthoritiesAsIris = ['http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5'];
        const spatials = ['Arrondissement Gent', 'Gent'];
        const spatialsAsIris = ['http://data.europa.eu/nuts/code/BE234', 'http://data.europa.eu/nuts/code/BE23444021'];
        const tags = ['Akte', 'Nationaliteit'];
        const publicationMedia = 'Your Europe';
        const publicationMediaAsIris = ['https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope'];
        const yourEuropeCategories = ['Nationale verkeersregels en voorschriften voor bestuurders', 'Voorwaarden voor naturalisatie'];
        const yourEuropeCategoriesAsIris = ['https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfNaturalisatie', 'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VoertuigenVerkeersregels'];

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(title);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(title);
        await expect(homePage.resultTable.row(first_row).locator).toContainText(documentStatus);

        await homePage.resultTable.row(first_row).link(title).click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.basisinformatieHeading).toBeVisible();

        await expect(instantieDetailsPage.titelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelInput).toHaveValue(title);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(description);

        await expect(instantieDetailsPage.aanvullendeBeschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingReadonly.textContent()).toContain(additionalDescription);

        await expect(instantieDetailsPage.uitzonderingenEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenReadonly.textContent()).toContain(exceptions);

        await expect(instantieDetailsPage.titelVoorwaardeInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelVoorwaardeInput(0)).toHaveValue(requirementsTitle + ' - 1');

        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly(0).textContent()).toContain(requirementsDescription + ' - 1');

        await expect(instantieDetailsPage.titelBewijsstukInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelBewijsstukInput(0)).toHaveValue(evidenceTitle + ' - 1');

        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly(0).textContent()).toContain(evidenceDescription + ' - 1');

        await expect(instantieDetailsPage.titelVoorwaardeInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelVoorwaardeInput(1)).toHaveValue(requirementsTitle + ' - 2');

        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly(1).textContent()).toContain(requirementsDescription + ' - 2');

        await expect(instantieDetailsPage.titelBewijsstukInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelBewijsstukInput(1)).toHaveValue(evidenceTitle + ' - 2');

        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly(1).textContent()).toContain(evidenceDescription + ' - 2');

        await expect(instantieDetailsPage.titelProcedureInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelProcedureInput(0)).toHaveValue(procedureTitle + ' - 1');

        await expect(instantieDetailsPage.beschrijvingProcedureEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly(0).textContent()).toContain(procedureDescription + ' - 1');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 0)).toHaveValue(procedureWebsiteTitle + ' - 1 - 1');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(0, 0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(0, 0).textContent()).toContain(procedureWebsiteDescription + ' - 1 - 1');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(0, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(0, 0)).toHaveValue(procedureWebsiteUrl + '11');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 0)).toHaveValue(procedureWebsiteTitle + ' - 1 - 2');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(1, 0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(1, 0).textContent()).toContain(procedureWebsiteDescription + ' - 1 - 2');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(1, 0)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(1, 0)).toHaveValue(procedureWebsiteUrl + '12');

        await expect(instantieDetailsPage.titelProcedureInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelProcedureInput(1)).toHaveValue(procedureTitle + ' - 2');

        await expect(instantieDetailsPage.beschrijvingProcedureEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly(1).textContent()).toContain(procedureDescription + ' - 2');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(0, 1)).toHaveValue(procedureWebsiteTitle + ' - 2 - 1');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(0, 1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(0, 1).textContent()).toContain(procedureWebsiteDescription + ' - 2 - 1');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(0, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(0, 1)).toHaveValue(procedureWebsiteUrl + '21');

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteVoorProcedureInput(1, 1)).toHaveValue(procedureWebsiteTitle + ' - 2 - 2');

        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(1, 1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(1, 1).textContent()).toContain(procedureWebsiteDescription + ' - 2 - 2');

        await expect(instantieDetailsPage.websiteURLVoorProcedureInput(1, 1)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLVoorProcedureInput(1, 1)).toHaveValue(procedureWebsiteUrl + '22');

        await expect(instantieDetailsPage.titelKostInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelKostInput(0)).toHaveValue(costTitle + ' - 1');

        await expect(instantieDetailsPage.beschrijvingKostEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly(0).textContent()).toContain(costDescription + ' - 1');

        await expect(instantieDetailsPage.titelKostInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelKostInput(1)).toHaveValue(costTitle + ' - 2');

        await expect(instantieDetailsPage.beschrijvingKostEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly(1).textContent()).toContain(costDescription + ' - 2');

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelFinancieelVoordeelInput(0)).toHaveValue(financialAdvantageTitle + ' - 1');

        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly(0).textContent()).toContain(financialAdvantageDescription + ' - 1');

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelFinancieelVoordeelInput(1)).toHaveValue(financialAdvantageTitle + ' - 2');

        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly(1).textContent()).toContain(financialAdvantageDescription + ' - 2');

        await expect(instantieDetailsPage.beschrijvingRegelgevingEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevingReadonly().textContent()).toContain(regulationDescription);

        await expect(instantieDetailsPage.titelRegelgevendeBronInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelRegelgevendeBronInput(0)).toHaveValue(legalResourceTitle + ' - 1');
        await expect(instantieDetailsPage.beschrijvingRegelgevendeBronEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronReadonly(0).textContent()).toContain(legalResourceDescription + ' - 1');
        await expect(instantieDetailsPage.regelgevendeBronUrlInput(0)).not.toBeEditable();
        await expect(await instantieDetailsPage.regelgevendeBronUrlInput(0)).toHaveValue(legalResourceUrl + '1');

        await expect(instantieDetailsPage.titelRegelgevendeBronInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelRegelgevendeBronInput(1)).toHaveValue(legalResourceTitle + ' - 2');
        await expect(instantieDetailsPage.beschrijvingRegelgevendeBronEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronReadonly(1).textContent()).toContain(legalResourceDescription + ' - 2');
        await expect(instantieDetailsPage.regelgevendeBronUrlInput(1)).not.toBeEditable();
        await expect(await instantieDetailsPage.regelgevendeBronUrlInput(1)).toHaveValue(legalResourceUrl + '2');

        await expect(instantieDetailsPage.contactpuntEmailReadonly(0, 0)).toHaveValue(contactPointEmail + '1');
        await expect(instantieDetailsPage.contactpuntTelefoonReadonly(0, 0)).toHaveValue(contactPointTelephone + '1');
        await expect(instantieDetailsPage.contactpuntWebsiteURLReadonly(0)).toHaveValue(contactPointUrl + '1');
        await expect(instantieDetailsPage.contactpuntOpeningsurenReadonly(0)).toHaveValue(contactPointOpeningsHours + ' - 1');

        await expect(instantieDetailsPage.contactpuntAdresGemeenteSelect(0).selectedItem).toContainText(addressGemeente1);
        await expect(instantieDetailsPage.contactpuntAdresStraatSelect(0).selectedItem).toContainText(addressStraat1);
        await expect(instantieDetailsPage.contactpuntAdresHuisnummerInput(0)).toHaveValue(addressHuisnummer1);
        await expect(instantieDetailsPage.contactpuntAdresBusnummerInput(0)).toHaveValue(addressBusnummer1);

        await expect(instantieDetailsPage.contactpuntEmailReadonly(0, 1)).toHaveValue(contactPointEmail + '2');
        await expect(instantieDetailsPage.contactpuntTelefoonReadonly(0, 1)).toHaveValue(contactPointTelephone + '2');
        await expect(instantieDetailsPage.contactpuntWebsiteURLReadonly(1)).toHaveValue(contactPointUrl + '2');
        await expect(instantieDetailsPage.contactpuntOpeningsurenReadonly(1)).toHaveValue(contactPointOpeningsHours + ' - 2');

        await expect(instantieDetailsPage.contactpuntAdresGemeenteSelect(1).selectedItem).toContainText(addressGemeente2);
        await expect(instantieDetailsPage.contactpuntAdresStraatSelect(1).selectedItem).toContainText(addressStraat2);
        await expect(instantieDetailsPage.contactpuntAdresHuisnummerInput(1)).toHaveValue(addressHuisnummer2);
        await expect(instantieDetailsPage.contactpuntAdresBusnummerInput(1)).toHaveValue(addressBusnummer2);

        await expect(instantieDetailsPage.titelWebsiteInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteInput(0)).toHaveValue(moreInfoWebsiteTitle + ' - 1');

        await expect(instantieDetailsPage.beschrijvingWebsiteEditor(0)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteReadonly(0).textContent()).toContain(moreInfoWebsiteDescription + ' - 1');

        await expect(instantieDetailsPage.websiteURLInput(0)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLInput(0)).toHaveValue(moreInfoWebsiteUrl + '1');

        await expect(instantieDetailsPage.titelWebsiteInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.titelWebsiteInput(1)).toHaveValue(moreInfoWebsiteTitle + ' - 2');

        await expect(instantieDetailsPage.beschrijvingWebsiteEditor(1)).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteReadonly(1).textContent()).toContain(moreInfoWebsiteDescription + ' - 2');

        await expect(instantieDetailsPage.websiteURLInput(1)).not.toBeEditable();
        expect(await instantieDetailsPage.websiteURLInput(1)).toHaveValue(moreInfoWebsiteUrl + '2');

        await expect(instantieDetailsPage.ipdcConceptIdHeader).toContainText(linkedConceptProductId);
        await expect(instantieDetailsPage.productTypeHeader).toContainText(productType);
        await expect(instantieDetailsPage.aangemaaktOpHeader).toContainText(dateCreatedFormatted);
        await expect(instantieDetailsPage.bewerktOpHeader).toContainText(dateModifiedFormatted);
        await expect(instantieDetailsPage.geldigVanafHeader).toContainText(startDateFormatted);
        await expect(instantieDetailsPage.geldigTotHeader).toContainText(endDateFormatted);
        await expect(instantieDetailsPage.statusHeader).toContainText(documentStatus);

        await instantieDetailsPage.eigenschappenTab.click();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        await expect(instantieDetailsPage.geldigVanafHeader).toContainText(startDateFormatted);
        await expect(instantieDetailsPage.geldigTotHeader).toContainText(endDateFormatted);

        await expect(instantieDetailsPage.statusHeader).toContainText(documentStatus);

        await expect(instantieDetailsPage.productOfDienstGeldigVanafInput).not.toBeEditable();
        expect(await instantieDetailsPage.productOfDienstGeldigVanafInput.inputValue()).toEqual(startDateFormatted);
        await expect(instantieDetailsPage.productOfDienstGeldigTotInput).not.toBeEditable();
        expect(await instantieDetailsPage.productOfDienstGeldigTotInput.inputValue()).toEqual(endDateFormatted);

        expect(await instantieDetailsPage.productTypeSelect.selectedItem.textContent()).toContain(productType);

        await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(targetAudiences);
        await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(themes);
        await expect(instantieDetailsPage.talenMultiSelect.options()).toContainText(languages);

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(competentAuthorityLevels);
        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(competentAuthorities);
        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(executingAuthorityLevels);
        await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText(executingAuthorities);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(spatials);

        await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(tags);
        await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText(publicationMedia);
        await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(yourEuropeCategories);

        await expect(instantieDetailsPage.productOpnieuwBewerkenButton).toBeVisible();

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        verifyInstancePublishedOnIPDC(
            instancePublishedInIpdc,
            {
                titel: { nl: title },
                beschrijving: { nl: description },
                aanvullendeBeschrijving: { nl: additionalDescription },
                uitzonderingen: { nl: exceptions },
                voorwaarden: [1, 2].map(nmbr => {
                    return {
                        titel: { nl: requirementsTitle + ` - ${nmbr}`},
                        beschrijving: { nl: requirementsDescriptionUnsanitized + ` - ${nmbr}` },
                        order: nmbr - 1,
                        nestedGroup: [
                            {
                                titel: { nl: evidenceTitle + ` - ${nmbr}` },
                                beschrijving: { nl: evidenceDescriptionUnsanitized + ` - ${nmbr}` }
                            }
                        ]
                    };
                }),
                procedures: [1, 2].map(nmbr => {
                    return {
                        titel: { nl: procedureTitle + ` - ${nmbr}` },
                        beschrijving: { nl: procedureDescriptionUnsanitized + ` - ${nmbr}` },
                        order: nmbr - 1,
                        nestedGroup: [1, 2].map(nmbrNstd => {
                            return {
                                titel: { nl: procedureWebsiteTitle + ` - ${nmbr} - ${nmbrNstd}` },
                                beschrijving: { nl: procedureWebsiteDescription + ` - ${nmbr} - ${nmbrNstd}` },
                                url: `${procedureWebsiteUrl}${nmbr}${nmbrNstd}`,
                                order: nmbrNstd - 1,
                            }
                        })
                    };
                }),
                kosten: [1, 2].map(nmbr => {
                    return {
                        titel: { nl: costTitle + ` - ${nmbr}` },
                        beschrijving: { nl: costDescription + ` - ${nmbr}` },
                        order: nmbr - 1
                    };
                }),
                financieleVoordelen: [1, 2].map(nmbr => {
                    return {
                        titel: { nl: financialAdvantageTitle + ` - ${nmbr}` },
                        beschrijving: { nl: financialAdvantageDescription + ` - ${nmbr}` },
                        order: nmbr - 1
                    };
                }),
                regelgeving: { nl: regulationDescription },
                regelgevendeBronnen: [1, 2].map(nmbr => {
                    return {
                        titel: {nl: legalResourceTitle + ` - ${nmbr}` },
                        beschrijving: {nl: legalResourceDescription + ` - ${nmbr}` },
                        url: `${legalResourceUrl}${nmbr}`,
                        order: nmbr -1,
                    };
                }),
                contactPunten: [
                    {
                        email: `${contactPointEmail}1`,
                        telephone: `${contactPointTelephone}1`,
                        url: `${contactPointUrl}1`,
                        openingHours: `${contactPointOpeningsHours} - 1`,
                        order: 0,
                        address: {
                            land: addressLand,
                            gemeentenaam: addressGemeente1,
                            straatnaam: addressStraat1,
                            postcode: addressPostcode1,
                            huisnummer: addressHuisnummer1,
                            busnummer: addressBusnummer1,
                        }
                    },
                    {
                        email: `${contactPointEmail}2`,
                        telephone: `${contactPointTelephone}2`,
                        url: `${contactPointUrl}2`,
                        openingHours: `${contactPointOpeningsHours} - 2`,
                        order: 1,
                        address: {
                            land: addressLand,
                            gemeentenaam: addressGemeente2,
                            straatnaam: addressStraat2,
                            postcode: addressPostcode2,
                            huisnummer: addressHuisnummer2,
                            busnummer: addressBusnummer2,
                        }
                    }
                ],
                meerInfos: [1, 2].map(nmbr => {
                    return {
                        titel: { nl: moreInfoWebsiteTitle + ` - ${nmbr}` },
                        beschrijving: { nl: moreInfoWebsiteDescription + ` - ${nmbr}` },
                        url: `${moreInfoWebsiteUrl}${nmbr}`,
                        order: nmbr - 1
                    };
                }),
                uuid: 'PRESENT',
                createdBy: bestuurseenheidUriGent,
                productId: `1502`,
                conceptSource: linkedConceptUrl,
                type: productTypeAsIri,
                aangemaaktOp: dateCreated,
                bewerktOp: dateModified,
                geldigVanaf: startDate,
                geldigTot: endDate,
                doelgroepen: targetAudiences.map(ta => `https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/${ta}`),
                themas: themesAsIris,
                talen: languagesAsIris,
                bevoegdeBestuursniveaus: competentAuthorityLevelsAsIris,
                bevoegdeOverheden: competentAuthoritiesAsIris,
                uitvoerendeBestuursniveaus: executingAuthorityLevelsAsIris,
                uitvoerendeOverheden: executingAuthoritiesAsIris,
                geografischeToepassingsgebieden: spatialsAsIris,
                zoektermen: tags,
                publicatieKanalen: publicationMediaAsIris,
                yourEuropeCategorieen: yourEuropeCategoriesAsIris,
            },
            'nl-be-x-informal');

    });

    test('Verify a minimal instance was created and updated from instance snapshot from ldes stream and verify its publishment to ipdc', async () => {

        const title = 'Minimalistische instantie updatet';
        const description = `Beschrijving van de minimalistische instantie updatet`;

        await verifyInstanceInUI(title, description);

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: 'nl-be-x-informal' });
        verifyInstancePublishedOnIPDC(
            instancePublishedInIpdc,
            {
                titel: { nl: title },
                beschrijving: { nl: description },
                uuid: 'PRESENT',
                createdBy: bestuurseenheidUriGent,
                aangemaaktOp: `2024-02-14T13:42:12.357Z`,
                bevoegdeOverheden: [`http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`],
                uitvoerendeOverheden: [`http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`],
                geografischeToepassingsgebieden: [`http://data.europa.eu/nuts/code/BE23444021`]
            },
            'nl-be-x-informal');
    });

    test('Verify an instance can be archived and again unarchived', async () => {
        const instanceId = uuid();
        const { title, description, isVersionOf } = await InstanceSnapshotLdesStub.createSnapshot(instanceId, false);

        await verifyInstanceInUI(title, description);

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: title, expectedFormalOrInformalTripleLanguage: Language.INFORMAL });
        expect(instancePublishedInIpdc).toBeTruthy();

        verifyInstancePublishedOnIPDC(
            instancePublishedInIpdc,
            {
                titel: { nl: title },
                beschrijving: { nl: description },
                uuid: `PRESENT`,
                createdBy: bestuurseenheidUriGent,
            },
            'nl-be-x-informal');

        await InstanceSnapshotLdesStub.createSnapshot(instanceId, true);

        const archivedInstancePublishedInIpdc = await IpdcStub.findPublishedInstance({ tombstonedId: isVersionOf });
        expect(archivedInstancePublishedInIpdc).toBeTruthy();

        const unarchivedSnapshot: Snapshot = await InstanceSnapshotLdesStub.createSnapshot(instanceId, false);

        await verifyInstanceInUI(unarchivedSnapshot.title, unarchivedSnapshot.description);

        const unarchivedInstancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: unarchivedSnapshot.title, expectedFormalOrInformalTripleLanguage: Language.INFORMAL });
        expect(unarchivedInstancePublishedInIpdc).toBeTruthy();

        verifyInstancePublishedOnIPDC(
            unarchivedInstancePublishedInIpdc,
            {
                titel: { nl: unarchivedSnapshot.title },
                beschrijving: { nl: unarchivedSnapshot.description },
                bevoegdeOverheden: [`http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`],
                uitvoerendeOverheden: [`http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5`],
                geografischeToepassingsgebieden: [`http://data.europa.eu/nuts/code/BE23444021`]
            },
            'nl-be-x-informal');
    });

    async function verifyInstanceInUI(title: string, description: string) {
        await homePage.goto();
        await homePage.searchInput.fill(title);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(title);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Verzonden');
        await homePage.resultTable.row(first_row).link(title).click();
        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.basisinformatieHeading).toBeVisible();

        await expect(instantieDetailsPage.titelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelInput).toHaveValue(title);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(description);

        await expect(instantieDetailsPage.productOpnieuwBewerkenButton).toBeVisible();
    }

});


