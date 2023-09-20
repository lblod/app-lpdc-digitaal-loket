import { test, expect, Page } from '@playwright/test';
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
        //TODO LPDC-680: can creation be moved to before all ? 
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);
        const uJeModal = UJeModal.create(page);
        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);

        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill('Pepingen');
        //TODO LPDC-680: expose row in table, and click it.
        await mockLoginPage.login('Gemeente Pepingen');

        await homePage.expectToBeVisible();

        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();
    });

    test.afterEach(async () => {
        await page.close();
    })

    test('Load concept overview from ldes-stream', async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row)).toBeVisible();
        await expect(toevoegenPage.resultTable.linkWithTextInRow('Concept 1 edited', second_row)).toBeVisible();
    });

    test('Load concept detail', async () => {
        //TODO LPDC-680: add test to verify in detail all fields of the concept
    });

    test(`Create instance from concept and edit fully and send to IPDC and verify readonly version fully`, async () => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.linkWithTextInRow('Akte van Belgische nationaliteit', first_row).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Akte van Belgische nationaliteit - nl');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText('Akte van Belgische nationaliteit - nl');
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        expect(titel).toEqual('Akte van Belgische nationaliteit - nl');
        const newTitel = titel + uuid();
        await instantieDetailsPage.titelInput.fill(newTitel);
        const titelEngels = await instantieDetailsPage.titelEngelsInput.inputValue();
        expect(titelEngels).toEqual('Certificate of Belgian nationality');
        const newTitelEngels = titelEngels + uuid();
        await instantieDetailsPage.titelEngelsInput.fill(newTitelEngels);

        const beschrijving = await instantieDetailsPage.beschrijvingEditor.textContent();
        expect(beschrijving).toEqual('De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen. - nl');
        const newBeschrijving = beschrijving + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(newBeschrijving);
        const beschrijvingEngels = await instantieDetailsPage.beschrijvingEngelsEditor.textContent();
        expect(beschrijvingEngels).toEqual('The certificate of Belgian nationality is granted to citizens who have acquired Belgian nationality through the procedure of nationality declaration or naturalisation.');
        const newBeschrijvingEngels = beschrijvingEngels + uuid();
        await instantieDetailsPage.beschrijvingEngelsEditor.fill(newBeschrijvingEngels);

        const aanvullendeBeschrijving = await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent();
        expect(aanvullendeBeschrijving).toEqual('Verdere beschrijving - nl');
        const newAanvullendeBeschrijving = aanvullendeBeschrijving + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill(newAanvullendeBeschrijving);
        const aanvullendeBeschrijvingEngels = await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.textContent();
        expect(aanvullendeBeschrijvingEngels).toEqual('The certificate states:the last name, first names, date and place of birth of the person to whom the certificate relatesthe legal foundation of the declaration on the basis of which the certificate was drawn upin the case nationality is granted on the basis of Articles 8, § 1, 2°, b), 9, 2°, b), and 11, § 2, of the Belgian Nationality Code: the last name, first names, date and place of birth of the declarant or declarants.Under certain conditions, you can request a copy of or an extract from the certificate of Belgian nationality:A copy contains the original data of the certificate and the history of the status of the person to whom the certificate relates.An extract, on the contrary, only states the current details of the certificate, without stating the history of the status of the person to whom the certificate relates. Therefore, an extract only shows the current status of the data.');
        const newAanvullendeBeschrijvingEngels = aanvullendeBeschrijvingEngels + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEngelsEditor.fill(newAanvullendeBeschrijvingEngels);

        const uitzonderingen = await instantieDetailsPage.uitzonderingenEditor.textContent();
        expect(uitzonderingen).toEqual('Uitzonderingen - nl');
        const newUitzonderingen = uitzonderingen + uuid();
        await instantieDetailsPage.uitzonderingenEditor.fill(newUitzonderingen);
        const uitzonderingenEngels = await instantieDetailsPage.uitzonderingenEngelsEditor.textContent();
        expect(uitzonderingenEngels).toEqual('Uitzonderingen - en');
        const newUitzonderingenEngels = uitzonderingenEngels + uuid();
        await instantieDetailsPage.uitzonderingenEngelsEditor.fill(newUitzonderingenEngels);

        const titelVoorwaarde = await instantieDetailsPage.titelVoorwaardeInput.inputValue();
        expect(titelVoorwaarde).toEqual('Voorwaarden - nl');
        const newTitelVoorwaarde = titelVoorwaarde + uuid();
        await instantieDetailsPage.titelVoorwaardeInput.fill(newTitelVoorwaarde);
        const titelVoorwaardeEngels = await instantieDetailsPage.titelVoorwaardeEngelsInput.inputValue();
        expect(titelVoorwaardeEngels).toEqual('Requirements');
        const newTitelVoorwaardeEngels = titelVoorwaardeEngels + uuid();
        await instantieDetailsPage.titelVoorwaardeEngelsInput.fill(newTitelVoorwaardeEngels);
        const beschrijvingVoorwaarde = await instantieDetailsPage.beschrijvingVoorwaardeEditor.textContent();
        expect(beschrijvingVoorwaarde).toEqual('De akte vermeldt:de naam, de voornamen, de geboortedatum en de geboorteplaats van de persoon op wie de akte betrekking heeftde wettelijke basis van de verklaring op basis waarvan de akte werd opgesteldin geval van nationaliteitstoekenning op basis van de artikelen 8, § 1, 2°, b), 9, 2°, b), en 11, § 2, van het Wetboek van de Belgische nationaliteit: de naam, de voornamen, de geboortedatum en de geboorteplaats van de verklaarder of verklaarders.Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen:Een afschrift vermeldt de oorspronkelijke gegevens van de akte en de historiek van de staat van de persoon op wie de akte betrekking heeft.Een uittreksel vermeldt daarentegen enkel de actuele gegevens van de akte, zonder vermelding van de historiek van de staat van de persoon op wie de akte betrekking heeft. Op een uittreksel is dus enkel de huidige toestand van de gegevens zichtbaar.Wie kan een afschrift of uittreksel aanvragen?Voor akten van Belgische nationaliteit wordt het recht op een afschrift of uittreksel beperkt tot:uzelfde echtgeno(o)te, overlevende echtgeno(o)te of wettelijk samenwonendeuw wettelijke vertegenwoordiger (bv. ouder, voogd, bewindvoerder)bloedverwanten in opgaande of neerdalende lijn (geen aanverwanten en zijtakken)uw erfgenamenbijzondere gemachtigden zoals een notaris of advocaat.Als de akte meer dan 100 jaar oud is, heeft iedereen recht op een afschrift of uittreksel. - nl');
        const newBeschrijvingVoorwaarde = beschrijvingVoorwaarde + uuid();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor.fill(newBeschrijvingVoorwaarde);
        const beschrijvingVoorwaardeEngels = await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor.textContent();
        expect(beschrijvingVoorwaardeEngels).toEqual('The right to receive a copy of or an extract from certificates of Belgian nationality is limited to:yourselfyour spouse, surviving spouse, or legal cohabitantyour legal representative (e.g. a parent, guardian, conservator)blood relatives in the ascending or descending line (no relatives by affinity and side branches)your heirsspecial agents, such as notaries or lawyers.If the certificate is more than 100 years old, anyone is entitled to request a copy or an extract.');
        const newBeschrijvingVoorwaardeEngels = beschrijvingVoorwaardeEngels + uuid();
        await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor.fill(newBeschrijvingVoorwaardeEngels);

        const titelBewijsstuk = await instantieDetailsPage.titelBewijsstukInput.inputValue();
        expect(titelBewijsstuk).toEqual("Bewijs - nl");
        const newTitelBewijsstuk = titelBewijsstuk + uuid();
        await instantieDetailsPage.titelBewijsstukInput.fill(newTitelBewijsstuk);
        const titelBewijsstukEngels = await instantieDetailsPage.titelBewijsstukEngelsInput.inputValue();
        expect(titelBewijsstukEngels).toEqual('Evidence');
        const newTitelBewijsstukEngels = titelBewijsstukEngels + uuid();
        await instantieDetailsPage.titelBewijsstukEngelsInput.fill(newTitelBewijsstukEngels);
        const beschrijvingBewijsstuk = await instantieDetailsPage.beschrijvingBewijsstukEditor.textContent();
        expect(beschrijvingBewijsstuk).toEqual('Als u het document zelf ophaalt:uw eigen identiteitskaart.Als u het document voor iemand anders aanvraagt:een volmacht van de betrokkene en een kopie van zijn of haar identiteitskaartuw eigen identiteitskaart. - nl');
        const newBeschrijvingBewijsstuk = beschrijvingBewijsstuk + uuid();
        await instantieDetailsPage.beschrijvingBewijsstukEditor.fill(newBeschrijvingBewijsstuk);
        const beschrijvingBewijsstukEngels = await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor.textContent();
        expect(beschrijvingBewijsstukEngels).toEqual('If you collect the document yourself:your own identity card.If you are requesting the document for someone else:a power of attorney from that person and a copy of their identity cardas well as your own identity card.');
        const newBeschrijvingBewijsstukEngels = beschrijvingBewijsstukEngels + uuid();
        await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor.fill(newBeschrijvingBewijsstukEngels);

        const titelProcedure = await instantieDetailsPage.titelProcedureInput.inputValue();
        expect(titelProcedure).toEqual("Procedure - nl");
        const newTitelProcedure = titelProcedure + uuid();
        await instantieDetailsPage.titelProcedureInput.fill(newTitelProcedure);
        const titelProcedureEngels = await instantieDetailsPage.titelProcedureEngelsInput.inputValue();
        expect(titelProcedureEngels).toEqual('Procedure - en');
        const newTitelProcedureEngels = titelProcedureEngels + uuid();
        await instantieDetailsPage.titelProcedureEngelsInput.fill(newTitelProcedureEngels);
        const beschrijvingProcedure = await instantieDetailsPage.beschrijvingProcedureEditor.textContent();
        expect(beschrijvingProcedure).toEqual(`U kunt een afschrift of een uittreksel van de akte van nationaliteit aanvragen in uw gemeente.Als u beschikt over een elektronische identiteitskaart (eID), kunt u een afschrift of uittreksel van de akte online aanvragen:via het e-loket van uw gemeenteof via de attestenpagina van 'Mijn Burgerprofiel'.Die elektronische afschriften en uittreksels zijn voorzien van een elektronisch zegel van het Ministerie van Binnenlandse Zaken. Ze hebben dezelfde juridische waarde als deze afgeleverd door de gemeente. Zolang de informatie op het bewijs correct is, kunt u het geldig gebruiken in om het even welke vorm (op papier of in digitale vorm).Sinds 31 maart 2019 worden akten van de burgerlijke stand uitsluitend digitaal geregistreerd. Dateert uw akte van voor 31 maart 2019, dan is die misschien nog niet in digitale vorm beschikbaar. Sommige gemeenten digitaliseren oude archieven naarmate afschriften of uittreksels van de akten worden opgevraagd of wijzigingen worden aangebracht. - nl`);
        const newBeschrijvingProcedure = beschrijvingProcedure + uuid();
        await instantieDetailsPage.beschrijvingProcedureEditor.fill(newBeschrijvingProcedure);
        const beschrijvingProcedureEngels = await instantieDetailsPage.beschrijvingProcedureEngelsEditor.textContent();
        expect(beschrijvingProcedureEngels).toEqual(`You can request a copy of or an extract from the certificate of nationality from your municipality.If you have an electronic identity card (eID), you can request a copy of or an extract from the certificate onlinevia the e-desk of your municipalityor via the certificates page of ‘My Citizen Profile’>‘Mijn Burgerprofiel’).Those electronic copies and extracts bear the electronic seal of the Ministry of the Interior. They have the same legal value as those issued by the municipality. As long as the information on the certificate is correct, you can use it validly in any format (on paper or in digital format).Since 31 March 2019, certificates from the register office are registered in digital format only. If your certificate dates from before 31 March 2019, it may not yet be available digitally. Some municipalities digitise old archives when copies of or extracts from the certificates are requested or changes are made.`);
        const newBeschrijvingProcedureEngels = beschrijvingProcedureEngels + uuid();
        await instantieDetailsPage.beschrijvingProcedureEngelsEditor.fill(newBeschrijvingProcedureEngels);

        const titelWebsiteVoorProcedure = await instantieDetailsPage.titelWebsiteVoorProcedureInput.inputValue();
        expect(titelWebsiteVoorProcedure).toEqual('Procedure website naam - nl');
        const newTitelWebsiteVoorProcedure = titelWebsiteVoorProcedure + uuid();
        await instantieDetailsPage.titelWebsiteVoorProcedureInput.fill(newTitelWebsiteVoorProcedure);
        const titelWebsiteVoorProcedureEngels = await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput.inputValue();
        expect(titelWebsiteVoorProcedureEngels).toEqual('Procedure website naam - en');
        const newTitelWebsiteVoorProcedureEngels = titelWebsiteVoorProcedureEngels + uuid();
        await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput.fill(newTitelWebsiteVoorProcedureEngels);
        const beschrijvingWebsiteVoorProcedure = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor.textContent();
        expect(beschrijvingWebsiteVoorProcedure).toEqual('procedure website beschrijving - nl');
        const newBeschrijvingWebsiteVoorProcedure = beschrijvingWebsiteVoorProcedure + uuid();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor.fill(newBeschrijvingWebsiteVoorProcedure);
        const beschrijvingWebsiteVoorProcedureEngels = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor.textContent();
        expect(beschrijvingWebsiteVoorProcedureEngels).toEqual('procedure website beschrijving - en');
        const newBeschrijvingWebsiteVoorProcedureEngels = beschrijvingWebsiteVoorProcedureEngels + uuid();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor.fill(newBeschrijvingWebsiteVoorProcedureEngels);
        const websiteURLVoorProcedure = await instantieDetailsPage.websiteURLVoorProcedureInput.inputValue();
        expect(websiteURLVoorProcedure).toEqual('https://procedure-website.com');
        const newWebsiteURLVoorProcedure = 'https://new-procedure-website.com';
        await instantieDetailsPage.websiteURLVoorProcedureInput.fill(newWebsiteURLVoorProcedure);

        const titelKost = await instantieDetailsPage.titelKostInput.inputValue();
        expect(titelKost).toEqual('Bedrag kost - nl');
        const newTitelKost = titelKost + uuid();
        await instantieDetailsPage.titelKostInput.fill(newTitelKost);
        const titelKostEngels = await instantieDetailsPage.titelKostEngelsInput.inputValue();
        expect(titelKostEngels).toEqual('bedrag kost - en');
        const newTitelKostEngels = titelKostEngels + uuid();
        await instantieDetailsPage.titelKostEngelsInput.fill(newTitelKostEngels);
        const beschrijvingKost = await instantieDetailsPage.beschrijvingKostEditor.textContent();
        expect(beschrijvingKost).toEqual('De aanvraag en het attest zijn gratis. - nl');
        const newBeschrijvingKost = beschrijvingKost + uuid();
        await instantieDetailsPage.beschrijvingKostEditor.fill(newBeschrijvingKost);
        const beschrijvingKostEngels = await instantieDetailsPage.beschrijvingKostEngelsEditor.textContent();
        expect(beschrijvingKostEngels).toEqual('De aanvraag en het attest zijn gratis. - en');
        const newBeschrijvingKostEngels = beschrijvingKostEngels + uuid();
        await instantieDetailsPage.beschrijvingKostEngelsEditor.fill(newBeschrijvingKostEngels);

        const titelFinancieelVoordeel = await instantieDetailsPage.titelFinancieelVoordeelInput.inputValue();
        expect(titelFinancieelVoordeel).toEqual('Titel financieel voordeel. - nl');
        const newTitelFinancieelVoordeel = titelFinancieelVoordeel + uuid();
        await instantieDetailsPage.titelFinancieelVoordeelInput.fill(newTitelFinancieelVoordeel);
        const titelFinancieelVoordeelEngels = await instantieDetailsPage.titelFinancieelVoordeelEngelsInput.inputValue();
        expect(titelFinancieelVoordeelEngels).toEqual('Titel financieel voordeel. - en');
        const newTitelFinancieelVoordeelEngels = titelFinancieelVoordeelEngels + uuid();
        await instantieDetailsPage.titelFinancieelVoordeelEngelsInput.fill(newTitelFinancieelVoordeelEngels);
        const beschrijvingFinancieelVoordeel = await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor.textContent();
        expect(beschrijvingFinancieelVoordeel).toEqual('Beschrijving financieel voordeel. - nl');
        const newBeschrijvingFinancieelVoordeel = beschrijvingFinancieelVoordeel + uuid();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor.fill(newBeschrijvingFinancieelVoordeel);
        const beschrijvingFinancieelVoordeelEngels = await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor.textContent();
        expect(beschrijvingFinancieelVoordeelEngels).toEqual('Beschrijving financieel voordeel. - en');
        const newBeschrijvingFinancieelVoordeelEngels = beschrijvingFinancieelVoordeelEngels + uuid();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor.fill(newBeschrijvingFinancieelVoordeelEngels);

        const beschrijvingRegelgeving = await instantieDetailsPage.beschrijvingRegelgevingEditor.textContent();
        expect(beschrijvingRegelgeving).toEqual('Regelgeving - nl');
        const newBeschrijvingRegelgeving = beschrijvingRegelgeving + uuid();
        await instantieDetailsPage.beschrijvingRegelgevingEditor.fill(newBeschrijvingRegelgeving);
        const beschrijvingRegelgevingEngels = await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor.textContent();
        expect(beschrijvingRegelgevingEngels).toEqual('Regelgeving - en');
        const newBeschrijvingRegelgevingEngels = beschrijvingRegelgevingEngels + uuid();
        await instantieDetailsPage.beschrijvingRegelgevingEngelsEditor.fill(newBeschrijvingRegelgevingEngels);

        const titelWebsite = await instantieDetailsPage.titelWebsiteInput.inputValue();
        expect(titelWebsite).toEqual('Website Belgische nationaliteit en naturalisatie - nl');
        const newTitelWebsite = titelWebsite + uuid();
        await instantieDetailsPage.titelWebsiteInput.fill(newTitelWebsite);
        const titelWebsiteEngels = await instantieDetailsPage.titelWebsiteEngelsInput.inputValue();
        expect(titelWebsiteEngels).toEqual('Website Belgische nationaliteit en naturalisatie - en');
        const newTitelWebsiteEngels = titelWebsiteEngels + uuid();
        await instantieDetailsPage.titelWebsiteEngelsInput.fill(newTitelWebsiteEngels);
        const beschrijvingWebsite = await instantieDetailsPage.beschrijvingWebsiteEditor.textContent();
        expect(beschrijvingWebsite).toEqual('Website Belgische nationaliteit en naturalisatie beschrijving - nl');
        const newBeschrijvingWebsite = beschrijvingWebsite + uuid();
        await instantieDetailsPage.beschrijvingWebsiteEditor.fill(newBeschrijvingWebsite);
        const beschrijvingWebsiteEngels = await instantieDetailsPage.beschrijvingWebsiteEngelsEditor.textContent();
        expect(beschrijvingWebsiteEngels).toEqual('Website Belgische nationaliteit en naturalisatie beschrijving - en');
        const newBeschrijvingWebsiteEngels = beschrijvingWebsiteEngels + uuid();
        await instantieDetailsPage.beschrijvingWebsiteEngelsEditor.fill(newBeschrijvingWebsiteEngels);
        const websiteURL = await instantieDetailsPage.websiteURLInput.inputValue();
        expect(websiteURL).toEqual('https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit');
        const newWebsiteURL = 'https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/new-nationaliteit';
        await instantieDetailsPage.websiteURLInput.fill(newWebsiteURL);

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

        //TODO LPDC-698: talen is not correctly processed from the ipdc ldes stream ... add test to unclick ENG and DUE and select FRA and NED (and verify in readonly view)

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(['Europese overheid', 'Federale overheid']);
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Europese overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Federale overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Vlaamse overheid');
        await instantieDetailsPage.bevoegdBestuursniveauMultiSelect.selectValue('Lokale overheid');
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');
        await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Aalst (Gemeente)');
        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(['Derden', 'Lokale overheid']);
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Derden');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Lokale overheid');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Provinciale overheid');
        await instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.selectValue('Federale overheid');
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Pepingen');

        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.expectToBeVisible();
        await homePage.searchInput.fill(newTitel);

        await expect(homePage.resultTable.row(first_row)).toContainText(newTitel);
        await expect(homePage.resultTable.row(first_row)).toContainText('Verzonden');

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(newTitel);
        expect(instancePublishedInIpdc).toBeTruthy();

        await homePage.resultTable.linkWithTextInRow('Bekijk', first_row).click();

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

        await expect(instantieDetailsPage.titelVoorwaardeInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeInput).toHaveValue(newTitelVoorwaarde);
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeEngelsInput).toHaveValue(newTitelVoorwaardeEngels);
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly.textContent()).toContain(newBeschrijvingVoorwaarde);
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeEngelsReadonly.textContent()).toContain(newBeschrijvingVoorwaardeEngels);

        await expect(instantieDetailsPage.titelBewijsstukInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelBewijsstukInput).toHaveValue(newTitelBewijsstuk);
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelBewijsstukEngelsInput).toHaveValue(newTitelBewijsstukEngels);
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly.textContent()).toContain(newBeschrijvingBewijsstuk);
        await expect(instantieDetailsPage.beschrijvingBewijsstukEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukEngelsReadonly.textContent()).toContain(newBeschrijvingBewijsstukEngels);

        await expect(instantieDetailsPage.titelProcedureInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelProcedureInput).toHaveValue(newTitelProcedure);
        await expect(instantieDetailsPage.titelProcedureEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelProcedureEngelsInput).toHaveValue(newTitelProcedureEngels);
        await expect(instantieDetailsPage.beschrijvingProcedureEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly.textContent()).toContain(newBeschrijvingProcedure);
        await expect(instantieDetailsPage.beschrijvingProcedureEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureEngelsReadonly.textContent()).toContain(newBeschrijvingProcedureEngels);

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput).toHaveValue(newTitelWebsiteVoorProcedure);
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput).toHaveValue(newTitelWebsiteVoorProcedureEngels);
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly.textContent()).toContain(newBeschrijvingWebsiteVoorProcedure);
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly.textContent()).toContain(newBeschrijvingWebsiteVoorProcedureEngels);
        await expect(instantieDetailsPage.websiteURLVoorProcedureInput).not.toBeEditable();
        //TODO LPDC-689: uncomment when bug fixed ... the old triple does not get removed from the database, so now and then the old one pops up in as the data
        //await expect(instantieDetailsPage.websiteURLVoorProcedureInput).toHaveValue(newWebsiteURLVoorProcedure);

        await expect(instantieDetailsPage.titelKostInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelKostInput).toHaveValue(newTitelKost);
        await expect(instantieDetailsPage.titelKostEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelKostEngelsInput).toHaveValue(newTitelKostEngels);
        await expect(instantieDetailsPage.beschrijvingKostEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly.textContent()).toContain(newBeschrijvingKost);
        await expect(instantieDetailsPage.beschrijvingKostEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostEngelsReadonly.textContent()).toContain(newBeschrijvingKostEngels);

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelFinancieelVoordeelInput).toHaveValue(newTitelFinancieelVoordeel);
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelFinancieelVoordeelEngelsInput).toHaveValue(newTitelFinancieelVoordeelEngels);
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly.textContent()).toContain(newBeschrijvingFinancieelVoordeel);
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsReadonly.textContent()).toContain(newBeschrijvingFinancieelVoordeelEngels);

        await expect(instantieDetailsPage.beschrijvingRegelgevingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevingReadonly.textContent()).toContain(newBeschrijvingRegelgeving);
        await expect(instantieDetailsPage.beschrijvingRegelgevingEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevingEngelsReadonly.textContent()).toContain(newBeschrijvingRegelgevingEngels);

        await expect(instantieDetailsPage.titelWebsiteInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteInput).toHaveValue(newTitelWebsite);
        await expect(instantieDetailsPage.titelWebsiteEngelsInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteEngelsInput).toHaveValue(newTitelWebsiteEngels);
        await expect(instantieDetailsPage.beschrijvingWebsiteEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteReadonly.textContent()).toContain(newBeschrijvingWebsite);
        await expect(instantieDetailsPage.beschrijvingWebsiteEngelsEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteEngelsReadonly.textContent()).toContain(newBeschrijvingWebsiteEngels);
        await expect(instantieDetailsPage.websiteURLInput).not.toBeEditable();
        //TODO LPDC-689: uncomment when bug fixed ... the old triple does not get removed from the database, so now and then the old one pops up in as the data
        //await expect(instantieDetailsPage.websiteURLInput).toHaveValue(newWebsiteURL);

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
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText('Pepingen');

    });

});



