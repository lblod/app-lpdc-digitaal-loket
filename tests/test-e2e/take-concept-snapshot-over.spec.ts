import { expect, Page, test } from "@playwright/test";
import { IpdcStub } from "./components/ipdc-stub";
import { first_row } from "./components/table";
import { MockLoginPage } from "./pages/mock-login-page";
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from "./pages/product-of-dienst-toevoegen-page";
import { ConceptDetailsPage } from "./pages/concept-details-page";
import { InstantieDetailsPage } from "./pages/instantie-details-page";
import { WijzigingenBewarenModal } from "./modals/wijzigingen-bewaren-modal";
import { VerzendNaarVlaamseOverheidModal } from "./modals/verzend-naar-vlaamse-overheid-modal";
import { UJeModal } from "./modals/u-je-modal";
import { v4 as uuid } from "uuid";
import { WijzigingenOvernemenModal } from "./modals/wijzigingen-overnemen-modal";
import { BevestigHerzieningVerwerktModal } from "./modals/bevestig-herziening-verwerkt-modal";
import { ConceptOvernemenModal } from "./modals/concept-overnemen-modal";
import moment from 'moment';
import { wait } from "./shared/shared";
import { InstantieAutomatischOmzettenVanUNaarJeModal } from "./modals/instantie-automatisch-omzetten-van-u-naar-je-modal";
import { randomGemeenteZonderFormeleInformeleKeuze } from "./shared/bestuurseenheid-config";

