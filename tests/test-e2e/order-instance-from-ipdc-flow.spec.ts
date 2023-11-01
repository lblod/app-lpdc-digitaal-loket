import {expect, Page, test} from '@playwright/test';
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {MockLoginPage} from "./pages/mock-login-page";
import {UJeModal} from './modals/u-je-modal';
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from './pages/product-of-dienst-toevoegen-page';
import {second_row} from './components/table';
import {ConceptDetailsPage as ConceptDetailsPage} from './pages/concept-details-page';
import {InstantieDetailsPage} from './pages/instantie-details-page';
import {WijzigingenBewarenModal} from './modals/wijzigingen-bewaren-modal';
import {VerzendNaarVlaamseOverheidModal} from './modals/verzend-naar-vlaamse-overheid-modal';

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

test.describe('Order instance from IPDC flow', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({browser}) => {
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

    test.describe('Orders', () => {

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

        test(`Create instance from concept with orders and ensure the orders are Correct`, async () => {
            await CreateInstanceFromConceptWithOrdersAndEnsureTheOrdersAreCorrect('informal', 'nl-be-x-informal', aarschot);
        });

    });

    const CreateInstanceFromConceptWithOrdersAndEnsureTheOrdersAreCorrect = async (formalInformalChoiceSuffix: string, expectedFormalOrInformalTripleLanguage: string, bestuurseenheidConfig: BestuursEenheidConfig) => {
        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();
        await toevoegenPage.resultTable.row(second_row).link('Financiële tussenkomst voor een verblijf in een woonzorgcentrum').click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Financiële tussenkomst voor een verblijf in een woonzorgcentrum');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(`Financiële tussenkomst voor een verblijf in een woonzorgcentrum - ${formalInformalChoiceSuffix}`);
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        const titel = await instantieDetailsPage.titelInput.inputValue();
        expect(titel).toEqual(`Financiële tussenkomst voor een verblijf in een woonzorgcentrum - ${formalInformalChoiceSuffix}`);

        const beschrijving = await instantieDetailsPage.beschrijvingEditor.textContent();
        expect(beschrijving).toEqual(`Als u problemen hebt om uw verblijf in een woonzorgcentrum te betalen, dan kan het OCMW tussenkomen in de financiële kosten. - ${formalInformalChoiceSuffix}`);


        await voorwaardeOrderCheck(formalInformalChoiceSuffix);
        await procedureOrderCheck(formalInformalChoiceSuffix);
        await kostOrderCheck(formalInformalChoiceSuffix);
        await financieelVoordeelOrderCheck(formalInformalChoiceSuffix);
        await websiteOrderCheck(formalInformalChoiceSuffix);
    };
    const voorwaardeOrderCheck = async (formalInformalChoiceSuffix: string) => {

        let titelVoorwaarde;
        let titelVoorwaardeEngels;
        let beschrijvingVoorwaarde;
        let beschrijvingVoorwaardeEngels;
        let titelBewijsstuk;
        let titelBewijsstukEngels;
        let beschrijvingBewijsstuk;
        let beschrijvingBewijsstukEngels;

        for (let i = 1; i < 4; i++) {
            let order = i - 1;

            titelVoorwaarde = await instantieDetailsPage.titelVoorwaardeInput(order).inputValue();
            titelVoorwaardeEngels = await instantieDetailsPage.titelVoorwaardeEngelsInput(order).inputValue();
            expect(titelVoorwaarde).toEqual(`Wat meebrengen - ${formalInformalChoiceSuffix} ${i}`);
            expect(titelVoorwaardeEngels).toEqual(`Bring something ${i}`);

            beschrijvingVoorwaarde = await instantieDetailsPage.beschrijvingVoorwaardeEditor(order).textContent();
            beschrijvingVoorwaardeEngels = await instantieDetailsPage.beschrijvingVoorwaardeEngelsEditor(order).textContent();
            expect(beschrijvingVoorwaarde).toEqual(`Wat meebrengen - ${formalInformalChoiceSuffix} ${i}`);
            expect(beschrijvingVoorwaardeEngels).toEqual(`Bring something ${i}`);


            titelBewijsstuk = await instantieDetailsPage.titelBewijsstukInput(order).inputValue();
            titelBewijsstukEngels = await instantieDetailsPage.titelBewijsstukEngelsInput(order).inputValue();
            expect(titelBewijsstuk).toEqual(`Bewijs om mee te brengen - ${formalInformalChoiceSuffix} ${i}`);
            expect(titelBewijsstukEngels).toEqual(`Evidence to bring with you ${i}`);

            beschrijvingBewijsstuk = await instantieDetailsPage.beschrijvingBewijsstukEditor(order).textContent();
            beschrijvingBewijsstukEngels = await instantieDetailsPage.beschrijvingBewijsstukEngelsEditor(order).textContent();
            expect(beschrijvingBewijsstuk).toEqual(`Een overzicht van het volledige gezinsinkomen, een overzicht van de spaargelden, een kopie van uw identiteitskaart - ${formalInformalChoiceSuffix} ${i}`);
            expect(beschrijvingBewijsstukEngels).toEqual(`An overview of the complete family income, an overview of savings, a copy of your identity card ${i}`);
        }

    }
    const procedureOrderCheck = async (formalInformalChoiceSuffix: string) => {

        let titelProcedure;
        let titelProcedureEngels;
        let beschrijvingProcedure;
        let beschrijvingProcedureEngels;
        let websiteURLVoorProcedure;
        let titelWebsiteVoorProcedure;
        let titelWebsiteVoorProcedureEngels;
        let beschrijvingWebsiteVoorProcedure;
        let beschrijvingWebsiteVoorProcedureEngels;


        titelProcedure = await instantieDetailsPage.titelProcedureInput().inputValue();
        titelProcedureEngels = await instantieDetailsPage.titelProcedureEngelsInput().inputValue();
        expect(titelProcedure).toEqual(`Procedure titel. - ${formalInformalChoiceSuffix}`);
        expect(titelProcedureEngels).toEqual(`Procedure titel. - en`);

        beschrijvingProcedure = await instantieDetailsPage.beschrijvingProcedureEditor().textContent();
        beschrijvingProcedureEngels = await instantieDetailsPage.beschrijvingProcedureEngelsEditor().textContent();
        expect(beschrijvingProcedure).toEqual(`Procedure beschrijving. - ${formalInformalChoiceSuffix}`);
        expect(beschrijvingProcedureEngels).toEqual(`Procedure beschrijving. - en`);

        for (let i = 1; i < 4; i++) {
            let order = i - 1
            titelWebsiteVoorProcedure = await instantieDetailsPage.titelWebsiteVoorProcedureInput(order).inputValue();
            titelWebsiteVoorProcedureEngels = await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(order).inputValue();
            expect(titelWebsiteVoorProcedure).toEqual(`Procedure website naam - ${formalInformalChoiceSuffix} ${i}`);
            expect(titelWebsiteVoorProcedureEngels).toEqual(`Procedure website naam - en ${i}`);

            beschrijvingWebsiteVoorProcedure = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(order).textContent();
            beschrijvingWebsiteVoorProcedureEngels = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor(order).textContent();
            expect(beschrijvingWebsiteVoorProcedure).toEqual(`procedure website beschrijving - ${formalInformalChoiceSuffix} ${i}`);
            expect(beschrijvingWebsiteVoorProcedureEngels).toEqual(`procedure website beschrijving - en ${i}`);

            websiteURLVoorProcedure = await instantieDetailsPage.websiteURLVoorProcedureInput(order).inputValue();
            expect(websiteURLVoorProcedure).toEqual(`https://procedure-website${i}.com`);

        }
    }
    const kostOrderCheck = async (formalInformalChoiceSuffix: string) => {

        let titelKost;
        let titelKostEngels;
        let beschrijvingKost;
        let beschrijvingKostEngels;
        for (let i = 1; i < 4; i++) {
            let order = i - 1

            titelKost = await instantieDetailsPage.titelKostInput(order).inputValue();
            titelKostEngels = await instantieDetailsPage.titelKostEngelsInput(order).inputValue();
            expect(titelKost).toEqual(`Bedrag kost - ${formalInformalChoiceSuffix} ${i}`);
            expect(titelKostEngels).toEqual(`Bedrag kost - en ${i}`);

            beschrijvingKost = await instantieDetailsPage.beschrijvingKostEditor(order).textContent();
            beschrijvingKostEngels = await instantieDetailsPage.beschrijvingKostEngelsEditor(order).textContent();
            expect(beschrijvingKost).toEqual(`De aanvraag en het attest zijn gratis. - ${formalInformalChoiceSuffix} ${i}`);
            expect(beschrijvingKostEngels).toEqual(`De aanvraag en het attest zijn gratis. - en ${i}`);
        }
    }

    const financieelVoordeelOrderCheck = async (formalInformalChoiceSuffix: string) => {

        let titelProcedure;
        let titelProcedureEngels;
        let beschrijvingProcedure;
        let beschrijvingProcedureEngels;
        let websiteURLVoorProcedure;
        let titelWebsiteVoorProcedure;
        let titelWebsiteVoorProcedureEngels;
        let beschrijvingWebsiteVoorProcedure;
        let beschrijvingWebsiteVoorProcedureEngels;

        for (let i = 1; i < 4; i++) {
            let order = i - 1

            const titelFinancieelVoordeel = await instantieDetailsPage.titelFinancieelVoordeelInput(order).inputValue();
            const titelFinancieelVoordeelEngels = await instantieDetailsPage.titelFinancieelVoordeelEngelsInput(order).inputValue();
            expect(titelFinancieelVoordeel).toEqual(`Titel financieel voordeel. - ${formalInformalChoiceSuffix} ${i}`);
            expect(titelFinancieelVoordeelEngels).toEqual(`Titel financieel voordeel. - en ${i}`);

            const beschrijvingFinancieelVoordeel = await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor(order).textContent();
            const beschrijvingFinancieelVoordeelEngels = await instantieDetailsPage.beschrijvingFinancieelVoordeelEngelsEditor(order).textContent();
            expect(beschrijvingFinancieelVoordeel).toEqual(`Beschrijving financieel voordeel. - ${formalInformalChoiceSuffix} ${i}`);
            expect(beschrijvingFinancieelVoordeelEngels).toEqual(`Beschrijving financieel voordeel. - en ${i}`);
        }
    }

    const websiteOrderCheck = async (formalInformalChoiceSuffix: string) => {

        let titelWebsite;
        let titelWebsiteEngels;
        let beschrijvingWebsite;
        let beschrijvingWebsiteEngels;
        let websiteURL;

        for (let i = 1; i < 4; i++) {
            let order = i - 1

            titelWebsite = await instantieDetailsPage.titelWebsiteInput(order).inputValue();
            titelWebsiteEngels = await instantieDetailsPage.titelWebsiteEngelsInput(order).inputValue();
            expect(titelWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie - ${formalInformalChoiceSuffix} ${i}`);
            expect(titelWebsiteEngels).toEqual(`Website Belgische nationaliteit en naturalisatie - en ${i}`);

            beschrijvingWebsite = await instantieDetailsPage.beschrijvingWebsiteEditor(order).textContent();
            beschrijvingWebsiteEngels = await instantieDetailsPage.beschrijvingWebsiteEngelsEditor(order).textContent();
            expect(beschrijvingWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie beschrijving - ${formalInformalChoiceSuffix} ${i}`);
            expect(beschrijvingWebsiteEngels).toEqual(`Website Belgische nationaliteit en naturalisatie beschrijving - en ${i}`);

            websiteURL = await instantieDetailsPage.websiteURLInput(order).inputValue();
            expect(websiteURL).toEqual(`https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit_${i}`);
        }
    }



});
