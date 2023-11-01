import { test, expect, Page } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from './pages/product-of-dienst-toevoegen-page';
import {first_row, second_row, third_row} from './components/table';
import { ConceptDetailsPage as ConceptDetailsPage } from './pages/concept-details-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { WijzigingenBewarenModal } from './modals/wijzigingen-bewaren-modal';
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
import { IpdcStub } from './components/ipdc-stub';

type BestuursEenheidConfig = {
    uri: string,
    name: string;
    spatialNisCode: string;
}

const pepingen: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
    name: "Pepingen",
    spatialNisCode: "http://vocab.belgif.be/auth/refnis2019/20001",
}

const aarschot: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/ba4d960fe3e01984e15fd0b141028bab8f2b9b240bf1e5ab639ba0d7fe4dc522",
    name: "Aarschot",
    spatialNisCode: "http://vocab.belgif.be/auth/refnis2019/24001",
}

const leuven: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/c648ea5d12626ee3364a02debb223908a71e68f53d69a7a7136585b58a083e77",
    name: "Leuven",
    spatialNisCode: "http://vocab.belgif.be/auth/refnis2019/24062",
}

test.describe('Concept to Instance back to IPDC Flow', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
    });

    test.afterEach(async () => {
        await page.close();
    });

    test.describe('For unchosen formal/informal', () => {

        test.beforeEach(async () => {

            await mockLoginPage.goto();
            await mockLoginPage.searchInput.fill('Pepingen');
            await mockLoginPage.login('Gemeente Pepingen');

            await homePage.expectToBeVisible();

            const uJeModal = UJeModal.create(page);
            await uJeModal.expectToBeVisible();
            await uJeModal.laterKiezenButton.click();
            await uJeModal.expectToBeClosed();
        });

        test('Load concept overview from ldes-stream', async () => {
            await loadConceptOverviewFromLdesStream();
        });

        test(`Create instance from concept and edit fully and send to IPDC and verify readonly version fully`, async () => {
            await createInstanceFromConceptAndEditFullyAndSendToIPDCAndVerifyReadonlyVersionFully('nl', 'nl-be-x-formal', pepingen);
        });

    });

    test.describe('For chosen informal', () => {

        test.beforeEach(async () => {

            await mockLoginPage.goto();
            await mockLoginPage.searchInput.fill('Aarschot');
            await mockLoginPage.login('Gemeente Aarschot');

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

        test('Load concept overview from ldes-stream', async () => {
            await loadConceptOverviewFromLdesStream();
        });

        test(`Create instance from concept and edit fully and send to IPDC and verify readonly version fully`, async () => {
            await createInstanceFromConceptAndEditFullyAndSendToIPDCAndVerifyReadonlyVersionFully('informal', 'nl-be-x-informal', aarschot);
        });

    });

    test.describe('For chosen formal', () => {

        test.beforeEach(async () => {

            await mockLoginPage.goto();
            await mockLoginPage.searchInput.fill('Leuven');
            await mockLoginPage.login('Gemeente Leuven');

            await homePage.expectToBeVisible();

            const uJeModal = UJeModal.create(page);
            const informalNotYetChosen = await uJeModal.isVisible();
            if (informalNotYetChosen) {
                await uJeModal.expectToBeVisible();
                await uJeModal.mijnBestuurKiestVoorDeUVormRadio.click();
                await uJeModal.bevestigenButton.click();
                await uJeModal.expectToBeClosed();
            }
        });

        test('Load concept overview from ldes-stream', async () => {
            await loadConceptOverviewFromLdesStream();
        });

        test(`Create instance from concept and edit fully and send to IPDC and verify readonly version fully`, async () => {
            await createInstanceFromConceptAndEditFullyAndSendToIPDCAndVerifyReadonlyVersionFully('nl', 'nl-be-x-formal', leuven);
        });

    });

    const loadConceptOverviewFromLdesStream = async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await expect(toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit')).toBeVisible();
        await expect(toevoegenPage.resultTable.row(second_row).link('Financiële tussenkomst voor een verblijf in een woonzorgcentrum')).toBeVisible();
        await expect(toevoegenPage.resultTable.row(third_row).link('Concept 1 edited')).toBeVisible();
    };

    const createInstanceFromConceptAndEditFullyAndSendToIPDCAndVerifyReadonlyVersionFully = async (formalInformalChoiceSuffix: string, expectedFormalOrInformalTripleLanguage: string, bestuurseenheidConfig: BestuursEenheidConfig) => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.row(first_row).link('Akte van Belgische nationaliteit').click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(`Akte van Belgische nationaliteit - ${formalInformalChoiceSuffix}`);
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        expect(titel).toEqual(`Akte van Belgische nationaliteit - ${formalInformalChoiceSuffix}`);
        const newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);
        const titelEngels = await instantieDetailsPage.titelEngelsInput.inputValue();
        expect(titelEngels).toEqual('Certificate of Belgian nationality');
        const newTitelEngels = titelEngels + uuid();
        await instantieDetailsPage.titelEngelsInput.fill(newTitelEngels);

        const beschrijving = await instantieDetailsPage.beschrijvingEditor.textContent();
        expect(beschrijving).toEqual(`De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen. - ${formalInformalChoiceSuffix}`);
        const newBeschrijving = beschrijving + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(newBeschrijving);
        const beschrijvingEngels = await instantieDetailsPage.beschrijvingEngelsEditor.textContent();
        expect(beschrijvingEngels).toEqual('The certificate of Belgian nationality is granted to citizens who have acquired Belgian nationality through the procedure of nationality declaration or naturalisation.');
        const newBeschrijvingEngels = beschrijvingEngels + uuid();
        await instantieDetailsPage.beschrijvingEngelsEditor.fill(newBeschrijvingEngels);

        const aanvullendeBeschrijving = await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent();
        expect(aanvullendeBeschrijving).toEqual(`Verdere beschrijving - ${formalInformalChoiceSuffix}`);
        const newAanvullendeBeschrijving = aanvullendeBeschrijving + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill(newAanvullendeBeschrijving);
        const aanvullendeBeschrijvingEngels = await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.textContent();
        expect(aanvullendeBeschrijvingEngels).toEqual('The certificate states:the last name, first names, date and place of birth of the person to whom the certificate relatesthe legal foundation of the declaration on the basis of which the certificate was drawn upin the case nationality is granted on the basis of Articles 8, § 1, 2°, b), 9, 2°, b), and 11, § 2, of the Belgian Nationality Code: the last name, first names, date and place of birth of the declarant or declarants.Under certain conditions, you can request a copy of or an extract from the certificate of Belgian nationality:A copy contains the original data of the certificate and the history of the status of the person to whom the certificate relates.An extract, on the contrary, only states the current details of the certificate, without stating the history of the status of the person to whom the certificate relates. Therefore, an extract only shows the current status of the data.');
        const newAanvullendeBeschrijvingEngels = aanvullendeBeschrijvingEngels + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.fill(newAanvullendeBeschrijvingEngels);

        const uitzonderingen = await instantieDetailsPage.uitzonderingenEditor.textContent();
        expect(uitzonderingen).toEqual(`Uitzonderingen - ${formalInformalChoiceSuffix}`);
        const newUitzonderingen = uitzonderingen + uuid();
        await instantieDetailsPage.uitzonderingenEditor.fill(newUitzonderingen);
        const uitzonderingenEngels = await instantieDetailsPage.uitzonderingenEngelsEditor.textContent();
        expect(uitzonderingenEngels).toEqual('Uitzonderingen - en');
        const newUitzonderingenEngels = uitzonderingenEngels + uuid();
        await instantieDetailsPage.uitzonderingenEngelsEditor.fill(newUitzonderingenEngels);

        const titelVoorwaarde = await instantieDetailsPage.titelVoorwaardeInput().inputValue();
        expect(titelVoorwaarde).toEqual(`Voorwaarden - ${formalInformalChoiceSuffix}`);
        const newTitelVoorwaarde = titelVoorwaarde + uuid();
        await instantieDetailsPage.titelVoorwaardeInput().fill(newTitelVoorwaarde);
        const titelVoorwaardeEngels = await instantieDetailsPage.titelVoorwaardeEngelsInput().inputValue();
        expect(titelVoorwaardeEngels).toEqual('Requirements');
        const newTitelVoorwaardeEngels = titelVoorwaardeEngels + uuid();
        await instantieDetailsPage.titelVoorwaardeEngelsInput().fill(newTitelVoorwaardeEngels);
        const beschrijvingVoorwaarde = await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent();
        expect(beschrijvingVoorwaarde).toEqual(`De akte vermeldt:de naam, de voornamen, de geboortedatum en de geboorteplaats van de persoon op wie de akte betrekking heeftde wettelijke basis van de verklaring op basis waarvan de akte werd opgesteldin geval van nationaliteitstoekenning op basis van de artikelen 8, § 1, 2°, b), 9, 2°, b), en 11, § 2, van het Wetboek van de Belgische nationaliteit: de naam, de voornamen, de geboortedatum en de geboorteplaats van de verklaarder of verklaarders.Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen:Een afschrift vermeldt de oorspronkelijke gegevens van de akte en de historiek van de staat van de persoon op wie de akte betrekking heeft.Een uittreksel vermeldt daarentegen enkel de actuele gegevens van de akte, zonder vermelding van de historiek van de staat van de persoon op wie de akte betrekking heeft. Op een uittreksel is dus enkel de huidige toestand van de gegevens zichtbaar.Wie kan een afschrift of uittreksel aanvragen?Voor akten van Belgische nationaliteit wordt het recht op een afschrift of uittreksel beperkt tot:uzelfde echtgeno(o)te, overlevende echtgeno(o)te of wettelijk samenwonendeuw wettelijke vertegenwoordiger (bv. ouder, voogd, bewindvoerder)bloedverwanten in opgaande of neerdalende lijn (geen aanverwanten en zijtakken)uw erfgenamenbijzondere gemachtigden zoals een notaris of advocaat.Als de akte meer dan 100 jaar oud is, heeft iedereen recht op een afschrift of uittreksel. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingVoorwaarde = beschrijvingVoorwaarde + uuid();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill(newBeschrijvingVoorwaarde);
        const beschrijvingVoorwaardeEngels = await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().textContent();
        expect(beschrijvingVoorwaardeEngels).toEqual('The right to receive a copy of or an extract from certificates of Belgian nationality is limited to:yourselfyour spouse, surviving spouse, or legal cohabitantyour legal representative (e.g. a parent, guardian, conservator)blood relatives in the ascending or descending line (no relatives by affinity and side branches)your heirsspecial agents, such as notaries or lawyers.If the certificate is more than 100 years old, anyone is entitled to request a copy or an extract.');
        const newBeschrijvingVoorwaardeEngels = beschrijvingVoorwaardeEngels + uuid();
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor().fill(newBeschrijvingVoorwaardeEngels);

        const titelBewijsstuk = await instantieDetailsPage.titelBewijsstukInput().inputValue();
        expect(titelBewijsstuk).toEqual(`Bewijs - ${formalInformalChoiceSuffix}`);
        const newTitelBewijsstuk = titelBewijsstuk + uuid();
        await instantieDetailsPage.titelBewijsstukInput().fill(newTitelBewijsstuk);
        const titelBewijsstukEngels = await instantieDetailsPage.titelBewijsstukEngelsInput().inputValue();
        expect(titelBewijsstukEngels).toEqual('Evidence');
        const newTitelBewijsstukEngels = titelBewijsstukEngels + uuid();
        await instantieDetailsPage.titelBewijsstukEngelsInput().fill(newTitelBewijsstukEngels);
        const beschrijvingBewijsstuk = await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent();
        expect(beschrijvingBewijsstuk).toEqual(`Als u het document zelf ophaalt:uw eigen identiteitskaart.Als u het document voor iemand anders aanvraagt:een volmacht van de betrokkene en een kopie van zijn of haar identiteitskaartuw eigen identiteitskaart. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingBewijsstuk = beschrijvingBewijsstuk + uuid();
        await instantieDetailsPage.beschrijvingBewijsstukEditor().fill(newBeschrijvingBewijsstuk);
        const beschrijvingBewijsstukEngels = await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().textContent();
        expect(beschrijvingBewijsstukEngels).toEqual('If you collect the document yourself:your own identity card.If you are requesting the document for someone else:a power of attorney from that person and a copy of their identity cardas well as your own identity card.');
        const newBeschrijvingBewijsstukEngels = beschrijvingBewijsstukEngels + uuid();
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor().fill(newBeschrijvingBewijsstukEngels);

        const titelProcedure = await instantieDetailsPage.titelProcedureInput().inputValue();
        expect(titelProcedure).toEqual(`Procedure - ${formalInformalChoiceSuffix}`);
        const newTitelProcedure = titelProcedure + uuid();
        await instantieDetailsPage.titelProcedureInput().fill(newTitelProcedure);
        const titelProcedureEngels = await instantieDetailsPage.titelProcedureEngelsInput().inputValue();
        expect(titelProcedureEngels).toEqual('Procedure - en');
        const newTitelProcedureEngels = titelProcedureEngels + uuid();
        await instantieDetailsPage.titelProcedureEngelsInput().fill(newTitelProcedureEngels);
        const beschrijvingProcedure = await instantieDetailsPage.beschrijvingProcedureEditor().textContent();
        expect(beschrijvingProcedure).toEqual(`U kunt een afschrift of een uittreksel van de akte van nationaliteit aanvragen in uw gemeente.Als u beschikt over een elektronische identiteitskaart (eID), kunt u een afschrift of uittreksel van de akte online aanvragen:via het e-loket van uw gemeenteof via de attestenpagina van 'Mijn Burgerprofiel'.Die elektronische afschriften en uittreksels zijn voorzien van een elektronisch zegel van het Ministerie van Binnenlandse Zaken. Ze hebben dezelfde juridische waarde als deze afgeleverd door de gemeente. Zolang de informatie op het bewijs correct is, kunt u het geldig gebruiken in om het even welke vorm (op papier of in digitale vorm).Sinds 31 maart 2019 worden akten van de burgerlijke stand uitsluitend digitaal geregistreerd. Dateert uw akte van voor 31 maart 2019, dan is die misschien nog niet in digitale vorm beschikbaar. Sommige gemeenten digitaliseren oude archieven naarmate afschriften of uittreksels van de akten worden opgevraagd of wijzigingen worden aangebracht. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingProcedure = beschrijvingProcedure + uuid();
        await instantieDetailsPage.beschrijvingProcedureEditor().fill(newBeschrijvingProcedure);
        const beschrijvingProcedureEngels = await instantieDetailsPage.beschrijvingProcedureEngelsEditor().textContent();
        expect(beschrijvingProcedureEngels).toEqual(`You can request a copy of or an extract from the certificate of nationality from your municipality.If you have an electronic identity card (eID), you can request a copy of or an extract from the certificate onlinevia the e-desk of your municipalityor via the certificates page of ‘My Citizen Profile’ ‘Mijn Burgerprofiel’).Those electronic copies and extracts bear the electronic seal of the Ministry of the Interior. They have the same legal value as those issued by the municipality. As long as the information on the certificate is correct, you can use it validly in any format (on paper or in digital format).Since 31 March 2019, certificates from the register office are registered in digital format only. If your certificate dates from before 31 March 2019, it may not yet be available digitally. Some municipalities digitise old archives when copies of or extracts from the certificates are requested or changes are made.`);
        const newBeschrijvingProcedureEngels = beschrijvingProcedureEngels + uuid();
        await instantieDetailsPage.beschrijvingProcedureEngelsEditor().fill(newBeschrijvingProcedureEngels);

        const titelWebsiteVoorProcedure = await instantieDetailsPage.titelWebsiteVoorProcedureInput().inputValue();
        expect(titelWebsiteVoorProcedure).toEqual(`Procedure website naam - ${formalInformalChoiceSuffix}`);
        const newTitelWebsiteVoorProcedure = titelWebsiteVoorProcedure + uuid();
        await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill(newTitelWebsiteVoorProcedure);
        const titelWebsiteVoorProcedureEngels = await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput().inputValue();
        expect(titelWebsiteVoorProcedureEngels).toEqual('Procedure website naam - en');
        const newTitelWebsiteVoorProcedureEngels = titelWebsiteVoorProcedureEngels + uuid();
        await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput().fill(newTitelWebsiteVoorProcedureEngels);
        const beschrijvingWebsiteVoorProcedure = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent();
        expect(beschrijvingWebsiteVoorProcedure).toEqual(`procedure website beschrijving - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingWebsiteVoorProcedure = beschrijvingWebsiteVoorProcedure + uuid();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().fill(newBeschrijvingWebsiteVoorProcedure);
        const beschrijvingWebsiteVoorProcedureEngels = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor().textContent();
        expect(beschrijvingWebsiteVoorProcedureEngels).toEqual('procedure website beschrijving - en');
        const newBeschrijvingWebsiteVoorProcedureEngels = beschrijvingWebsiteVoorProcedureEngels + uuid();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor().fill(newBeschrijvingWebsiteVoorProcedureEngels);
        const websiteURLVoorProcedure = await instantieDetailsPage.websiteURLVoorProcedureInput().inputValue();
        expect(websiteURLVoorProcedure).toEqual('https://procedure-website.com');
        const newWebsiteURLVoorProcedure = 'https://new-procedure-website.com';
        await instantieDetailsPage.websiteURLVoorProcedureInput().fill(newWebsiteURLVoorProcedure);

        const titelKost = await instantieDetailsPage.titelKostInput().inputValue();
        expect(titelKost).toEqual(`Bedrag kost - ${formalInformalChoiceSuffix}`);
        const newTitelKost = titelKost + uuid();
        await instantieDetailsPage.titelKostInput().fill(newTitelKost);
        const titelKostEngels = await instantieDetailsPage.titelKostEngelsInput().inputValue();
        expect(titelKostEngels).toEqual('bedrag kost - en');
        const newTitelKostEngels = titelKostEngels + uuid();
        await instantieDetailsPage.titelKostEngelsInput().fill(newTitelKostEngels);
        const beschrijvingKost = await instantieDetailsPage.beschrijvingKostEditor().textContent();
        expect(beschrijvingKost).toEqual(`De aanvraag en het attest zijn gratis. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingKost = beschrijvingKost + uuid();
        await instantieDetailsPage.beschrijvingKostEditor().fill(newBeschrijvingKost);
        const beschrijvingKostEngels = await instantieDetailsPage.beschrijvingKostEngelsEditor().textContent();
        expect(beschrijvingKostEngels).toEqual('De aanvraag en het attest zijn gratis. - en');
        const newBeschrijvingKostEngels = beschrijvingKostEngels + uuid();
        await instantieDetailsPage.beschrijvingKostEngelsEditor().fill(newBeschrijvingKostEngels);

        const titelFinancieelVoordeel = await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue();
        expect(titelFinancieelVoordeel).toEqual(`Titel financieel voordeel. - ${formalInformalChoiceSuffix}`);
        const newTitelFinancieelVoordeel = titelFinancieelVoordeel + uuid();
        await instantieDetailsPage.titelFinancieelVoordeelInput().fill(newTitelFinancieelVoordeel);
        const titelFinancieelVoordeelEngels = await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().inputValue();
        expect(titelFinancieelVoordeelEngels).toEqual('Titel financieel voordeel. - en');
        const newTitelFinancieelVoordeelEngels = titelFinancieelVoordeelEngels + uuid();
        await instantieDetailsPage.titelFinancieelVoordeelEngelsInput().fill(newTitelFinancieelVoordeelEngels);
        const beschrijvingFinancieelVoordeel = await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent();
        expect(beschrijvingFinancieelVoordeel).toEqual(`Beschrijving financieel voordeel. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingFinancieelVoordeel = beschrijvingFinancieelVoordeel + uuid();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().fill(newBeschrijvingFinancieelVoordeel);
        const beschrijvingFinancieelVoordeelEngels = await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().textContent();
        expect(beschrijvingFinancieelVoordeelEngels).toEqual('Beschrijving financieel voordeel. - en');
        const newBeschrijvingFinancieelVoordeelEngels = beschrijvingFinancieelVoordeelEngels + uuid();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor().fill(newBeschrijvingFinancieelVoordeelEngels);

        const beschrijvingRegelgeving = await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent();
        expect(beschrijvingRegelgeving).toEqual(`Regelgeving - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingRegelgeving = beschrijvingRegelgeving + uuid();
        await instantieDetailsPage.beschrijvingRegelgevingEditor().fill(newBeschrijvingRegelgeving);
        const beschrijvingRegelgevingEngels = await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().textContent();
        expect(beschrijvingRegelgevingEngels).toEqual('Regelgeving - en');
        const newBeschrijvingRegelgevingEngels = beschrijvingRegelgevingEngels + uuid();
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor().fill(newBeschrijvingRegelgevingEngels);

        await instantieDetailsPage.voegContactpuntToeButton.click();
        await expect(instantieDetailsPage.contactpuntHeading).toBeVisible();
        await instantieDetailsPage.contactpuntEmailSelect().insertNewValue('1111@example.com');
        await instantieDetailsPage.contactpuntEmailSelect().insertNewValue('2222@example.com');
        await instantieDetailsPage.contactpuntEmailSelect().selectValue('1111@example.com');
        const selectedContactpuntEmail = (await instantieDetailsPage.contactpuntEmailSelect().selectedItem.textContent());
        expect(selectedContactpuntEmail).toContain('1111@example.com');
        await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue('111111111');
        await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue('222222222');
        await instantieDetailsPage.contactpuntTelefoonSelect().selectValue('111111111');
        const selectedContactpuntTelefoon = (await instantieDetailsPage.contactpuntTelefoonSelect().selectedItem.textContent());
        expect(selectedContactpuntTelefoon).toContain('111111111');
        await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue('https://www.example1.com');
        await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue('https://www.example2.com');
        await instantieDetailsPage.contactpuntWebsiteURLSelect().selectValue('https://www.example1.com');
        const selectedContactpuntWebsiteURL = (await instantieDetailsPage.contactpuntWebsiteURLSelect().selectedItem.textContent());
        expect(selectedContactpuntWebsiteURL).toContain('https://www.example1.com');
        await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue('https://www.example1.com/openinghours');
        await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue('https://www.example2.com/openinghours');
        await instantieDetailsPage.contactpuntOpeningsurenSelect().selectValue('https://www.example1.com/openinghours');
        const selectedContactpuntOpeningsuren = (await instantieDetailsPage.contactpuntOpeningsurenSelect().selectedItem.textContent());
        expect(selectedContactpuntOpeningsuren).toContain('https://www.example1.com/openinghours');

        await instantieDetailsPage.voegAdresToeButton().click();
        await instantieDetailsPage.contactpuntAdresGemeenteSelect().selectValue('Harelbeke');
        await instantieDetailsPage.contactpuntAdresStraatSelect().selectValue('Generaal Deprezstraat');
        await instantieDetailsPage.contactpuntAdresHuisnummerInput().fill('2');
        await instantieDetailsPage.contactpuntAdresBusnummerInput().fill('50');
        await expect(instantieDetailsPage.contactpuntAdresValidatie()).toContainText('Adres gevonden');

        const titelWebsite = await instantieDetailsPage.titelWebsiteInput().inputValue();
        expect(titelWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie - ${formalInformalChoiceSuffix}`);
        const newTitelWebsite = titelWebsite + uuid();
        await instantieDetailsPage.titelWebsiteInput().fill(newTitelWebsite);
        const titelWebsiteEngels = await instantieDetailsPage.titelWebsiteEngelsInput().inputValue();
        expect(titelWebsiteEngels).toEqual('Website Belgische nationaliteit en naturalisatie - en');
        const newTitelWebsiteEngels = titelWebsiteEngels + uuid();
        await instantieDetailsPage.titelWebsiteEngelsInput().fill(newTitelWebsiteEngels);
        const beschrijvingWebsite = await instantieDetailsPage.beschrijvingWebsiteEditor().textContent();
        expect(beschrijvingWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie beschrijving - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingWebsite = beschrijvingWebsite + uuid();
        await instantieDetailsPage.beschrijvingWebsiteEditor().fill(newBeschrijvingWebsite);
        const beschrijvingWebsiteEngels = await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().textContent();
        expect(beschrijvingWebsiteEngels).toEqual('Website Belgische nationaliteit en naturalisatie beschrijving - en');
        const newBeschrijvingWebsiteEngels = beschrijvingWebsiteEngels + uuid();
        await instantieDetailsPage.beschrijvingWebsiteEngelsEditor().fill(newBeschrijvingWebsiteEngels);
        const websiteURL = await instantieDetailsPage.websiteURLInput().inputValue();
        expect(websiteURL).toEqual('https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit');
        const newWebsiteURL = 'https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/new-nationaliteit';
        await instantieDetailsPage.websiteURLInput().fill(newWebsiteURL);

        await instantieDetailsPage.eigenschappenTab.click();

        await wijzigingenBewarenModal.expectToBeVisible();
        await wijzigingenBewarenModal.bewaarButton.click();
        await wijzigingenBewarenModal.expectToBeClosed();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

        const productOfDienstGeldigVanaf = await instantieDetailsPage.productOfDienstGeldigVanafInput.inputValue();
        expect(productOfDienstGeldigVanaf).toEqual('26-08-2020');
        const newProductOfDienstGeldigVanaf = '13-04-2019';
        await instantieDetailsPage.productOfDienstGeldigVanafInput.clear();
        await page.keyboard.type(newProductOfDienstGeldigVanaf);
        const productOfDienstGeldigTot = await instantieDetailsPage.productOfDienstGeldigTotInput.inputValue();
        expect(productOfDienstGeldigTot).toEqual('12-07-2025');
        const newProductOfDienstGeldigTot = '27-11-2026';
        await instantieDetailsPage.productOfDienstGeldigTotInput.clear();
        await page.keyboard.type(newProductOfDienstGeldigTot);

        const productType = await instantieDetailsPage.productTypeSelect.selectedItem.textContent();
        expect(productType).toContain('Financieel voordeel');
        const newProductType = 'Infrastructuur en materiaal';
        await instantieDetailsPage.productTypeSelect.selectValue(newProductType);

        await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(['Burger', 'Onderneming']);
        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Burger');
        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Onderneming');
        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Vereniging');
        await instantieDetailsPage.doelgroepenMultiSelect.selectValue('Organisatie');

        await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(['Burger en Overheid', 'Cultuur, Sport en Vrije Tijd']);
        await instantieDetailsPage.themasMultiSelect.selectValue('Burger en Overheid');
        await instantieDetailsPage.themasMultiSelect.selectValue('Cultuur, Sport en Vrije Tijd');
        await instantieDetailsPage.themasMultiSelect.selectValue('Economie en Werk');
        await instantieDetailsPage.themasMultiSelect.selectValue('Milieu en Energie');

        //TODO LPDC-698: talen is not correctly processed from the ipdc ldes stream ... add test to unclick ENG and DEU and select FRA and NED (and verify in readonly view)

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(['Europese overheid', 'Federale overheid']);
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Europese overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Federale overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Vlaamse overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Lokale overheid');
        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText([]);
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Aalst (Gemeente)');
        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(['Derden', 'Lokale overheid']);
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Derden');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Lokale overheid');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Provinciale overheid');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Federale overheid');
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText([bestuurseenheidConfig.name]);
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Vlaams-Brabant');
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Oud-Heverlee');

        await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(['Akte - nl', 'Nationaliteit - nl']);
        await instantieDetailsPage.tagsMultiSelect.insertNewValue('een-nieuwe-tag');
        await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText('Your Europe');
        await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(['Nationale verkeersregels en voorschriften voor bestuurders', 'Voorwaarden voor naturalisatie']);
        await instantieDetailsPage.categorieenYourEuropeMultiSelect.selectValue('Nationale verkeersregels en voorschriften voor bestuurders');
        await instantieDetailsPage.categorieenYourEuropeMultiSelect.selectValue('Voorwaarden voor naturalisatie');
        await instantieDetailsPage.categorieenYourEuropeMultiSelect.selectValue('Medische behandeling ondergaan');
        await instantieDetailsPage.categorieenYourEuropeMultiSelect.selectValue('Rechten en verplichtingen tot preventieve openbare gezondheidsmaatregelen');

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(newTitel);

        await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
        await expect(homePage.resultTable.row(first_row).locator).toContainText('Verzonden');

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(newTitel, expectedFormalOrInformalTripleLanguage);
        expect(instancePublishedInIpdc).toBeTruthy();
        verifyPublishedInstance(instancePublishedInIpdc, {
            titel: newTitel,
            titelEngels: newTitelEngels,
            beschrijving: newBeschrijving,
            beschrijvingEngels: newBeschrijvingEngels,
            aanvullendeBeschrijving: newAanvullendeBeschrijving,
            aanvullendeBeschrijvingEngels: newAanvullendeBeschrijvingEngels,
            uitzonderingen: newUitzonderingen,
            uitzonderingenEngels: newUitzonderingenEngels,
            regelgeving: newBeschrijvingRegelgeving,
            regelgevingEngels: newBeschrijvingRegelgevingEngels,
            kostTitel: newTitelKost,
            kostTitelEngels: newTitelKostEngels,
            kostBeschrijving: newBeschrijvingKost,
            kostBeschrijvingEngels: newBeschrijvingKostEngels,
            bewijsTitel: newTitelBewijsstuk,
            bewijsTitelEngels: newTitelBewijsstukEngels,
            bewijsBeschrijving: newBeschrijvingBewijsstuk,
            bewijsBeschrijvingEngels: newBeschrijvingBewijsstukEngels,
            financieelVoordeelTitel: newTitelFinancieelVoordeel,
            financieelVoordeelTitelEngels: newTitelFinancieelVoordeelEngels,
            financieelVoordeelBeschrijving: newBeschrijvingFinancieelVoordeel,
            financieelVoordeelBeschrijvingEngels: newBeschrijvingFinancieelVoordeelEngels,
            voorwaardeTitel: newTitelVoorwaarde,
            voorwaardeTitelEngels: newTitelVoorwaardeEngels,
            voorwaardeBeschrijving: newBeschrijvingVoorwaarde,
            voorwaardeBeschrijvingEngels: newBeschrijvingVoorwaardeEngels,
            procedureTitel: newTitelProcedure,
            procedureTitelEngels: newTitelProcedureEngels,
            procedureBeschrijving: newBeschrijvingProcedure,
            procedureBeschrijvingEngels: newBeschrijvingProcedureEngels,
            procedureWebsiteTitel: newTitelWebsiteVoorProcedure,
            procedureWebsiteTitelEngels: newTitelWebsiteVoorProcedureEngels,
            procedureWebsiteBeschrijving: newBeschrijvingWebsiteVoorProcedure,
            procedureWebsiteBeschrijvingEngels: newBeschrijvingWebsiteVoorProcedureEngels,
            procedureWebsiteUrl: newWebsiteURLVoorProcedure,
            websiteTitel: newTitelWebsite,
            websiteTitelEngels: newTitelWebsiteEngels,
            websiteBeschrijving: newBeschrijvingWebsite,
            websiteBeschrijvingEngels: newBeschrijvingWebsiteEngels,
            websiteUrl: newWebsiteURL
        },
            expectedFormalOrInformalTripleLanguage,
            bestuurseenheidConfig);

        await homePage.resultTable.row(first_row).link('Bekijk').click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.titelHeading).toBeVisible();

        await expect(instantieDetailsPage.titelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelInput).toHaveValue(newTitel);
        await expect(instantieDetailsPage.titelEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelEngelsInput).toHaveValue(newTitelEngels);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(newBeschrijving);
        await expect(instantieDetailsPage.beschrijvingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingEngelsReadonly.textContent()).toContain(newBeschrijvingEngels);

        await expect(instantieDetailsPage.aanvullendeBeschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingReadonly.textContent()).toContain(newAanvullendeBeschrijving);
        await expect(instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingEngelsReadonly.textContent()).toContain(newAanvullendeBeschrijvingEngels);

        await expect(instantieDetailsPage.uitzonderingenEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenReadonly.textContent()).toContain(newUitzonderingen);
        await expect(instantieDetailsPage.uitzonderingenEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenEngelsReadonly.textContent()).toContain(newUitzonderingenEngels);

        await expect(instantieDetailsPage.titelVoorwaardeInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeInput()).toHaveValue(newTitelVoorwaarde);
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput()).toHaveValue(newTitelVoorwaardeEngels);
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly().textContent()).toContain(newBeschrijvingVoorwaarde);
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsReadonly().textContent()).toContain(newBeschrijvingVoorwaardeEngels);

        await expect(instantieDetailsPage.titelBewijsstukInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelBewijsstukInput()).toHaveValue(newTitelBewijsstuk);
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput()).toHaveValue(newTitelBewijsstukEngels);
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly().textContent()).toContain(newBeschrijvingBewijsstuk);
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsReadonly().textContent()).toContain(newBeschrijvingBewijsstukEngels);

        await expect(instantieDetailsPage.titelProcedureInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelProcedureInput()).toHaveValue(newTitelProcedure);
        await expect(instantieDetailsPage.titelProcedureEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelProcedureEngelsInput()).toHaveValue(newTitelProcedureEngels);
        await expect(instantieDetailsPage.beschrijvingProcedureEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly().textContent()).toContain(newBeschrijvingProcedure);
        await expect(instantieDetailsPage.beschrijvingProcedureEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsReadonly().textContent()).toContain(newBeschrijvingProcedureEngels);

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).toHaveValue(newTitelWebsiteVoorProcedure);
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput()).toHaveValue(newTitelWebsiteVoorProcedureEngels);
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly().textContent()).toContain(newBeschrijvingWebsiteVoorProcedure);
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly().textContent()).toContain(newBeschrijvingWebsiteVoorProcedureEngels);
        await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).not.toBeEditable();
        await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).toHaveValue(newWebsiteURLVoorProcedure);

        await expect(instantieDetailsPage.titelKostInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelKostInput()).toHaveValue(newTitelKost);
        await expect(instantieDetailsPage.titelKostEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelKostEngelsInput()).toHaveValue(newTitelKostEngels);
        await expect(instantieDetailsPage.beschrijvingKostEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly().textContent()).toContain(newBeschrijvingKost);
        await expect(instantieDetailsPage.beschrijvingKostEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostEngelsReadonly().textContent()).toContain(newBeschrijvingKostEngels);

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).toHaveValue(newTitelFinancieelVoordeel);
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput()).toHaveValue(newTitelFinancieelVoordeelEngels);
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly().textContent()).toContain(newBeschrijvingFinancieelVoordeel);
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsReadonly().textContent()).toContain(newBeschrijvingFinancieelVoordeelEngels);

        await expect(instantieDetailsPage.beschrijvingRegelgevingEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevingReadonly().textContent()).toContain(newBeschrijvingRegelgeving);
        await expect(instantieDetailsPage.beschrijvingRegelgevingEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevingEngelsReadonly().textContent()).toContain(newBeschrijvingRegelgevingEngels);

        await expect(instantieDetailsPage.contactpuntEmailReadonly()).toHaveValue('1111@example.com');
        await expect(instantieDetailsPage.contactpuntTelefoonReadonly()).toHaveValue('111111111');
        await expect(instantieDetailsPage.contactpuntWebsiteURLReadonly()).toHaveValue('https://www.example1.com');
        await expect(instantieDetailsPage.contactpuntOpeningsurenReadonly()).toHaveValue('https://www.example1.com/openinghours');

        await expect(instantieDetailsPage.contactpuntAdresGemeenteSelect().selectedItem).toContainText('Harelbeke');
        await expect(instantieDetailsPage.contactpuntAdresStraatSelect().selectedItem).toContainText('Generaal Deprezstraat');
        await expect(instantieDetailsPage.contactpuntAdresHuisnummerInput()).toHaveValue('2');
        await expect(instantieDetailsPage.contactpuntAdresBusnummerInput()).toHaveValue('50');

        await expect(instantieDetailsPage.titelWebsiteInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteInput()).toHaveValue(newTitelWebsite);
        await expect(instantieDetailsPage.titelWebsiteEngelsInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteEngelsInput()).toHaveValue(newTitelWebsiteEngels);
        await expect(instantieDetailsPage.beschrijvingWebsiteEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteReadonly().textContent()).toContain(newBeschrijvingWebsite);
        await expect(instantieDetailsPage.beschrijvingWebsiteEngelsEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteEngelsReadonly().textContent()).toContain(newBeschrijvingWebsiteEngels);
        await expect(instantieDetailsPage.websiteURLInput()).not.toBeEditable();
        await expect(instantieDetailsPage.websiteURLInput()).toHaveValue(newWebsiteURL);

        await instantieDetailsPage.eigenschappenTab.click();
        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await expect(instantieDetailsPage.productOfDienstGeldigVanafInput).not.toBeEditable();
        await expect(instantieDetailsPage.productOfDienstGeldigVanafInput).toHaveValue(newProductOfDienstGeldigVanaf);
        await expect(instantieDetailsPage.productOfDienstGeldigTotInput).not.toBeEditable();
        await expect(instantieDetailsPage.productOfDienstGeldigTotInput).toHaveValue(newProductOfDienstGeldigTot);

        expect(await instantieDetailsPage.productTypeSelect.selectedItem.textContent()).toContain(newProductType);
        await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(['Organisatie', 'Vereniging']);
        await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(['Economie en Werk', 'Milieu en Energie']);

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(['Lokale overheid', 'Vlaamse overheid']);
        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(['Aalst (Gemeente)', 'Pepingen (Gemeente)']);
        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(['Federale overheid', 'Provinciale overheid']);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Oud-Heverlee']); // order is alphabetically thus multiple asserts 
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText([bestuurseenheidConfig.name]);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Provincie Vlaams-Brabant']);

        await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(['Akte - nl', 'Nationaliteit - nl', 'een-nieuwe-tag']);
        await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText('Your Europe');
        await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(['Medische behandeling ondergaan', 'Rechten en verplichtingen tot preventieve openbare gezondheidsmaatregelen']);

    };

    function verifyPublishedInstance(instance: any[], {
        titel,
        titelEngels,
        beschrijving,
        beschrijvingEngels,
        aanvullendeBeschrijving,
        aanvullendeBeschrijvingEngels,
        uitzonderingen,
        uitzonderingenEngels,
        regelgeving,
        regelgevingEngels,
        kostTitel,
        kostTitelEngels,
        kostBeschrijving,
        kostBeschrijvingEngels,
        bewijsTitel,
        bewijsTitelEngels,
        bewijsBeschrijving,
        bewijsBeschrijvingEngels,
        financieelVoordeelTitel,
        financieelVoordeelTitelEngels,
        financieelVoordeelBeschrijving,
        financieelVoordeelBeschrijvingEngels,
        voorwaardeTitel,
        voorwaardeTitelEngels,
        voorwaardeBeschrijving,
        voorwaardeBeschrijvingEngels,
        procedureTitel,
        procedureTitelEngels,
        procedureBeschrijving,
        procedureBeschrijvingEngels,
        procedureWebsiteTitel,
        procedureWebsiteTitelEngels,
        procedureWebsiteBeschrijving,
        procedureWebsiteBeschrijvingEngels,
        procedureWebsiteUrl,
        websiteTitel,
        websiteTitelEngels,
        websiteBeschrijving,
        websiteBeschrijvingEngels,
        websiteUrl
    },
        expectedFormalOrInformalTripleLanguage: string,
        bestuurseenheidConfig: BestuursEenheidConfig) {
        // PUBLIC SERVICE
        const publicService = IpdcStub.getObjectByType(instance, 'http://purl.org/vocab/cpsv#PublicService');

        expect(publicService['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(publicService['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": titel },
            { "@language": "en", "@value": titelEngels }
        ]));

        expect(publicService['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(publicService['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${beschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${beschrijvingEngels}</p>` }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${aanvullendeBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${aanvullendeBeschrijvingEngels}</p>` }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": `<p data-indentation-level="0">${uitzonderingen}</p>` },
            { "@language": "en", "@value": `<p data-indentation-level="0">${uitzonderingenEngels}</p>` }
        ]));

        expect(publicService['http://data.europa.eu/m8g/thematicArea']).toHaveLength(2);
        expect(publicService['http://data.europa.eu/m8g/thematicArea']).toEqual(expect.arrayContaining([
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/Thema/MilieuEnergie" },
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/Thema/EconomieWerk" }
        ]));

        expect(publicService['http://purl.org/dc/terms/spatial']).toHaveLength(3);
        expect(publicService['http://purl.org/dc/terms/spatial']).toEqual(expect.arrayContaining([
            { "@id": bestuurseenheidConfig.spatialNisCode }]));
        expect(publicService['http://purl.org/dc/terms/spatial']).toEqual(expect.arrayContaining([
            { "@id": "http://vocab.belgif.be/auth/refnis2019/24086" }]));
        expect(publicService['http://purl.org/dc/terms/spatial']).toEqual(expect.arrayContaining([
            { "@id": "http://vocab.belgif.be/auth/refnis2019/20001" }]));

        expect(publicService['http://purl.org/dc/terms/type']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/type']).toEqual(expect.arrayContaining([
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/Type/InfrastructuurMateriaal" }
        ]));

        expect(publicService['http://schema.org/startDate']).toHaveLength(1);
        expect(publicService['http://schema.org/startDate']).toEqual(expect.arrayContaining([
            { "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2019-04-13T00:00:00Z" }
        ]));

        expect(publicService['http://schema.org/endDate']).toHaveLength(1);
        expect(publicService['http://schema.org/endDate']).toEqual(expect.arrayContaining([
            { "@type": "http://www.w3.org/2001/XMLSchema#dateTime", "@value": "2026-11-27T00:00:00Z" }
        ]));

        expect(publicService['http://www.w3.org/ns/dcat#keyword']).toHaveLength(3);
        expect(publicService['http://www.w3.org/ns/dcat#keyword']).toEqual(expect.arrayContaining([
            { "@language": "nl", "@value": "Akte - nl" },
            { "@language": "nl", "@value": "Nationaliteit - nl" },
            { "@language": "nl", "@value": "een-nieuwe-tag" }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel']).toEqual(expect.arrayContaining([
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Vlaams" },
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Lokaal" }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel']).toEqual(expect.arrayContaining([
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Federaal" },
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Provinciaal" }
        ]));

        expect(publicService['http://data.europa.eu/m8g/hasCompetentAuthority']).toHaveLength(2);
        expect(publicService['http://data.europa.eu/m8g/hasCompetentAuthority']).toEqual(expect.arrayContaining([
            { "@id": "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589" },
            { "@id": "http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4" }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority']).toHaveLength(1);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority']).toEqual(expect.arrayContaining([
            { "@id": bestuurseenheidConfig.uri }
        ]));

        expect(publicService['http://purl.org/dc/terms/source']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/source'][0]).toEqual(
            { "@id": "https://ipdc.tni-vlaanderen.be/id/concept/705d401c-1a41-4802-a863-b22499f71b84" }
        );

        //TODO LPDC-709 This should not be send to IPDC
        expect(publicService['http://schema.org/productID']).toHaveLength(1);
        expect(publicService['http://schema.org/productID']).toEqual(expect.arrayContaining([
            { "@value": "1502" }
        ]));

        expect(publicService['http://mu.semte.ch/vocabularies/core/uuid']).toHaveLength(1);

        //TODO LPDC-709 This should not be send to IPDC
        expect(publicService['http://purl.org/dc/terms/created']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/created'][0]).toEqual(expect.objectContaining(
            { "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }
        ));

        //TODO LPDC-709 This should not be send to IPDC
        expect(publicService['http://purl.org/dc/terms/modified']).toHaveLength(1);
        expect(publicService['http://purl.org/dc/terms/modified'][0]).toEqual(expect.objectContaining(
            { "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }
        ));

        //TODO LPDC-709 This should not be send to IPDC
        expect(publicService['http://purl.org/pav/createdBy']).toHaveLength(1);
        expect(publicService['http://purl.org/pav/createdBy'][0]).toEqual(
            { "@id": bestuurseenheidConfig.uri }
        );

        //TODO LPDC-709 This should not be send to IPDC
        expect(publicService['http://www.w3.org/ns/adms#status']).toHaveLength(1);
        expect(publicService['http://www.w3.org/ns/adms#status'][0]).toEqual(
            { "@id": 'http://lblod.data.gift/concepts/9bd8d86d-bb10-4456-a84e-91e9507c374c' }
        );

        //TODO LPDC-709 This should not be send to IPDC
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag']).toHaveLength(1);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag'][0]).toEqual(
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/YourEuropeVerplicht" }
        );

        //TODO LPDC-698 verify Language is send to IPDC

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium']).toHaveLength(1);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium'][0]).toEqual(
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope" }
        );

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${regelgeving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${regelgevingEngels}</p>` }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience']).toEqual(expect.arrayContaining([
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Vereniging" },
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Organisatie" }
        ]));

        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory']).toHaveLength(2);
        expect(publicService['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory']).toEqual(expect.arrayContaining([
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgMedischeBehandeling" },
            { "@id": "https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgPreventieveOpenbareGezondheidsmaatregelen" }
        ]));

        expect(publicService['http://data.europa.eu/m8g/hasCost']).toHaveLength(1);
        const costUri = publicService['http://data.europa.eu/m8g/hasCost'][0]['@id'];

        expect(publicService['http://purl.org/vocab/cpsv#follows']).toHaveLength(1);
        const procedureUri = publicService['http://purl.org/vocab/cpsv#follows'][0]["@id"];

        expect(publicService['http://purl.org/vocab/cpsv#produces']).toHaveLength(1);
        const financialAdvantageUri = publicService['http://purl.org/vocab/cpsv#produces'][0]['@id'];

        expect(publicService['http://vocab.belgif.be/ns/publicservice#hasRequirement']).toHaveLength(1);
        const voorwaardeUri = publicService['http://vocab.belgif.be/ns/publicservice#hasRequirement'][0]['@id'];

        expect(publicService['http://www.w3.org/2000/01/rdf-schema#seeAlso']).toHaveLength(1);
        const websiteUri = publicService['http://www.w3.org/2000/01/rdf-schema#seeAlso'][0]['@id'];

        expect(publicService['http://data.europa.eu/m8g/hasContactPoint']).toHaveLength(1);
        const contactPuntUri = publicService['http://data.europa.eu/m8g/hasContactPoint'][0]['@id'];

        expect(publicService['http://data.europa.eu/m8g/hasLegalResource']).toHaveLength(1);
        const legalResourceUri = publicService['http://data.europa.eu/m8g/hasLegalResource'][0]['@id'];
        expect(legalResourceUri).toEqual('https://ipdc.be/regelgeving');

        // COST
        const cost = IpdcStub.getObjectById(instance, costUri);

        expect(cost['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(cost['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": kostTitel },
            { "@language": "en", "@value": kostTitelEngels }
        ]));

        expect(cost['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(cost['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${kostBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${kostBeschrijvingEngels}</p>` }
        ]));

        expect(cost['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(cost['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({ "@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // REQUIREMENT
        const voorwaarde = IpdcStub.getObjectById(instance, voorwaardeUri);

        expect(voorwaarde['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(voorwaarde['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": voorwaardeTitel },
            { "@language": "en", "@value": voorwaardeTitelEngels }
        ]));

        expect(voorwaarde['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(voorwaarde['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${voorwaardeBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${voorwaardeBeschrijvingEngels}</p>` }
        ]));

        expect(voorwaarde['http://data.europa.eu/m8g/hasSupportingEvidence']).toHaveLength(1);
        const evidenceUri = voorwaarde['http://data.europa.eu/m8g/hasSupportingEvidence'][0]['@id'];

        expect(voorwaarde['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(voorwaarde['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({ "@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // REQUIREMENT EVIDENCE
        const evidence = IpdcStub.getObjectById(instance, evidenceUri);

        expect(evidence['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(evidence['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": bewijsTitel },
            { "@language": "en", "@value": bewijsTitelEngels }
        ]));

        expect(evidence['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(evidence['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${bewijsBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${bewijsBeschrijvingEngels}</p>` }
        ]));

        // FINANCIAL ADVANTAGE
        const financialAdvantage = IpdcStub.getObjectById(instance, financialAdvantageUri);

        expect(financialAdvantage['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(financialAdvantage['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": financieelVoordeelTitel },
            { "@language": "en", "@value": financieelVoordeelTitelEngels }
        ]));

        expect(financialAdvantage['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(financialAdvantage['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${financieelVoordeelBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${financieelVoordeelBeschrijvingEngels}</p>` }
        ]));

        expect(financialAdvantage['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(financialAdvantage['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({ "@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // PROCEDURE
        const procedure = IpdcStub.getObjectById(instance, procedureUri);

        expect(procedure['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(procedure['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": procedureTitel },
            { "@language": "en", "@value": procedureTitelEngels }
        ]));

        expect(procedure['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(procedure['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${procedureBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${procedureBeschrijvingEngels}</p>` }
        ]));

        expect(procedure['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites']).toHaveLength(1);
        const procedureWebsiteUri = procedure['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites'][0]['@id'];

        expect(procedure['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(procedure['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({ "@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // PROCEDURE WEBSITE
        const procedureWebsite = IpdcStub.getObjectById(instance, procedureWebsiteUri);

        expect(procedureWebsite['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(procedureWebsite['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": procedureWebsiteTitel },
            { "@language": "en", "@value": procedureWebsiteTitelEngels }
        ]));

        expect(procedureWebsite['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(procedureWebsite['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${procedureWebsiteBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${procedureWebsiteBeschrijvingEngels}</p>` }
        ]));

        expect(procedureWebsite['http://schema.org/url']).toHaveLength(1);
        expect(procedureWebsite['http://schema.org/url'][0]).toEqual({ "@value": procedureWebsiteUrl });

        expect(procedureWebsite['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(procedureWebsite['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({ "@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // MORE INFO WEBSITE
        const website = IpdcStub.getObjectById(instance, websiteUri);

        expect(website['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(website['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            { "@language": expectedFormalOrInformalTripleLanguage, "@value": websiteTitel },
            { "@language": "en", "@value": websiteTitelEngels }
        ]));

        expect(website['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(website['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${websiteBeschrijving}</p>`
            },
            { "@language": "en", "@value": `<p data-indentation-level="0">${websiteBeschrijvingEngels}</p>` }
        ]));

        expect(website['http://schema.org/url']).toHaveLength(1);
        expect(website['http://schema.org/url'][0]).toEqual({ "@value": websiteUrl });

        expect(website['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(website['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({ "@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // CONTACT POINT
        const contactPunt = IpdcStub.getObjectById(instance, contactPuntUri);

        expect(contactPunt['http://schema.org/email']).toHaveLength(1);
        expect(contactPunt['http://schema.org/email']).toEqual([{ "@value": '1111@example.com' }]);

        expect(contactPunt['http://schema.org/telephone']).toHaveLength(1);
        expect(contactPunt['http://schema.org/telephone']).toEqual([{ "@value": '111111111' }]);

        expect(contactPunt['http://schema.org/url']).toHaveLength(1);
        expect(contactPunt['http://schema.org/url']).toEqual([{ "@value": 'https://www.example1.com' }]);

        expect(contactPunt['http://schema.org/openingHours']).toHaveLength(1);
        expect(contactPunt['http://schema.org/openingHours']).toEqual([{ "@value": 'https://www.example1.com/openinghours' }]);

        expect(contactPunt['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address']).toHaveLength(1);
        const contactpuntAdresUri = contactPunt['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address'][0]['@id'];

        // CONTACT POINT ADRES
        const contactPuntAdres = IpdcStub.getObjectById(instance, contactpuntAdresUri);

        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#land']).toHaveLength(1);
        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#land']).toEqual([
            { "@language": 'nl', "@value": 'België' },
        ]);

        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#gemeentenaam']).toHaveLength(1);
        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#gemeentenaam']).toEqual([
            { "@language": 'nl', "@value": 'Harelbeke' },
        ]);

        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#postcode']).toHaveLength(1);
        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#postcode']).toEqual([
            { "@value": '8530' },
        ]);

        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#Straatnaam']).toHaveLength(1);
        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#Straatnaam']).toEqual([
            { "@language": 'nl', "@value": 'Generaal Deprezstraat' },
        ]);

        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer']).toHaveLength(1);
        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer']).toEqual([
            { "@value": '2' },
        ]);

        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer']).toHaveLength(1);
        expect(contactPuntAdres['https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer']).toEqual([
            { "@value": '50' },
        ]);
    }

});