test.describe.configure({ mode: 'parallel' });
test.describe('take concept snapshot over', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let wijzigingenOvernemenModal: WijzigingenOvernemenModal;
    let bevestigHerzieningVerwerktModal: BevestigHerzieningVerwerktModal
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let instantieAutomatischOmzettenVanUNaarJeModal: InstantieAutomatischOmzettenVanUNaarJeModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        conceptDetailsPage = ConceptDetailsPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        wijzigingenBewarenModal = WijzigingenBewarenModal.create(page);
        wijzigingenOvernemenModal = WijzigingenOvernemenModal.create(page);
        bevestigHerzieningVerwerktModal = BevestigHerzieningVerwerktModal.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);
        instantieAutomatischOmzettenVanUNaarJeModal = InstantieAutomatischOmzettenVanUNaarJeModal.create(page);
        
    });

    test.afterEach(async () => {
        await page.close();
    });

    test.describe('Fully take concept snapshot over', () => {

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

        test('given updated title and cost in concept snapshot after instance is created then fields gets overriden', async ({ request }) => {
            await homePage.productOfDienstToevoegenButton.click();

            await toevoegenPage.expectToBeVisible();
            const conceptId = uuid();
            const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchConcept(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await toevoegenPage.searchConcept(createSnapshot.title);
            await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toHaveText(createSnapshot.title);

            const titel = await instantieDetailsPage.titelInput.inputValue();
            let newTitel = titel + uuid();
            await instantieDetailsPage.titelInput.fill(newTitel);

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();
            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();

            // update concept snapshot
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(newTitel);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(newTitel).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.conceptVolledigOvernemenButton.click()
            await wijzigingenOvernemenModal.expectToBeClosed()

            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot.title);
            expect(await instantieDetailsPage.titelKostInput().inputValue()).toEqual(`Kost - updated - ${conceptId} - ${updateSnapshot.id}-1`);
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toEqual(`Kost beschrijving - updated - ${conceptId} - ${updateSnapshot.id}-1`);
        })

        test('given published instance when updated title and cost in concept snapshot after instance is created then is back in draft mode and modal does not show', async ({ request }) => {

            await homePage.productOfDienstToevoegenButton.click();

            await toevoegenPage.expectToBeVisible();
            const conceptId = uuid();
            const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId);
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchConcept(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await toevoegenPage.searchConcept(createSnapshot.title);
            await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toHaveText(createSnapshot.title);

            const titel = await instantieDetailsPage.titelInput.inputValue();
            let newTitel = titel + uuid();
            await instantieDetailsPage.titelInput.fill(newTitel);
            await instantieDetailsPage.titelInput.blur();

            await instantieDetailsPage.eigenschappenTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText([]);
            await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Pepingen (Gemeente)');

            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            // update concept snapshot
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(newTitel);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(newTitel);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(newTitel).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.conceptVolledigOvernemenButton.click();
            await wijzigingenOvernemenModal.expectToBeClosed();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible()
        });

    });

    test.describe('Take concept snapshot over field by field', () => {

        const conceptId = uuid();
        let createSnapshot;

        const productTypesMap = {
            'Toelating': 'Toelating',
            'FinancieelVoordeel': 'Financieel voordeel',
            'InfrastructuurMateriaal': 'Infrastructuur en materiaal',
            'Bewijs': 'Bewijs',
            'AdviesBegeleiding': 'Advies en begeleiding',
            'Voorwerp': 'Voorwerp',
            'FinancieleVerplichting': 'Financiële verplichting',
        };

        const doelgroepenMap = {
            'Burger': 'Burger',
            'Onderneming': 'Onderneming',
            'Organisatie': 'Organisatie',
            'Vereniging': 'Vereniging',
            'LokaalBestuur': 'Lokaal bestuur',
            'VlaamseOverheid': 'Vlaamse Overheid',
        };

        const themasMap = {
            'BurgerOverheid': 'Burger en Overheid',
            'CultuurSportVrijeTijd': 'Cultuur, Sport en Vrije Tijd',
            'EconomieWerk': 'Economie en Werk',
            'MilieuEnergie': 'Milieu en Energie',
            'BouwenWonen': 'Bouwen en Wonen',
            'WelzijnGezondheid': 'Welzijn en Gezondheid',
        };

        const bevoegdeBestuursniveausMap = {
            'Europees': 'Europese overheid',
            'Federaal': 'Federale overheid',
            'Vlaams': 'Vlaamse overheid',
            'Provinciaal': 'Provinciale overheid',
            'Lokaal': 'Lokale overheid',
        }

        const pepingen = {
            uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
            name: 'Pepingen',
        }

        const aarschot = {
            uri: "http://data.lblod.info/id/bestuurseenheden/ba4d960fe3e01984e15fd0b141028bab8f2b9b240bf1e5ab639ba0d7fe4dc522",
            name: 'Aarschot',
        }

        const leuven = {
            uri: "http://data.lblod.info/id/bestuurseenheden/c648ea5d12626ee3364a02debb223908a71e68f53d69a7a7136585b58a083e77",
            name: 'Leuven',
        }

        const gent = {
            uri: "http://data.lblod.info/id/bestuurseenheden/353234a365664e581db5c2f7cc07add2534b47b8e1ab87c821fc6e6365e6bef5",
            name: 'Gent',
        }

        const holsbeek = {
            uri: "http://data.lblod.info/id/bestuurseenheden/8a7354b76f3d258f9596fa454ec2b75b55be47234366c8f8d7d60eea96dfbebf",
            name: 'Holsbeek',
        }

        const westerlo = {
            uri: "http://data.lblod.info/id/bestuurseenheden/8cd07007fee51d55760f7d3d14944b548d98061a9eca4eafe825c89a1145aaf3",
            name: 'Westerlo',
        }

        const zoutleeuw = {
            uri: "http://data.lblod.info/id/bestuurseenheden/8da71bf3f06102d4c2e45daa597622ffd1c13ca150ddd12f6258e02855cdaeb5",
            name: 'Zoutleeuw',
        }

        const ranst = {
            uri: "http://data.lblod.info/id/bestuurseenheden/93746445b8e49813e27e0d07459a2dac0d8d4aafb85d87662addecb3644c6c02",
            name: 'Ranst',
        }

        const lennik = {
            uri: "http://data.lblod.info/id/bestuurseenheden/92f38467d9467707d91ba9cb3c5c165cd58447078d985b25a651b3f01e8695cd",
            name: 'Lennik',
        }

        const mol = {
            uri: "http://data.lblod.info/id/bestuurseenheden/904ebf5719a5a4e125a3f9fdcd25b08e336f822ca786dc2b30dfca927033e4e4",
            name: 'Mol',
        }

        const oosterzele = {
            uri: "http://data.lblod.info/id/bestuurseenheden/8df96cc548c53410332620ec1adae4591bd5340127b1332c4b902c5c3afe260d",
            name: 'Oosterzele',
        }

        const overhedenMap = {
            [pepingen.uri]: `${pepingen.name} (Gemeente)`,
            [aarschot.uri]: `${aarschot.name} (Gemeente)`,
            [leuven.uri]: `${leuven.name} (Gemeente)`,
            [gent.uri]: `${gent.name} (Gemeente)`,
            [holsbeek.uri]: `${holsbeek.name} (OCMW)`,
            [westerlo.uri]: `${westerlo.name} (OCMW)`,
            [zoutleeuw.uri]: `${zoutleeuw.name} (Gemeente)`,
            [ranst.uri]: `${ranst.name} (OCMW)`,
            [lennik.uri]: `${lennik.name} (OCMW)`,
            [mol.uri]: `${mol.name} (OCMW)`,
            [oosterzele.uri]: `${oosterzele.name} (Gemeente)`,
        };

        const uitvoerendeBestuursniveausMap = {
            'Europees': 'Europese overheid',
            'Federaal': 'Federale overheid',
            'Vlaams': 'Vlaamse overheid',
            'Provinciaal': 'Provinciale overheid',
            'Lokaal': 'Lokale overheid',
            'Derden': 'Derden'
        };

        const publicatieKanalenMap = {
            'YourEurope': 'Your Europe',
        };

        const yourEuropeCategorieënMap = {
            'BedrijfIntellectueleEigendomsrechten': 'Intellectuele-eigendomsrechten',
            'BelastingenOverigeBelastingen': 'Overige belastingen',
            'BeschermingPersoonsgegevens': 'Bescherming van persoonsgegevens',
            'BeschermingPersoonsgegevensUitoefeningRechten': 'Uitoefening van de rechten',
            'BurgerEnFamilieRechten': 'Burger- en familierechten',
            'BurgerEnFamilieRechtenPartners': 'Samenleven van partners',
            'ConsumentenrechtenVeiligheid': 'Veiligheid en beveiliging van producten',
            'DienstenErkenningBeroepskwalificaties': 'Erkenning van beroepskwalificaties',
        };

        test.beforeEach(async () => {

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

            createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId, true);
            await toevoegenPage.reloadUntil(async () => {
                await toevoegenPage.searchConcept(createSnapshot.title);
                await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

            await conceptDetailsPage.expectToBeVisible();
            await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
            await conceptDetailsPage.voegToeButton.click();

            await instantieDetailsPage.expectToBeVisible();
            await expect(instantieDetailsPage.heading).toHaveText(createSnapshot.title);

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();
        });

        test('when taking over wijzigingen per veld on a verstuurde instance, first it is reopened', async () => {
            await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();

            await verzendNaarVlaamseOverheidModal.expectToBeVisible();
            await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
            await verzendNaarVlaamseOverheidModal.expectToBeClosed();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.wijzigingenPerVeldBekijkenButton.click();
            await wijzigingenOvernemenModal.expectToBeClosed();

            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');
            await expect(instantieDetailsPage.verzendNaarVlaamseOverheidButton).toBeVisible();
            await expect(instantieDetailsPage.productOpnieuwBewerkenButton).not.toBeVisible();
        });

        test('when taking over wijzigingen per veld on an instance in ontwerp, it remains in ontwerp', async () => {
            await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
            await wijzigingenOvernemenModal.expectToBeVisible();
            await wijzigingenOvernemenModal.wijzigingenPerVeldBekijkenButton.click();
            await wijzigingenOvernemenModal.expectToBeClosed();

            await expect(instantieDetailsPage.verzendNaarVlaamseOverheidButton).toBeVisible();
            await expect(instantieDetailsPage.productOpnieuwBewerkenButton).not.toBeVisible();
        });

        test('when taking over wijzigingen per veld on an instance for which only the title was updated, for all other fields no wijzigingen overnemen links appear', async () => {
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink).toBeVisible();

            //voorwaarden
            await expect(instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink()).toBeVisible();

            //procedures
            await expect(instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink()).toBeVisible();

            //kosten
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink()).toBeVisible();

            //financiele voordelen
            await expect(instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink()).toBeVisible();

            //regelgeving
            await expect(instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink()).toBeVisible();

            //meer info
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink()).toBeVisible();

            await instantieDetailsPage.eigenschappenTab.click();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // algemene info (eigenschappen)           
            await expect(instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.themasConceptWijzigingenOvernemenLink).toBeVisible();

            //Bevoegdheid
            await expect(instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink).toBeVisible();

            //Gerelateerd
            await expect(instantieDetailsPage.tagsConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();

            await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink).not.toBeVisible();

            //voorwaarden
            await expect(instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //procedures
            await expect(instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //kosten
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //financiele voordelen
            await expect(instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //regelgeving
            await expect(instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //meer info
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink()).not.toBeVisible();

            await instantieDetailsPage.eigenschappenTab.click();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // algemene info (eigenschappen)           
            await expect(instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.themasConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Bevoegdheid
            await expect(instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Gerelateerd
            await expect(instantieDetailsPage.tagsConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();

            const updateSnapshotOverAgain = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'naam');

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink).not.toBeVisible();

            //voorwaarden
            await expect(instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //procedures
            await expect(instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //kosten
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //financiele voordelen
            await expect(instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //regelgeving
            await expect(instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //meer info
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink()).not.toBeVisible();

            await instantieDetailsPage.eigenschappenTab.click();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // algemene info (eigenschappen)           
            await expect(instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.themasConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Bevoegdheid
            await expect(instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Gerelateerd
            await expect(instantieDetailsPage.tagsConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();

            await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink).not.toBeVisible();

            //voorwaarden
            await expect(instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //procedures
            await expect(instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //kosten
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //financiele voordelen
            await expect(instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //regelgeving
            await expect(instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //meer info
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink()).not.toBeVisible();

            await instantieDetailsPage.eigenschappenTab.click();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // algemene info (eigenschappen)           
            await expect(instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.themasConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Bevoegdheid
            await expect(instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Gerelateerd
            await expect(instantieDetailsPage.tagsConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();

        });

        test('when taking over wijzigingen per veld for a container on an instance for which only the kost container was updated, for all other fields no wijzigingen overnemen links appear', async () => {
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            const updateSnapshotOverAgain = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'kosten');

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink).not.toBeVisible();

            //voorwaarden
            await expect(instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //procedures
            await expect(instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //kosten
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink()).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink()).toBeVisible();

            //financiele voordelen
            await expect(instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //regelgeving
            await expect(instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink()).not.toBeVisible();

            //meer info
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink()).not.toBeVisible();

            await instantieDetailsPage.eigenschappenTab.click();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // algemene info (eigenschappen)           
            await expect(instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.themasConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Bevoegdheid
            await expect(instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();

            //Gerelateerd
            await expect(instantieDetailsPage.tagsConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();
        });

        test('when taking over wijzigingen per veld for a container on an instance for which only the kost containers was updated but with different orders, pills are shown', async () => {
            const initiallyUpdatedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            const firstCostUpdatedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'kosten.1');

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).not.toBeVisible();
            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                initiallyUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                initiallyUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstCostUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                createSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);
            await expect(instantieDetailsPage.titelKostInput()).toHaveValue(firstCostUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                initiallyUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                initiallyUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstCostUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                createSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toContain(firstCostUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            const firstCostUpdatedSnapshotAgain = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'kosten.1');

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).not.toBeVisible();
            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                firstCostUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstCostUpdatedSnapshotAgain['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedSnapshotAgain['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput()).toHaveValue(firstCostUpdatedSnapshotAgain['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                firstCostUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstCostUpdatedSnapshotAgain['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedSnapshotAgain['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toContain(firstCostUpdatedSnapshotAgain['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            const firstCostUpdatedAndSecondCostAddedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'kosten.2');

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).toBeVisible();

            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(0).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                firstCostUpdatedSnapshotAgain['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedSnapshotAgain['jsonlddata'].generatedAtTime,
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput(0)).toHaveValue(firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(0).click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                firstCostUpdatedSnapshotAgain['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedSnapshotAgain['jsonlddata'].generatedAtTime,
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor(0).textContent()).toContain(firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();

            await instantieDetailsPage.voegKostToeButton.click();
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).toBeVisible();

            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(0)).toBeVisible();
            await expect(instantieDetailsPage.titelKostInput(0)).toHaveValue(firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(0)).toBeVisible();
            expect(await instantieDetailsPage.beschrijvingKostEditor(0).textContent()).toContain(firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1)).toBeVisible();
            await expect(instantieDetailsPage.titelKostInput(1)).toHaveValue('');
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1)).toBeVisible();
            expect(await instantieDetailsPage.beschrijvingKostEditor(1).textContent()).toContain('');

            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                '',
                firstCostUpdatedSnapshotAgain['jsonlddata'].generatedAtTime,
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][1]['naam']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput(1)).toHaveValue(firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][1]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                '',
                firstCostUpdatedSnapshotAgain['jsonlddata'].generatedAtTime,
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][1]['beschrijving']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor(1).textContent()).toContain(firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][1]['beschrijving']['nl']);

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).not.toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).not.toBeVisible();
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(0)).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(0)).not.toBeVisible();
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();

            const firstAndSecondCostUpdatedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'kosten.2');

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).not.toBeVisible();

            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(0).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput(0)).toHaveValue(firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(0).click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor(0).textContent()).toContain(firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][1]['naam']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][1]['naam']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput(1)).toHaveValue(firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][1]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata']['kosten'][1]['beschrijving']['nl'],
                firstCostUpdatedAndSecondCostAddedSnapshot['jsonlddata'].generatedAtTime,
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][1]['beschrijving']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor(1).textContent()).toContain(firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][1]['beschrijving']['nl']);

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            const firstCostUpdatedSecondCostRemovedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'kosten.1');

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).toBeVisible();

            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(0).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput(0)).toHaveValue(firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(0).click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor(0).textContent()).toContain(firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][1]['naam']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                '',
                firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput(1)).toHaveValue('');

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                firstAndSecondCostUpdatedSnapshot['jsonlddata']['kosten'][1]['beschrijving']['nl'],
                firstAndSecondCostUpdatedSnapshot['jsonlddata'].generatedAtTime,
                '',
                firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor(1).textContent()).toContain('');

            await instantieDetailsPage.verwijderKostButton(1).click();

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).not.toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            await expect(instantieDetailsPage.hetAantalKostenIsGewijzigdPill).not.toBeVisible();
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(0)).not.toBeVisible();
            await expect(instantieDetailsPage.titelKostInput(0)).toHaveValue(firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);
            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink(0)).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingKostEditor(0).textContent()).toContain(firstCostUpdatedSecondCostRemovedSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink(1)).not.toBeVisible();

        });

        test('when taking over wijzigingen per veld for a container on an instance for which a new item was created but without a description, no compare link is shown ', async () => {
            const initiallyUpdatedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');
            await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');

            await instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig.click();
            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            const firstWebsiteUpdatedSecondWebsiteAddedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'websites.2');

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            await expect(instantieDetailsPage.hetAantalWebsitesIsGewijzigdPill).toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink(0)).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink(0)).toBeVisible();

            await instantieDetailsPage.voegWebsiteToeButton.click();

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await expect(instantieDetailsPage.hetAantalWebsitesIsGewijzigdPill).toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink(0)).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink(0)).toBeVisible();

            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink(1)).toBeVisible();
            await instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink(1).click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel website',
                '',
                initiallyUpdatedSnapshot['jsonlddata'].generatedAtTime,
                firstWebsiteUpdatedSecondWebsiteAddedSnapshot['jsonlddata']['websites'][1]['naam']['nl'],
                firstWebsiteUpdatedSecondWebsiteAddedSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink(1)).not.toBeVisible();

            await instantieDetailsPage.wijzigingenBewarenButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            const firstWebsiteUpdatedSecondWebsiteRemovedSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false, 'websites.1');

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            await expect(instantieDetailsPage.hetAantalWebsitesIsGewijzigdPill).toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink(0)).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink(0)).toBeVisible();

            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink(1)).toBeVisible();
            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink(1)).not.toBeVisible();

        });

        test('given fields updated in concept snapshot can field by field update them with latest concept snapshot data', async () => {
            // update concept snapshot
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeEnabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            //basisinformatie
            await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel',
                createSnapshot['jsonlddata']['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot['jsonlddata']['naam']['nl']);

            await instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving',
                createSnapshot['jsonlddata']['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['beschrijving']['nl']);

            await instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Aanvullende Beschrijving',
                createSnapshot['jsonlddata']['verdereBeschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['verdereBeschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['verdereBeschrijving']['nl']);

            await instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Uitzonderingen',
                createSnapshot['jsonlddata']['uitzonderingen']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['uitzonderingen']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toContain(updateSnapshot['jsonlddata']['uitzonderingen']['nl']);

            //voorwaarden
            await instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel voorwaarde',
                createSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelVoorwaardeInput()).toHaveValue(updateSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving voorwaarde',
                createSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toContain(updateSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl']);

            await instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel bewijsstuk',
                createSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelBewijsstukInput()).toHaveValue(updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl']);

            await instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving bewijsstuk',
                createSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toContain(updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl']);

            //procedures
            await instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel procedure',
                createSnapshot['jsonlddata']['procedures'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['procedures'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving procedure',
                createSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toContain(updateSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl']);

            await instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel website',
                createSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving website',
                createSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toContain(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl']);

            await instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(
                'Website URL',
                createSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url']);

            //kosten
            await instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel kost',
                createSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['kosten'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelKostInput()).toHaveValue(updateSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving kost',
                createSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toContain(updateSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            //financiele voordelen
            await instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel financieel voordeel',
                createSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).toHaveValue(updateSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving financieel voordeel',
                createSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toContain(updateSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl']);

            //regelgeving
            await instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Regelgeving',
                createSnapshot['jsonlddata']['regelgevingTekst']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['regelgevingTekst']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toContain(updateSnapshot['jsonlddata']['regelgevingTekst']['nl']);

            await instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel regelgevende bron',
                createSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelRegelgevendeBronInput()).toHaveValue(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving regelgevende bron',
                createSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toContain(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl']);

            await instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(
                'URL regelgevende bron',
                createSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.regelgevendeBronUrlInput()).toHaveValue(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url']);

            //meer info
            await instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink().click()
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel website',
                createSnapshot['jsonlddata']['websites'][0]['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['websites'][0]['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.titelWebsiteInput()).toHaveValue(updateSnapshot['jsonlddata']['websites'][0]['naam']['nl']);

            await instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving website',
                createSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toContain(updateSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl']);

            await instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink().click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Website URL',
                createSnapshot['jsonlddata']['websites'][0]['url'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['websites'][0]['url'],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.websiteURLInput()).toHaveValue(updateSnapshot['jsonlddata']['websites'][0]['url']);

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeDisabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeEnabled();

            await instantieDetailsPage.eigenschappenTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeEnabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            // algemene info (eigenschappen)            
            await instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Product of dienst geldig vanaf',
                moment(createSnapshot['jsonlddata']['startDienstVerlening']).local().format('DD-MM-YYYY'),
                createSnapshot['jsonlddata'].generatedAtTime,
                moment(updateSnapshot['jsonlddata']['startDienstVerlening']).local().format('DD-MM-YYYY'),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.productOfDienstGeldigVanafInput).toHaveValue(moment(updateSnapshot['jsonlddata']['startDienstVerlening']).local().format('DD-MM-YYYY'));

            await instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Product of dienst geldig tot',
                moment(createSnapshot['jsonlddata']['eindeDienstVerlening']).local().format('DD-MM-YYYY'),
                createSnapshot['jsonlddata'].generatedAtTime,
                moment(updateSnapshot['jsonlddata']['eindeDienstVerlening']).local().format('DD-MM-YYYY'),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.productOfDienstGeldigTotInput).toHaveValue(moment(updateSnapshot['jsonlddata']['eindeDienstVerlening']).local().format('DD-MM-YYYY'));

            await instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForSelect(
                'Product type',
                productTypesMap[createSnapshot['jsonlddata']['type']],
                createSnapshot['jsonlddata'].generatedAtTime,
                productTypesMap[updateSnapshot['jsonlddata']['type']],
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            expect(await instantieDetailsPage.productTypeSelect.selectedItem.textContent()).toContain(productTypesMap[updateSnapshot['jsonlddata']['type']]);

            await instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Doelgroepen',
                createSnapshot['jsonlddata']['doelgroepen'].map(dg => doelgroepenMap[dg]).sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['doelgroepen'].map(dg => doelgroepenMap[dg]).sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['doelgroepen'].map(dg => doelgroepenMap[dg]).sort());

            await instantieDetailsPage.themasConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                `Thema\\\'s`,
                createSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort());

            //Bevoegdheid
            await instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Bevoegd bestuursniveau',
                createSnapshot['jsonlddata']['bevoegdBestuursniveaus'].map(b => bevoegdeBestuursniveausMap[b]).sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['bevoegdBestuursniveaus'].map(b => bevoegdeBestuursniveausMap[b]).sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['bevoegdBestuursniveaus'].map(b => bevoegdeBestuursniveausMap[b]).sort());

            await instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Bevoegde overheid',
                createSnapshot['jsonlddata']['bevoegdeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['bevoegdeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['bevoegdeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort());

            await instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Uitvoerend bestuursniveau',
                createSnapshot['jsonlddata']['uitvoerendBestuursniveaus'].map(b => uitvoerendeBestuursniveausMap[b]).sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['uitvoerendBestuursniveaus'].map(b => uitvoerendeBestuursniveausMap[b]).sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['uitvoerendBestuursniveaus'].map(b => uitvoerendeBestuursniveausMap[b]).sort());

            await instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Uitvoerende overheid',
                createSnapshot['jsonlddata']['uitvoerendeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['uitvoerendeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['uitvoerendeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort());

            //Gerelateerd
            await instantieDetailsPage.tagsConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Tags',
                createSnapshot['jsonlddata']['zoektermen']['nl'].sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['zoektermen']['nl'].sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['zoektermen']['nl'].sort());

            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();
            await instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Publicatiekanalen',
                createSnapshot['jsonlddata']['publicatiekanalen']?.map(pk => publicatieKanalenMap[pk])?.sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['publicatiekanalen']?.map(pk => publicatieKanalenMap[pk])?.sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['publicatiekanalen']?.map(pk => publicatieKanalenMap[pk])?.sort());

            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).toBeVisible();
            await instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForMultiSelect(
                'Categorieën Your Europe',
                createSnapshot['jsonlddata']['yourEuropeCategorieen']?.map(cat => yourEuropeCategorieënMap[cat])?.sort(),
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['yourEuropeCategorieen']?.map(cat => yourEuropeCategorieënMap[cat])?.sort(),
                updateSnapshot['jsonlddata'].generatedAtTime,
            );
            await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['yourEuropeCategorieen']?.map(cat => yourEuropeCategorieënMap[cat])?.sort());

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeDisabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeEnabled();

            await instantieDetailsPage.inhoudTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.jaVerwijderHerzieningNodigLabel.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).not.toBeEnabled();

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(updateSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).not.toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(updateSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot['jsonlddata']['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['beschrijving']['nl']);

            await expect(instantieDetailsPage.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink).not.toBeVisible();
            expect(await instantieDetailsPage.aanvullendeBeschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['verdereBeschrijving']['nl']);

            await expect(instantieDetailsPage.uitzonderingenConceptWijzigingenOvernemenLink).not.toBeVisible();
            expect(await instantieDetailsPage.uitzonderingenEditor.textContent()).toContain(updateSnapshot['jsonlddata']['uitzonderingen']['nl']);

            //voorwaarden
            await expect(instantieDetailsPage.titelVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelVoorwaardeInput()).toHaveValue(updateSnapshot['jsonlddata']['voorwaarden'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingVoorwaardeEditor().textContent()).toContain(updateSnapshot['jsonlddata']['voorwaarden'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.titelBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelBewijsstukInput()).toHaveValue(updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingBewijsstukConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingBewijsstukEditor().textContent()).toContain(updateSnapshot['jsonlddata']['voorwaarden'][0]['bewijs']['beschrijving']['nl']);

            //procedures
            await expect(instantieDetailsPage.titelProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingProcedureEditor().textContent()).toContain(updateSnapshot['jsonlddata']['procedures'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor().textContent()).toContain(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.websiteURLVoorProcedureConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput()).toHaveValue(updateSnapshot['jsonlddata']['procedures'][0]['websites'][0]['url']);

            //kosten
            await expect(instantieDetailsPage.titelKostConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelKostInput()).toHaveValue(updateSnapshot['jsonlddata']['kosten'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingKostConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingKostEditor().textContent()).toContain(updateSnapshot['jsonlddata']['kosten'][0]['beschrijving']['nl']);

            //financiele voordelen
            await expect(instantieDetailsPage.titelFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelFinancieelVoordeelInput()).toHaveValue(updateSnapshot['jsonlddata']['financieleVoordelen'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor().textContent()).toContain(updateSnapshot['jsonlddata']['financieleVoordelen'][0]['beschrijving']['nl']);

            //regelgeving
            await expect(instantieDetailsPage.beschrijvingRegelgevingConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingRegelgevingEditor().textContent()).toContain(updateSnapshot['jsonlddata']['regelgevingTekst']['nl']);

            await expect(instantieDetailsPage.titelRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelRegelgevendeBronInput()).toHaveValue(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().textContent()).toContain(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.regelgevendeBronUrlConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.regelgevendeBronUrlInput()).toHaveValue(updateSnapshot['jsonlddata']['regelgevendeBronnen'][0]['url']);

            //meer info
            await expect(instantieDetailsPage.titelWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.titelWebsiteInput()).toHaveValue(updateSnapshot['jsonlddata']['websites'][0]['naam']['nl']);

            await expect(instantieDetailsPage.beschrijvingWebsiteConceptWijzigingenOvernemenLink()).not.toBeVisible();
            expect(await instantieDetailsPage.beschrijvingWebsiteEditor().textContent()).toContain(updateSnapshot['jsonlddata']['websites'][0]['beschrijving']['nl']);

            await expect(instantieDetailsPage.websiteURLConceptWijzigingenOvernemenLink()).not.toBeVisible();
            await expect(instantieDetailsPage.websiteURLInput()).toHaveValue(updateSnapshot['jsonlddata']['websites'][0]['url']);

            await instantieDetailsPage.eigenschappenTab.click();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeInvisible();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            // algemene info (eigenschappen)           
            await expect(instantieDetailsPage.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink).not.toBeVisible();;
            await expect(instantieDetailsPage.productOfDienstGeldigVanafInput).toHaveValue(moment(updateSnapshot['jsonlddata']['startDienstVerlening']).local().format('DD-MM-YYYY'));

            await expect(instantieDetailsPage.productOfDienstGeldigTotConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.productOfDienstGeldigTotInput).toHaveValue(moment(updateSnapshot['jsonlddata']['eindeDienstVerlening']).local().format('DD-MM-YYYY'));

            await expect(instantieDetailsPage.productTypeConceptWijzigingenOvernemenLink).not.toBeVisible();
            expect(await instantieDetailsPage.productTypeSelect.selectedItem.textContent()).toContain(productTypesMap[updateSnapshot['jsonlddata']['type']]);

            await expect(instantieDetailsPage.doelgroepenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.doelgroepenMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['doelgroepen'].map(dg => doelgroepenMap[dg]).sort());

            await expect(instantieDetailsPage.themasConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.themasMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['themas'].map(t => themasMap[t]).sort());

            //Bevoegdheid
            await expect(instantieDetailsPage.bevoegdBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.bevoegdBestuursniveauMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['bevoegdBestuursniveaus'].map(b => bevoegdeBestuursniveausMap[b]).sort());

            await expect(instantieDetailsPage.bevoegdeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.bevoegdeOverheidMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['bevoegdeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort());

            await expect(instantieDetailsPage.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendBestuursniveauMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['uitvoerendBestuursniveaus'].map(b => uitvoerendeBestuursniveausMap[b]).sort());

            await expect(instantieDetailsPage.uitvoerendeOverheidConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.uitvoerendeOverheidMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['uitvoerendeOverheden'].map(b => b['@id']).map(b => overhedenMap[b]).sort());

            //Gerelateerd
            await expect(instantieDetailsPage.tagsConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.tagsMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['zoektermen']['nl'].sort());

            await expect(instantieDetailsPage.publicatieKanalenConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.publicatieKanalenMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['publicatiekanalen']?.map(pk => publicatieKanalenMap[pk])?.sort());

            await expect(instantieDetailsPage.categorieenYourEuropeConceptWijzigingenOvernemenLink).not.toBeVisible();
            await expect(instantieDetailsPage.categorieenYourEuropeMultiSelect.options()).toContainText(updateSnapshot['jsonlddata']['yourEuropeCategorieen']?.map(cat => yourEuropeCategorieënMap[cat])?.sort());

        });

        test('given fields updated in concept snapshot can update with latest concept snapshot data but still adapt the input', async () => {
            // update concept snapshot
            const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, true);

            // instantie moet vlagje 'herziening nodig' hebben
            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

            // instantie moet alert 'herziening nodig' hebben
            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();
            await expect(instantieDetailsPage.herzieningNodigAlert.getMessage()).toContainText('In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast: basisinformatie, voorwaarden, procedure, kosten, financiële voordelen, regelgeving, meer info, algemene info (eigenschappen), bevoegdheid (eigenschappen), gerelateerd (eigenschappen).');

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeEnabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            //basisinformatie
            await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForInput(
                'Titel',
                createSnapshot['jsonlddata']['naam']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['naam']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
                createSnapshot['jsonlddata']['naam']['nl'],
                'additional text in titel');
            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot['jsonlddata']['naam']['nl'] + ' - additional text in titel');

            await instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink.click();
            await verifyDataInModalAndAndTakeOverForRichText(
                'Beschrijving',
                createSnapshot['jsonlddata']['beschrijving']['nl'],
                createSnapshot['jsonlddata'].generatedAtTime,
                updateSnapshot['jsonlddata']['beschrijving']['nl'],
                updateSnapshot['jsonlddata'].generatedAtTime,
                createSnapshot['jsonlddata']['beschrijving']['nl'],
                'additional text in omschrijving');
            expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['beschrijving']['nl'] + ' - additional text in omschrijving');

            await expect(instantieDetailsPage.herzieningNodigAlertGeenAanpassigenNodig).toBeDisabled();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeEnabled();

            await instantieDetailsPage.eigenschappenTab.click();

            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();

            await bevestigHerzieningVerwerktModal.expectToBeVisible();
            await bevestigHerzieningVerwerktModal.nee.click();
            await bevestigHerzieningVerwerktModal.expectToBeClosed();

            await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
            await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

            await expect(instantieDetailsPage.algemeneInfoHeading).toBeVisible();

            await instantieDetailsPage.terugNaarHetOverzichtButton.click();

            await homePage.goto();
            await homePage.reloadUntil(async () => {
                await homePage.searchInput.fill(updateSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText(updateSnapshot.title);
                await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
            });
            await homePage.resultTable.row(first_row).link(updateSnapshot.title).click();

            await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

            //basisinformatie
            await expect(instantieDetailsPage.titelConceptWijzigingenOvernemenLink).toBeVisible();
            await expect(instantieDetailsPage.titelInput).toHaveValue(updateSnapshot['jsonlddata']['naam']['nl'] + ' - additional text in titel');

            await expect(instantieDetailsPage.beschrijvingConceptWijzigingenOvernemenLink).toBeVisible();
            expect(await instantieDetailsPage.beschrijvingEditor.textContent()).toContain(updateSnapshot['jsonlddata']['beschrijving']['nl'] + ' - additional text in omschrijving');

        });

    });

    test('Take concept snapshot over field by field combined with u/je conversion', async () => {
        const gemeentenaam = randomGemeenteZonderFormeleInformeleKeuze();

        await loginAs(gemeentenaam);

        const uJeModal = UJeModal.create(page);
        await uJeModal.expectToBeVisible();
        await uJeModal.laterKiezenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.productOfDienstToevoegenButton.click();

        await toevoegenPage.expectToBeVisible();

        const conceptId = uuid();
        const createSnapshot = await IpdcStub.createSnapshotOfTypeCreate(conceptId, true);

        await toevoegenPage.reloadUntil(async () => {
            await toevoegenPage.searchConcept(createSnapshot.title);
            await expect(toevoegenPage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
        });
        await toevoegenPage.searchConcept(createSnapshot.title);
        await toevoegenPage.resultTable.row(first_row).link(createSnapshot.title).click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText(`Concept: ${createSnapshot.title}`);
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(createSnapshot.title);

        await instantieDetailsPage.terugNaarHetOverzichtButton.click();

        const updateSnapshot = await IpdcStub.createSnapshotOfTypeUpdate(conceptId, false);

        // instantie moet vlagje 'herziening nodig' hebben
        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();
        await verifyDataInModalForInput(
            'Titel',
            createSnapshot['jsonlddata']['naam']['nl'],
            createSnapshot['jsonlddata'].generatedAtTime,
            updateSnapshot['jsonlddata']['naam']['nl'],
            updateSnapshot['jsonlddata'].generatedAtTime,
        );

        await wait(1000);

        await homePage.logout(gemeentenaam);

        await loginAs(gemeentenaam);
        await homePage.productOfDienstToevoegenButton.click();
        await toevoegenPage.nuKeuzeMakenLink.click();

        await uJeModal.expectToBeVisible();
        await uJeModal.mijnBestuurKiestVoorDeJeVormRadio.click();
        await uJeModal.bevestigenButton.click();
        await uJeModal.expectToBeClosed();

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();
        await verifyDataInModalForInput(
            'Titel',
            createSnapshot['jsonlddata']['naam']['nl'],
            createSnapshot['jsonlddata'].generatedAtTime,
            updateSnapshot['jsonlddata']['naam']['nl'],
            updateSnapshot['jsonlddata'].generatedAtTime,
        );

        await instantieDetailsPage.eigenschappenTab.click();

        await expect(instantieDetailsPage.inhoudTab).not.toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).toHaveClass(/active/);

        await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Vlaams-Brabant');


        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await bevestigHerzieningVerwerktModal.expectToBeVisible();
        await bevestigHerzieningVerwerktModal.nee.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

        // instantie moet alert 'herziening nodig' hebben
        await instantieDetailsPage.herzieningNodigAlert.expectToBeVisible();

        await instantieDetailsPage.omzettenNaarDeJeVormAlert.expectToBeVisible();
        await expect(instantieDetailsPage.uJeVersie).toContainText("u-versie");
        await instantieDetailsPage.omzettenNaarDeJeVormAlert.button('Inhoud is al in de je-vorm').click();

        await homePage.goto();
        await homePage.reloadUntil(async () => {
            await homePage.searchInput.fill(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText(createSnapshot.title);
            await expect(homePage.resultTable.row(first_row).locator).toContainText('Herziening nodig');
        });
        await homePage.resultTable.row(first_row).link(createSnapshot.title).click();

        await instantieDetailsPage.herzieningNodigAlertConceptOvernemen.click();
        await wijzigingenOvernemenModal.expectToBeVisible();
        await wijzigingenOvernemenModal.wijzigingenPerVeldBekijkenButton.click();
        await wijzigingenOvernemenModal.expectToBeClosed();

        await expect(instantieDetailsPage.statusHeader).toContainText('Ontwerp');
        await expect(instantieDetailsPage.verzendNaarVlaamseOverheidButton).toBeVisible();
        await expect(instantieDetailsPage.productOpnieuwBewerkenButton).not.toBeVisible();

        await instantieDetailsPage.titelConceptWijzigingenOvernemenLink.click();
        await verifyDataInModalForInput(
            'Titel',
            createSnapshot['jsonlddata']['naam']['nl-BE-x-generated-informal'],
            createSnapshot['jsonlddata'].generatedAtTime,
            updateSnapshot['jsonlddata']['naam']['nl-BE-x-generated-informal'],
            updateSnapshot['jsonlddata'].generatedAtTime,
            createSnapshot['jsonlddata']['naam']['nl'],
        );

    });

    async function verifyDataInModalAndAndTakeOverForInput(
        titel: string,
        conceptWaaropInstantieIsGebaseerdText: string,
        conceptWaaropInstantieIsGebaseerdGeneratedAt: string,
        meestRecenteConceptText: string,
        meestRecenteRevisieGeneratedAt: string,
        currentInstantieText?: string,
        additionalText?: string) {

        const conceptOvernemenModal = ConceptOvernemenModal.create(page, titel, conceptWaaropInstantieIsGebaseerdGeneratedAt, meestRecenteRevisieGeneratedAt);

        await conceptOvernemenModal.expectToBeVisible();

        await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeVisible();
        await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeDisabled();
        await expect(conceptOvernemenModal.meestRecenteConceptInput).toHaveValue(meestRecenteConceptText);

        if (conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel) {
            await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel).toBeVisible();
        }
        if (conceptOvernemenModal.meestRecenteRevisieLabel) {
            await expect(conceptOvernemenModal.meestRecenteRevisieLabel).toBeVisible();
        }
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toBeVisible();
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toBeDisabled();
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toHaveValue(conceptWaaropInstantieIsGebaseerdText);

        await expect(conceptOvernemenModal.instantieInput).toBeVisible();
        await expect(conceptOvernemenModal.instantieInput).toBeEditable();
        await expect(conceptOvernemenModal.instantieInput).toHaveValue(currentInstantieText ?? conceptWaaropInstantieIsGebaseerdText);

        await conceptOvernemenModal.overnemenLink.click();

        await expect(conceptOvernemenModal.instantieInput).toHaveValue(meestRecenteConceptText);

        if (additionalText) {
            await conceptOvernemenModal.instantieInput.fill(`${meestRecenteConceptText} - ${additionalText}`);
        }

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalForInput(
        titel: string,
        conceptWaaropInstantieIsGebaseerdText: string,
        conceptWaaropInstantieIsGebaseerdGeneratedAt: string,
        meestRecenteConceptText: string,
        meestRecenteRevisieGeneratedAt: string,
        currentInstantieText?: string) {

        const conceptOvernemenModal = ConceptOvernemenModal.create(page, titel, conceptWaaropInstantieIsGebaseerdGeneratedAt, meestRecenteRevisieGeneratedAt);

        await conceptOvernemenModal.expectToBeVisible();

        await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeVisible();
        await expect(conceptOvernemenModal.meestRecenteConceptInput).toBeDisabled();
        await expect(conceptOvernemenModal.meestRecenteConceptInput).toHaveValue(meestRecenteConceptText);

        if (conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel) {
            await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel).toBeVisible();
        }
        if (conceptOvernemenModal.meestRecenteRevisieLabel) {
            await expect(conceptOvernemenModal.meestRecenteRevisieLabel).toBeVisible();
        }
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toBeVisible();
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toBeDisabled();
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdInput).toHaveValue(conceptWaaropInstantieIsGebaseerdText);

        await expect(conceptOvernemenModal.instantieInput).toBeVisible();
        await expect(conceptOvernemenModal.instantieInput).toBeEditable();
        await expect(conceptOvernemenModal.instantieInput).toHaveValue(currentInstantieText ?? conceptWaaropInstantieIsGebaseerdText);

        await conceptOvernemenModal.annuleerButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalAndAndTakeOverForRichText(
        titel: string,
        conceptWaaropInstantieIsGebaseerdInput: string,
        conceptWaaropInstantieIsGebaseerdGeneratedAt: string,
        meestRecenteConceptText: string,
        meestRecenteRevisieGeneratedAt: string,
        currentInstantieText?: string,
        additionalText?: string) {

        const conceptOvernemenModal = ConceptOvernemenModal.create(page, titel, conceptWaaropInstantieIsGebaseerdGeneratedAt, meestRecenteRevisieGeneratedAt);

        await conceptOvernemenModal.expectToBeVisible();

        if (conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel) {
            await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel).toBeVisible();
        }
        if (conceptOvernemenModal.meestRecenteRevisieLabel) {
            await expect(conceptOvernemenModal.meestRecenteRevisieLabel).toBeVisible();
        }
        await expect(conceptOvernemenModal.meestRecenteConceptRichTextReadonly).toBeVisible();
        expect(await conceptOvernemenModal.meestRecenteConceptRichTextReadonly.textContent()).toContain(meestRecenteConceptText);

        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdRichTextReadonly).toBeVisible();
        expect(await conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdRichTextReadonly.textContent()).toContain(conceptWaaropInstantieIsGebaseerdInput);

        await expect(conceptOvernemenModal.instantieRichText).toBeVisible();
        expect(await conceptOvernemenModal.instantieRichText.textContent()).toContain(currentInstantieText ?? conceptWaaropInstantieIsGebaseerdInput);

        await conceptOvernemenModal.overnemenLink.click();

        expect(await conceptOvernemenModal.instantieRichText.textContent()).toContain(meestRecenteConceptText);

        if (additionalText) {
            await conceptOvernemenModal.instantieRichText.fill(`${meestRecenteConceptText} - ${additionalText}`);
            await conceptOvernemenModal.instantieRichText.blur();
        }

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalAndAndTakeOverForSelect(
        titel: string,
        conceptWaaropInstantieIsGebaseerdValue: string,
        conceptWaaropInstantieIsGebaseerdGeneratedAt: string,
        meestRecenteConceptValue: string,
        meestRecenteRevisieGeneratedAt: string,
    ) {

        const conceptOvernemenModal = ConceptOvernemenModal.create(page, titel, conceptWaaropInstantieIsGebaseerdGeneratedAt, meestRecenteRevisieGeneratedAt);

        await conceptOvernemenModal.expectToBeVisible();

        if (conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel) {
            await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel).toBeVisible();
        }
        if (conceptOvernemenModal.meestRecenteRevisieLabel) {
            await expect(conceptOvernemenModal.meestRecenteRevisieLabel).toBeVisible();
        }
        expect(await conceptOvernemenModal.meestRecenteConceptSelect.selectedItem.textContent()).toContain(meestRecenteConceptValue);
        expect(await conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdSelect.selectedItem.textContent()).toContain(conceptWaaropInstantieIsGebaseerdValue);
        expect(await conceptOvernemenModal.instantieSelect.selectedItem.textContent()).toContain(conceptWaaropInstantieIsGebaseerdValue);

        await conceptOvernemenModal.overnemenLink.click();

        await wait(1000);

        expect(await conceptOvernemenModal.instantieSelect.selectedItem.textContent()).toContain(meestRecenteConceptValue);

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function verifyDataInModalAndAndTakeOverForMultiSelect(
        titel: string,
        conceptWaaropInstantieIsGebaseerdValues: string[] | undefined,
        conceptWaaropInstantieIsGebaseerdGeneratedAt: string,
        meestRecenteConceptValues: string[],
        meestRecenteRevisieGeneratedAt: string) {

        const conceptOvernemenModal = ConceptOvernemenModal.create(page, titel, conceptWaaropInstantieIsGebaseerdGeneratedAt, meestRecenteRevisieGeneratedAt);

        await conceptOvernemenModal.expectToBeVisible();

        if (conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel) {
            await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdLabel).toBeVisible();
        }
        if (conceptOvernemenModal.meestRecenteRevisieLabel) {
            await expect(conceptOvernemenModal.meestRecenteRevisieLabel).toBeVisible();
        }
        await expect(conceptOvernemenModal.meestRecenteConceptMultiSelect.options()).toContainText(meestRecenteConceptValues || []);
        await expect(conceptOvernemenModal.conceptWaaropInstantieIsGebaseerdMultiSelect.options()).toContainText(conceptWaaropInstantieIsGebaseerdValues || []);
        await expect(conceptOvernemenModal.instantieMultiSelect.options()).toContainText(conceptWaaropInstantieIsGebaseerdValues || []);

        await conceptOvernemenModal.overnemenLink.click();

        await wait(1000);

        await expect(conceptOvernemenModal.instantieMultiSelect.options()).toContainText(meestRecenteConceptValues || []);

        await conceptOvernemenModal.bewaarButton.click();
        await conceptOvernemenModal.expectToBeClosed();
    }

    async function loginAs(gemeentenaam: string) {
        await mockLoginPage.goto();
        await mockLoginPage.searchInput.fill(gemeentenaam);
        await mockLoginPage.login(`Gemeente ${gemeentenaam}`);

        await homePage.expectToBeVisible();
    }

});
