import { test, expect, Page } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from './pages/product-of-dienst-toevoegen-page';
import { first_row } from './components/table';
import { ConceptDetailsPage as ConceptDetailsPage } from './pages/concept-details-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { WijzigingenBewarenModal } from './modals/wijzigingen-bewaren-modal';
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
import { IpdcStub } from './components/ipdc-stub';
import { verifyInstancePublishedOnIPDC } from './shared/verify-instance-published-on-ipdc';
import { BestuursEenheidConfig, aarschot, autonoomGemeentebedrijf, autonoomProvinciebedrijf, dienstverlenendeVereniging, districtWilrijk, hulpverleningszone, leuven, ocmwLeuven, ocmwVereniging, opdrachthoudendeVereniging, pepingen, politieZone, projectvereniging, provincieVlaamsBrabant } from './shared/bestuurseenheid-config';

test.describe.configure({ mode: 'parallel' });

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

        test(`Create instance from concept and edit fully and send to IPDC and verify readonly version fully`, async () => {
            await createInstanceFromConceptAndEditFullyAndSendToIPDCAndVerifyReadonlyVersionFully('nl', 'nl-be-x-formal', leuven);
        });

    });


    for (const bestuur of [provincieVlaamsBrabant, ocmwLeuven, districtWilrijk, autonoomGemeentebedrijf, autonoomProvinciebedrijf, dienstverlenendeVereniging, hulpverleningszone, opdrachthoudendeVereniging, politieZone, projectvereniging, ocmwVereniging]) {
        test.describe(`For andere besturen: ${bestuur.classificatie} ${bestuur.name}`, () => {

            test.beforeEach(async () => {

                await mockLoginPage.goto();
                await mockLoginPage.searchInput.fill(bestuur.name);
                await mockLoginPage.login(`${bestuur.classificatie} ${bestuur.name}`);

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

            test(`Create instance from concept and edit fully and send to IPDC and verify readonly version fully ${bestuur.classificatie}`, async () => {
                await createInstanceFromConceptAndEditFullyAndSendToIPDCAndVerifyReadonlyVersionFully('nl', 'nl-be-x-formal', bestuur);
            });

        });
    }

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

        const beschrijving = await instantieDetailsPage.beschrijvingEditor.textContent();
        expect(beschrijving).toEqual(`De akte van Belgische nationaliteit wordt toegekend aan burgers die de Belgische nationaliteit hebben verkregen via de procedure van nationaliteitsverklaring of van naturalisatie. Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen. - ${formalInformalChoiceSuffix}`);
        const newBeschrijving = beschrijving + uuid();
        await instantieDetailsPage.beschrijvingEditor.fill(newBeschrijving);

        const aanvullendeBeschrijving = await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent();
        expect(aanvullendeBeschrijving).toEqual(`Verdere beschrijving - ${formalInformalChoiceSuffix}`);
        const newAanvullendeBeschrijving = aanvullendeBeschrijving + uuid();
        await instantieDetailsPage.aanvullendeBeschrijvingEditor.fill(newAanvullendeBeschrijving);

        const uitzonderingen = await instantieDetailsPage.uitzonderingenEditor.textContent();
        expect(uitzonderingen).toEqual(`Uitzonderingen - ${formalInformalChoiceSuffix}`);
        const newUitzonderingen = uitzonderingen + uuid();
        await instantieDetailsPage.uitzonderingenEditor.fill(newUitzonderingen);

        const titelVoorwaarde = await instantieDetailsPage.titelVoorwaardeInput().inputValue();
        expect(titelVoorwaarde).toEqual(`Voorwaarden - ${formalInformalChoiceSuffix}`);
        const newTitelVoorwaarde = titelVoorwaarde + uuid();
        await instantieDetailsPage.titelVoorwaardeInput().fill(newTitelVoorwaarde);
        const beschrijvingVoorwaarde = await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent();
        expect(beschrijvingVoorwaarde).toEqual(`De akte vermeldt:de naam, de voornamen, de geboortedatum en de geboorteplaats van de persoon op wie de akte betrekking heeftde wettelijke basis van de verklaring op basis waarvan de akte werd opgesteldin geval van nationaliteitstoekenning op basis van de artikelen 8, § 1, 2°, b), 9, 2°, b), en 11, § 2, van het Wetboek van de Belgische nationaliteit: de naam, de voornamen, de geboortedatum en de geboorteplaats van de verklaarder of verklaarders.Onder bepaalde voorwaarden kunt u een afschrift of een uittreksel van de akte van Belgische nationaliteit aanvragen:Een afschrift vermeldt de oorspronkelijke gegevens van de akte en de historiek van de staat van de persoon op wie de akte betrekking heeft.Een uittreksel vermeldt daarentegen enkel de actuele gegevens van de akte, zonder vermelding van de historiek van de staat van de persoon op wie de akte betrekking heeft. Op een uittreksel is dus enkel de huidige toestand van de gegevens zichtbaar.Wie kan een afschrift of uittreksel aanvragen?Voor akten van Belgische nationaliteit wordt het recht op een afschrift of uittreksel beperkt tot:uzelfde echtgeno(o)te, overlevende echtgeno(o)te of wettelijk samenwonendeuw wettelijke vertegenwoordiger (bv. ouder, voogd, bewindvoerder)bloedverwanten in opgaande of neerdalende lijn (geen aanverwanten en zijtakken)uw erfgenamenbijzondere gemachtigden zoals een notaris of advocaat.Als de akte meer dan 100 jaar oud is, heeft iedereen recht op een afschrift of uittreksel. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingVoorwaarde = beschrijvingVoorwaarde + uuid();
        await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill(newBeschrijvingVoorwaarde);

        const titelBewijsstuk = await instantieDetailsPage.titelBewijsstukInput().inputValue();
        expect(titelBewijsstuk).toEqual(`Bewijs - ${formalInformalChoiceSuffix}`);
        const newTitelBewijsstuk = titelBewijsstuk + uuid();
        await instantieDetailsPage.titelBewijsstukInput().fill(newTitelBewijsstuk);
        const beschrijvingBewijsstuk = await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent();
        expect(beschrijvingBewijsstuk).toEqual(`Als u het document zelf ophaalt:uw eigen identiteitskaart.Als u het document voor iemand anders aanvraagt:een volmacht van de betrokkene en een kopie van zijn of haar identiteitskaartuw eigen identiteitskaart. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingBewijsstuk = beschrijvingBewijsstuk + uuid();
        await instantieDetailsPage.beschrijvingBewijsstukEditor().fill(newBeschrijvingBewijsstuk);

        const titelProcedure = await instantieDetailsPage.titelProcedureInput().inputValue();
        expect(titelProcedure).toEqual(`Procedure - ${formalInformalChoiceSuffix}`);
        const newTitelProcedure = titelProcedure + uuid();
        await instantieDetailsPage.titelProcedureInput().fill(newTitelProcedure);
        const beschrijvingProcedure = await instantieDetailsPage.beschrijvingProcedureEditor().textContent();
        expect(beschrijvingProcedure).toEqual(`U kunt een afschrift of een uittreksel van de akte van nationaliteit aanvragen in uw gemeente.Als u beschikt over een elektronische identiteitskaart (eID), kunt u een afschrift of uittreksel van de akte online aanvragen:via het e-loket van uw gemeenteof via de attestenpagina van 'Mijn Burgerprofiel'.Die elektronische afschriften en uittreksels zijn voorzien van een elektronisch zegel van het Ministerie van Binnenlandse Zaken. Ze hebben dezelfde juridische waarde als deze afgeleverd door de gemeente. Zolang de informatie op het bewijs correct is, kunt u het geldig gebruiken in om het even welke vorm (op papier of in digitale vorm).Sinds 31 maart 2019 worden akten van de burgerlijke stand uitsluitend digitaal geregistreerd. Dateert uw akte van voor 31 maart 2019, dan is die misschien nog niet in digitale vorm beschikbaar. Sommige gemeenten digitaliseren oude archieven naarmate afschriften of uittreksels van de akten worden opgevraagd of wijzigingen worden aangebracht. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingProcedure = beschrijvingProcedure + uuid();
        await instantieDetailsPage.beschrijvingProcedureEditor().fill(newBeschrijvingProcedure);

        const titelWebsiteVoorProcedure = await instantieDetailsPage.titelWebsiteVoorProcedureInput().inputValue();
        expect(titelWebsiteVoorProcedure).toEqual(`Procedure website naam - ${formalInformalChoiceSuffix}`);
        const newTitelWebsiteVoorProcedure = titelWebsiteVoorProcedure + uuid();
        await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill(newTitelWebsiteVoorProcedure);
        const beschrijvingWebsiteVoorProcedure = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent();
        expect(beschrijvingWebsiteVoorProcedure).toEqual(`procedure website beschrijving - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingWebsiteVoorProcedure = beschrijvingWebsiteVoorProcedure + uuid();
        await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().fill(newBeschrijvingWebsiteVoorProcedure);
        const websiteURLVoorProcedure = await instantieDetailsPage.websiteURLVoorProcedureInput().inputValue();
        expect(websiteURLVoorProcedure).toEqual('https://procedure-website.com');
        const newWebsiteURLVoorProcedure = 'https://new-procedure-website.com';
        await instantieDetailsPage.websiteURLVoorProcedureInput().fill(newWebsiteURLVoorProcedure);

        const titelKost = await instantieDetailsPage.titelKostInput().inputValue();
        expect(titelKost).toEqual(`Bedrag kost - ${formalInformalChoiceSuffix}`);
        const newTitelKost = titelKost + uuid();
        await instantieDetailsPage.titelKostInput().fill(newTitelKost);
        const beschrijvingKost = await instantieDetailsPage.beschrijvingKostEditor().textContent();
        expect(beschrijvingKost).toEqual(`De aanvraag en het attest zijn gratis. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingKost = beschrijvingKost + uuid();
        await instantieDetailsPage.beschrijvingKostEditor().fill(newBeschrijvingKost);

        const titelFinancieelVoordeel = await instantieDetailsPage.titelFinancieelVoordeelInput().inputValue();
        expect(titelFinancieelVoordeel).toEqual(`Titel financieel voordeel. - ${formalInformalChoiceSuffix}`);
        const newTitelFinancieelVoordeel = titelFinancieelVoordeel + uuid();
        await instantieDetailsPage.titelFinancieelVoordeelInput().fill(newTitelFinancieelVoordeel);
        const beschrijvingFinancieelVoordeel = await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent();
        expect(beschrijvingFinancieelVoordeel).toEqual(`Beschrijving financieel voordeel. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingFinancieelVoordeel = beschrijvingFinancieelVoordeel + uuid();
        await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().fill(newBeschrijvingFinancieelVoordeel);

        const beschrijvingRegelgeving = await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent();
        expect(beschrijvingRegelgeving).toEqual(`Regelgeving - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingRegelgeving = beschrijvingRegelgeving + uuid();
        await instantieDetailsPage.beschrijvingRegelgevingEditor().fill(newBeschrijvingRegelgeving);

        const titelRegelgevendeBron = await instantieDetailsPage.titelRegelgevendeBronInput().inputValue();
        expect(titelRegelgevendeBron).toEqual(`Titel regelgevende bron. - ${formalInformalChoiceSuffix}`);
        const newTitelRegelgevendeBron = titelRegelgevendeBron + uuid();
        await instantieDetailsPage.titelRegelgevendeBronInput().fill(newTitelRegelgevendeBron);
        const beschrijvingRegelgevendeBron = await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent();
        expect(beschrijvingRegelgevendeBron).toEqual(`Beschrijving regelgevende bron. - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingRegelgevendeBron = beschrijvingRegelgevendeBron + uuid();
        await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().fill(newBeschrijvingRegelgevendeBron);
        const urlRegelgevendeBron = await instantieDetailsPage.regelgevendeBronUrlInput().inputValue();
        expect(urlRegelgevendeBron).toEqual(`https://ipdc.be/regelgeving`);
        const newUrlRegelgevendeBron = 'https://ipdc.be/codex-page';
        await instantieDetailsPage.regelgevendeBronUrlInput().fill(newUrlRegelgevendeBron);

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
        const beschrijvingWebsite = await instantieDetailsPage.beschrijvingWebsiteEditor().textContent();
        expect(beschrijvingWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie beschrijving - ${formalInformalChoiceSuffix}`);
        const newBeschrijvingWebsite = beschrijvingWebsite + uuid();
        await instantieDetailsPage.beschrijvingWebsiteEditor().fill(newBeschrijvingWebsite);
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

        await expect(instantieDetailsPage.talenMultiSelect.options()).toContainText([]);
        await instantieDetailsPage.talenMultiSelect.selectValue('Duits');
        await instantieDetailsPage.talenMultiSelect.selectValue('Engels');
        await instantieDetailsPage.talenMultiSelect.selectValue('Nederlands');
        await instantieDetailsPage.talenMultiSelect.selectValue('Frans');

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
        await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText([`${bestuurseenheidConfig.name} (${bestuurseenheidConfig.classificatie})`]);
        if (bestuurseenheidConfig.spatialNisCode) {
            await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText([bestuurseenheidConfig.spatialNisLabel || '']);
        }
        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Limburg');
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

        const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: newTitel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
        expect(instancePublishedInIpdc).toBeTruthy();
        verifyPublishedInstance(instancePublishedInIpdc, {
            titel: newTitel,
            beschrijving: newBeschrijving,
            aanvullendeBeschrijving: newAanvullendeBeschrijving,
            uitzonderingen: newUitzonderingen,
            regelgeving: newBeschrijvingRegelgeving,
            regelgevendeBronTitel: newTitelRegelgevendeBron,
            regelgevendeBronBeschrijving: newBeschrijvingRegelgevendeBron,
            regelgevendeBronUrl: newUrlRegelgevendeBron,
            kostTitel: newTitelKost,
            kostBeschrijving: newBeschrijvingKost,
            bewijsTitel: newTitelBewijsstuk,
            bewijsBeschrijving: newBeschrijvingBewijsstuk,
            financieelVoordeelTitel: newTitelFinancieelVoordeel,
            financieelVoordeelBeschrijving: newBeschrijvingFinancieelVoordeel,
            voorwaardeTitel: newTitelVoorwaarde,
            voorwaardeBeschrijving: newBeschrijvingVoorwaarde,
            procedureTitel: newTitelProcedure,
            procedureBeschrijving: newBeschrijvingProcedure,
            procedureWebsiteTitel: newTitelWebsiteVoorProcedure,
            procedureWebsiteBeschrijving: newBeschrijvingWebsiteVoorProcedure,
            procedureWebsiteUrl: newWebsiteURLVoorProcedure,
            websiteTitel: newTitelWebsite,
            websiteBeschrijving: newBeschrijvingWebsite,
            websiteUrl: newWebsiteURL
        },
            expectedFormalOrInformalTripleLanguage,
            bestuurseenheidConfig);

        await homePage.resultTable.row(first_row).link('Bekijk').click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.basisinformatieHeading).toBeVisible();

        await expect(instantieDetailsPage.titelInput).not.toBeEditable();
        await expect(instantieDetailsPage.titelInput).toHaveValue(newTitel);

        await expect(instantieDetailsPage.beschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingReadonly.textContent()).toContain(newBeschrijving);

        await expect(instantieDetailsPage.aanvullendeBeschrijvingEditor).not.toBeVisible();
        expect(await instantieDetailsPage.aanvullendeBeschrijvingReadonly.textContent()).toContain(newAanvullendeBeschrijving);

        await expect(instantieDetailsPage.uitzonderingenEditor).not.toBeVisible();
        expect(await instantieDetailsPage.uitzonderingenReadonly.textContent()).toContain(newUitzonderingen);

        await expect(instantieDetailsPage.titelVoorwaardeInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelVoorwaardeInput()).toHaveValue(newTitelVoorwaarde);
        await expect(instantieDetailsPage.beschrijvingVoorwaardeEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingVoorwaardeReadonly().textContent()).toContain(newBeschrijvingVoorwaarde);

        await expect(instantieDetailsPage.titelBewijsstukInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelBewijsstukInput()).toHaveValue(newTitelBewijsstuk);
        await expect(instantieDetailsPage.beschrijvingBewijsstukEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingBewijsstukReadonly().textContent()).toContain(newBeschrijvingBewijsstuk);

        await expect(instantieDetailsPage.titelProcedureInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelProcedureInput()).toHaveValue(newTitelProcedure);
        await expect(instantieDetailsPage.beschrijvingProcedureEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingProcedureReadonly().textContent()).toContain(newBeschrijvingProcedure);

        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).toHaveValue(newTitelWebsiteVoorProcedure);
        await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly().textContent()).toContain(newBeschrijvingWebsiteVoorProcedure);
        await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).not.toBeEditable();
        await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).toHaveValue(newWebsiteURLVoorProcedure);

        await expect(instantieDetailsPage.titelKostInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelKostInput()).toHaveValue(newTitelKost);
        await expect(instantieDetailsPage.beschrijvingKostEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingKostReadonly().textContent()).toContain(newBeschrijvingKost);

        await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).toHaveValue(newTitelFinancieelVoordeel);
        await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelReadonly().textContent()).toContain(newBeschrijvingFinancieelVoordeel);

        await expect(instantieDetailsPage.beschrijvingRegelgevingEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevingReadonly().textContent()).toContain(newBeschrijvingRegelgeving);

        await expect(instantieDetailsPage.titelRegelgevendeBronInput()).not.toBeEditable();
        await expect(instantieDetailsPage.titelRegelgevendeBronInput()).toHaveValue(newTitelRegelgevendeBron);
        await expect(instantieDetailsPage.beschrijvingRegelgevendeBronEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingRegelgevendeBronReadonly().textContent()).toContain(newBeschrijvingRegelgevendeBron);
        expect(await instantieDetailsPage.regelgevendeBronUrlInput()).toHaveValue('https://ipdc.be/codex-page');

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
        await expect(instantieDetailsPage.beschrijvingWebsiteEditor()).not.toBeVisible();
        expect(await instantieDetailsPage.beschrijvingWebsiteReadonly().textContent()).toContain(newBeschrijvingWebsite);
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
        await expect(instantieDetailsPage.talenMultiSelect.options()).toContainText(['Duits', 'Engels', 'Frans', 'Nederlands']);

        await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(['Lokale overheid', 'Vlaamse overheid']);
        await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(['Aalst (Gemeente)', 'Pepingen (Gemeente)']);
        await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(['Federale overheid', 'Provinciale overheid']);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Oud-Heverlee']); // order is alphabetically thus multiple asserts
        if (bestuurseenheidConfig.spatialNisCode) {
            await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText([bestuurseenheidConfig.spatialNisLabel || '']);
        }
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Provincie Limburg']);
        await expect(instantieDetailsPage.geografischToepassingsgebiedMultiSelect.options()).toContainText(['Oud-Heverlee']);

        await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(['Akte - nl', 'een-nieuwe-tag', 'Nationaliteit - nl']);
        await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText('Your Europe');
        await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(['Medische behandeling ondergaan', 'Rechten en verplichtingen tot preventieve openbare gezondheidsmaatregelen']);

    };

    function verifyPublishedInstance(instance: any[], {
        titel,
        beschrijving,
        aanvullendeBeschrijving,
        uitzonderingen,
        regelgeving,
        regelgevendeBronTitel,
        regelgevendeBronBeschrijving,
        regelgevendeBronUrl,
        kostTitel,
        kostBeschrijving,
        bewijsTitel,
        bewijsBeschrijving,
        financieelVoordeelTitel,
        financieelVoordeelBeschrijving,
        voorwaardeTitel,
        voorwaardeBeschrijving,
        procedureTitel,
        procedureBeschrijving,
        procedureWebsiteTitel,
        procedureWebsiteBeschrijving,
        procedureWebsiteUrl,
        websiteTitel,
        websiteBeschrijving,
        websiteUrl
    },
        expectedFormalOrInformalTripleLanguage: string,
        bestuurseenheidConfig: BestuursEenheidConfig) {

        verifyInstancePublishedOnIPDC(
            instance,
            {
                titel: { nl: titel },
                beschrijving: { nl: beschrijving },
                aanvullendeBeschrijving: { nl: aanvullendeBeschrijving },
                uitzonderingen: { nl: uitzonderingen },
                voorwaarden: [
                    {
                        titel: { nl: voorwaardeTitel },
                        beschrijving: { nl: voorwaardeBeschrijving },
                        order: 0,
                        nestedGroup: [
                            {
                                titel: { nl: bewijsTitel },
                                beschrijving: { nl: bewijsBeschrijving }
                            }
                        ]
                    }
                ],
                procedures: [
                    {
                        titel: { nl: procedureTitel },
                        beschrijving: { nl: procedureBeschrijving },
                        order: 0,
                        nestedGroup: [
                            {
                                titel: { nl: procedureWebsiteTitel },
                                beschrijving: { nl: procedureWebsiteBeschrijving },
                                url: procedureWebsiteUrl,
                                order: 0,
                            }
                        ]
                    }
                ],
                kosten: [
                    {
                        titel: { nl: kostTitel },
                        beschrijving: { nl: kostBeschrijving },
                        order: 0
                    }],
                financieleVoordelen: [
                    {
                        titel: { nl: financieelVoordeelTitel },
                        beschrijving: { nl: financieelVoordeelBeschrijving },
                        order: 0
                    }],
                regelgeving: { nl: regelgeving },
                regelgevendeBronnen: [
                    {
                        titel: { nl: regelgevendeBronTitel },
                        beschrijving: { nl: regelgevendeBronBeschrijving },
                        url: regelgevendeBronUrl,
                        order: 0
                    }],
                contactPunten: [
                    {
                        email: '1111@example.com',
                        telephone: '111111111',
                        url: 'https://www.example1.com',
                        openingHours: 'https://www.example1.com/openinghours',
                        order: 1,
                        address: {
                            land: 'België',
                            gemeentenaam: 'Harelbeke',
                            postcode: '8530',
                            straatnaam: 'Generaal Deprezstraat',
                            huisnummer: '2',
                            busnummer: '50',
                        }
                    }
                ],
                meerInfos: [
                    {
                        titel: { nl: websiteTitel },
                        beschrijving: { nl: websiteBeschrijving },
                        url: websiteUrl,
                        order: 0
                    }],
                uuid: 'PRESENT',
                createdBy: bestuurseenheidConfig.uri,
                productId: '1502',
                conceptSource: 'https://ipdc.tni-vlaanderen.be/id/concept/705d401c-1a41-4802-a863-b22499f71b84',
                conceptStatus: 'http://lblod.data.gift/concepts/instance-status/verstuurd',
                type: 'https://productencatalogus.data.vlaanderen.be/id/concept/Type/InfrastructuurMateriaal',
                aangemaaktOp: `PRESENT`,
                bewerktOp: `PRESENT`,
                geldigVanaf: `2019-04-13T00:00:00Z`,
                geldigTot: `2026-11-27T00:00:00Z`,
                doelgroepen: [
                    'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Vereniging',
                    'https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Organisatie',
                ],
                themas: [
                    'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/MilieuEnergie',
                    'https://productencatalogus.data.vlaanderen.be/id/concept/Thema/EconomieWerk',
                ],
                talen: [
                    'http://publications.europa.eu/resource/authority/language/ENG',
                    'http://publications.europa.eu/resource/authority/language/FRA',
                    'http://publications.europa.eu/resource/authority/language/DEU',
                    'http://publications.europa.eu/resource/authority/language/NLD',
                ],
                bevoegdeBestuursniveaus: [
                    'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Vlaams',
                    'https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Lokaal',
                ],
                bevoegdeOverheden: [
                    'http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589',
                    'http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4'
                ],
                uitvoerendeBestuursniveaus: [
                    'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Federaal',
                    'https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Provinciaal'
                ],
                uitvoerendeOverheden: [
                    bestuurseenheidConfig.uri
                ],
                geografischeToepassingsgebieden: (bestuurseenheidConfig.spatialNisCode ? [
                    bestuurseenheidConfig.spatialNisCode,
                    'http://data.europa.eu/nuts/code/BE24224086',
                    'http://data.europa.eu/nuts/code/BE22'
                ] : [
                    'http://data.europa.eu/nuts/code/BE24224086',
                    'http://data.europa.eu/nuts/code/BE22'
                ]),
                zoektermen: ['Akte - nl', 'Nationaliteit - nl', 'een-nieuwe-tag'],
                publicatieKanalen: ['https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope'],
                yourEuropeCategorieen: [
                    'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgMedischeBehandeling',
                    'https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/GezondheidszorgPreventieveOpenbareGezondheidsmaatregelen']
            },
            expectedFormalOrInformalTripleLanguage);

    }

});

