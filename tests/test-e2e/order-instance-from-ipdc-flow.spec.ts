import {expect, Page, test} from '@playwright/test';
import {LpdcHomePage} from "./pages/lpdc-home-page";
import {MockLoginPage} from "./pages/mock-login-page";
import {UJeModal} from './modals/u-je-modal';
import {AddProductOrServicePage as ProductOfDienstToevoegenPage} from './pages/product-of-dienst-toevoegen-page';
import {first_row, second_row} from './components/table';
import {ConceptDetailsPage as ConceptDetailsPage} from './pages/concept-details-page';
import {InstantieDetailsPage} from './pages/instantie-details-page';
import {WijzigingenBewarenModal} from './modals/wijzigingen-bewaren-modal';
import {VerzendNaarVlaamseOverheidModal} from './modals/verzend-naar-vlaamse-overheid-modal';
import {IpdcStub} from "./components/ipdc-stub";
import {sortBy} from "lodash";

test.describe('Order instance from IPDC flow', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let formalInformalChoiceSuffix= 'informal';
    let titel: string;

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

            await homePage.productOfDienstToevoegenButton.click();
            await toevoegenPage.expectToBeVisible();
        });

        test(`Create instance from concept with orders and ensure the orders are Correct`, async () => {
            await startVanConcept();

            await voorwaardeOrderCheck();
            await procedureOrderCheck();
            await kostOrderCheck();
            await financieelVoordeelOrderCheck();
            await websiteOrderCheck();
        });

        test('Adding and removing keeps orders correct', async () => {
            const titelWebsiteVoorProcedure = 'Procedure website naam - informal';
            const titelWebsiteVoorProcedureEngels = 'Procedure website naam - en';
            const beschrijvingWebsiteVoorProcedure = 'procedure website beschrijving - informal';
            const beschrijvingWebsiteVoorProcedureEngels = 'procedure website beschrijving - en';
            const websiteURLVoorProcedure1 = 'https://procedure-website1.com';
            const websiteURLVoorProcedure3 = 'https://procedure-website3.com';
            const websiteURLVoorProcedureNew = 'https://procedure-websiteNew.com';

            await startVanConcept();
            await instantieDetailsPage.verwijderWebsiteButtonVoorProcedure(1).click();

            //add website to procedure
            await instantieDetailsPage.voegWebsiteToeButtonVoorProcedure().click();

            await instantieDetailsPage.titelWebsiteVoorProcedureInput(2).fill(`${titelWebsiteVoorProcedure} new`);
            await instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(2).fill(`${titelWebsiteVoorProcedureEngels} new`);
            await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(2).fill(`${beschrijvingWebsiteVoorProcedure} new`);
            await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsEditor(2).fill(`${beschrijvingWebsiteVoorProcedureEngels} new`);
            await instantieDetailsPage.websiteURLVoorProcedureInput(2).fill(websiteURLVoorProcedureNew);

            await instantieDetailsPage.eigenschappenTab.click();
            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();

            await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Aarschot (Gemeente)');
            await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Vlaams-Brabant');


            await verzendNaarVlaamseOverheid();

            //check order after send
            await homePage.resultTable.row(first_row).link('Bekijk').click();

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(0)).toHaveValue(`${titelWebsiteVoorProcedure} 1`);
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(0)).toHaveValue(`${titelWebsiteVoorProcedureEngels} 1`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(0).textContent()).toContain(`${beschrijvingWebsiteVoorProcedure} 1`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(0).textContent()).toContain(`${beschrijvingWebsiteVoorProcedureEngels} 1`);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput(0)).toHaveValue(websiteURLVoorProcedure1);

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(1)).toHaveValue(`${titelWebsiteVoorProcedure} 3`);
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(1)).toHaveValue(`${titelWebsiteVoorProcedureEngels} 3`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(1).textContent()).toContain(`${beschrijvingWebsiteVoorProcedure} 3`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(1).textContent()).toContain(`${beschrijvingWebsiteVoorProcedureEngels} 3`);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput(1)).toHaveValue(websiteURLVoorProcedure3);

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(2)).toHaveValue(`${titelWebsiteVoorProcedure} new`);
            await expect(instantieDetailsPage.titelWebsiteVoorProcedureEngelsInput(2)).toHaveValue(`${titelWebsiteVoorProcedureEngels} new`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(2).textContent()).toContain(`${beschrijvingWebsiteVoorProcedure} new`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEngelsReadonly(2).textContent()).toContain(`${beschrijvingWebsiteVoorProcedureEngels} new`);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput(2)).toHaveValue(websiteURLVoorProcedureNew);

            //check order in Ipdc
            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(titel, expectedFormalOrInformalTripleLanguage);
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyPublishedInstance(instancePublishedInIpdc, {
                    procedureWebsiteTitel: titelWebsiteVoorProcedure,
                    procedureWebsiteTitelEngels: titelWebsiteVoorProcedureEngels,
                    procedureWebsiteBeschrijving: beschrijvingWebsiteVoorProcedure,
                    procedureWebsiteBeschrijvingEngels: beschrijvingWebsiteVoorProcedureEngels,
                    procedureWebsiteUrl1: websiteURLVoorProcedure1,
                    procedureWebsiteUrl3: websiteURLVoorProcedure3,
                    procedureWebsiteUrlNew: websiteURLVoorProcedureNew,
                },
                expectedFormalOrInformalTripleLanguage,
                )
        })

        test('Starting an instance from scratch and adding and removing items keeps the order', async() =>{
            titel = 'Order test';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`)

            //KOST 1
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput().fill('Kost 1');
            await instantieDetailsPage.beschrijvingKostEditor().fill('Kost beschrijving 1');

            //KOST 2
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput(1).fill('Kost 2');
            await instantieDetailsPage.beschrijvingKostEditor(1).fill('Kost beschrijving 2');

            //KOST 3
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput(2).fill('Kost 3');
            await instantieDetailsPage.beschrijvingKostEditor(2).fill('Kost beschrijving 3');

            //DELETE KOST 2
            await instantieDetailsPage.verwijderKostButton(1).click();

            //KOST 4
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput(2).fill('Kost 4');
            await instantieDetailsPage.beschrijvingKostEditor(2).fill('Kost beschrijving 4');

            await verzendNaarVlaamseOverheid();

            //check order in Ipdc
            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(titel, expectedFormalOrInformalTripleLanguage);
            expect(instancePublishedInIpdc).toBeTruthy();
            const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

            expect(publicService['http://data.europa.eu/m8g/hasCost'].length).toEqual(3)
            const costUri1 = publicService['http://data.europa.eu/m8g/hasCost'][0]['@id'];
            const cost1 = IpdcStub.getObjectById(instancePublishedInIpdc, costUri1);

            const costUri2 = publicService['http://data.europa.eu/m8g/hasCost'][1]['@id'];
            const cost2 = IpdcStub.getObjectById(instancePublishedInIpdc, costUri2);

            const costUri3 = publicService['http://data.europa.eu/m8g/hasCost'][2]['@id'];
            const cost3 = IpdcStub.getObjectById(instancePublishedInIpdc, costUri3);

            const costs = [cost1,cost2,cost3];
            const sortedCosts = sortBy(costs, (cost) => Number(cost['http://www.w3.org/ns/shacl#order'][0]['@value']))

            // COST 1
            expect(sortedCosts[0]['http://purl.org/dc/terms/title']).toHaveLength(1);
            expect(sortedCosts[0]['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
                { "@language": expectedFormalOrInformalTripleLanguage, "@value": 'Kost 1' },
            ]));
            expect(sortedCosts[0]['http://purl.org/dc/terms/description']).toHaveLength(1);
            expect(sortedCosts[0]['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
                {
                    "@language": expectedFormalOrInformalTripleLanguage,
                    "@value": `<p data-indentation-level="0">Kost beschrijving 1</p>`
                }
            ]));
            expect(sortedCosts[0]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
            expect(sortedCosts[0]['http://www.w3.org/ns/shacl#order'][0])
                .toEqual({ "@value": "1", "@type": "http://www.w3.org/2001/XMLSchema#integer"});


            // COST 3
            expect(sortedCosts[1]['http://purl.org/dc/terms/title']).toHaveLength(1);
            expect(sortedCosts[1]['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
                { "@language": expectedFormalOrInformalTripleLanguage, "@value": 'Kost 3' },
            ]));
            expect(sortedCosts[1]['http://purl.org/dc/terms/description']).toHaveLength(1);
            expect(sortedCosts[1]['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
                {
                    "@language": expectedFormalOrInformalTripleLanguage,
                    "@value": `<p data-indentation-level="0">Kost beschrijving 3</p>`
                }
            ]));
            expect(sortedCosts[1]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
            expect(sortedCosts[1]['http://www.w3.org/ns/shacl#order'][0])
                .toEqual({ "@value": "3", "@type": "http://www.w3.org/2001/XMLSchema#integer"});


            // COST 4
            expect(sortedCosts[2]['http://purl.org/dc/terms/title']).toHaveLength(1);
            expect(sortedCosts[2]['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
                { "@language": expectedFormalOrInformalTripleLanguage, "@value": 'Kost 4' },
            ]));
            expect(sortedCosts[2]['http://purl.org/dc/terms/description']).toHaveLength(1);
            expect(sortedCosts[2]['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
                {
                    "@language": expectedFormalOrInformalTripleLanguage,
                    "@value": `<p data-indentation-level="0">Kost beschrijving 4</p>`
                }
            ]));
            expect(sortedCosts[2]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
            expect(sortedCosts[2]['http://www.w3.org/ns/shacl#order'][0])
                .toEqual({ "@value": "4", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        } )

        test('Contactpunten order gets saved and send correctly', async ()=>{
            titel = 'Contactpunten order test';
            const email ='mail@example.com'
            const telefoon ='041234567'
            const website = 'https://www.example.com'

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`)

            //CONTACTPUNT 1
            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect().insertNewValue(`1${email}`);
            await instantieDetailsPage.contactpuntEmailSelect().selectValue(`1${email}`);

            await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue(`${telefoon}1`);
            await instantieDetailsPage.contactpuntTelefoonSelect().selectValue(`${telefoon}1`);

            await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue(`${website}/1`);
            await instantieDetailsPage.contactpuntWebsiteURLSelect().selectValue(`${website}/1`);

            await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue(`${website}/1/openingsuren`);
            await instantieDetailsPage.contactpuntOpeningsurenSelect().selectValue(`${website}/1/openingsuren`);

            await instantieDetailsPage.voegAdresToeButton().click();
            await instantieDetailsPage.contactpuntAdresGemeenteSelect().selectValue('Harelbeke');
            await instantieDetailsPage.contactpuntAdresStraatSelect().selectValue('Generaal Deprezstraat');
            await instantieDetailsPage.contactpuntAdresHuisnummerInput().fill('2');
            await instantieDetailsPage.contactpuntAdresBusnummerInput().fill('50');
            await expect(instantieDetailsPage.contactpuntAdresValidatie()).toContainText('Adres gevonden');

            //CONTACTPUNT 2
            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect(1).insertNewValue(`2${email}`);
            await instantieDetailsPage.contactpuntEmailSelect(1).selectValue(`2${email}`);

            await instantieDetailsPage.contactpuntTelefoonSelect(1).insertNewValue(`${telefoon}2`);
            await instantieDetailsPage.contactpuntTelefoonSelect(1).selectValue(`${telefoon}2`);

            await instantieDetailsPage.contactpuntWebsiteURLSelect(1).insertNewValue(`${website}/2`);
            await instantieDetailsPage.contactpuntWebsiteURLSelect(1).selectValue(`${website}/2`);

            await instantieDetailsPage.contactpuntOpeningsurenSelect(1).insertNewValue(`${website}/2/openingsuren`);
            await instantieDetailsPage.contactpuntOpeningsurenSelect(1).selectValue(`${website}/2/openingsuren`);

            await instantieDetailsPage.voegAdresToeButton().click();
            await instantieDetailsPage.contactpuntAdresGemeenteSelect(1).selectValue('Harelbeke');
            await instantieDetailsPage.contactpuntAdresStraatSelect(1).selectValue('Generaal Deprezstraat');
            await instantieDetailsPage.contactpuntAdresHuisnummerInput(1).fill('2');
            await instantieDetailsPage.contactpuntAdresBusnummerInput(1).fill('50');
            await expect(instantieDetailsPage.contactpuntAdresValidatie(1)).toContainText('Adres gevonden');

            //CONTACTPUNT 3
            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect(2).insertNewValue(`3${email}`);
            await instantieDetailsPage.contactpuntEmailSelect(2).selectValue(`3${email}`);

            await instantieDetailsPage.contactpuntTelefoonSelect(2).insertNewValue(`${telefoon}3`);
            await instantieDetailsPage.contactpuntTelefoonSelect(2).selectValue(`${telefoon}3`);

            await instantieDetailsPage.contactpuntWebsiteURLSelect(2).insertNewValue(`${website}/3`);
            await instantieDetailsPage.contactpuntWebsiteURLSelect(2).selectValue(`${website}/3`);

            await instantieDetailsPage.contactpuntOpeningsurenSelect(2).insertNewValue(`${website}/3/openingsuren`);
            await instantieDetailsPage.contactpuntOpeningsurenSelect(2).selectValue(`${website}/3/openingsuren`);

            await instantieDetailsPage.voegAdresToeButton().click();
            await instantieDetailsPage.contactpuntAdresGemeenteSelect(2).selectValue('Harelbeke');
            await instantieDetailsPage.contactpuntAdresStraatSelect(2).selectValue('Generaal Deprezstraat');
            await instantieDetailsPage.contactpuntAdresHuisnummerInput(2).fill('2');
            await instantieDetailsPage.contactpuntAdresBusnummerInput(2).fill('50');
            await expect(instantieDetailsPage.contactpuntAdresValidatie(2)).toContainText('Adres gevonden');

            //DELETE CONTACTPUNT 2
            await instantieDetailsPage.verwijderContactpuntButton(1).click();

            //CONTACTPUNT 4
            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect(2).insertNewValue(`4${email}`);
            await instantieDetailsPage.contactpuntEmailSelect(2).selectValue(`4${email}`);

            await instantieDetailsPage.contactpuntTelefoonSelect(2).insertNewValue(`${telefoon}4`);
            await instantieDetailsPage.contactpuntTelefoonSelect(2).selectValue(`${telefoon}4`);

            await instantieDetailsPage.contactpuntWebsiteURLSelect(2).insertNewValue(`${website}/4`);
            await instantieDetailsPage.contactpuntWebsiteURLSelect(2).selectValue(`${website}/4`);

            await instantieDetailsPage.contactpuntOpeningsurenSelect(2).insertNewValue(`${website}/4/openingsuren`);
            await instantieDetailsPage.contactpuntOpeningsurenSelect(2).selectValue(`${website}/4/openingsuren`);

            await instantieDetailsPage.voegAdresToeButton().click();
            await instantieDetailsPage.contactpuntAdresGemeenteSelect(2).selectValue('Harelbeke');
            await instantieDetailsPage.contactpuntAdresStraatSelect(2).selectValue('Generaal Deprezstraat');
            await instantieDetailsPage.contactpuntAdresHuisnummerInput(2).fill('2');
            await instantieDetailsPage.contactpuntAdresBusnummerInput(2).fill('50');
            await expect(instantieDetailsPage.contactpuntAdresValidatie(2)).toContainText('Adres gevonden');

            await verzendNaarVlaamseOverheid()

            //check order in Ipdc
            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance(titel, expectedFormalOrInformalTripleLanguage);
            expect(instancePublishedInIpdc).toBeTruthy();
            const publicService = IpdcStub.getObjectByType(instancePublishedInIpdc, 'http://purl.org/vocab/cpsv#PublicService');

            expect(publicService['http://data.europa.eu/m8g/hasContactPoint']).toHaveLength(3);
            const contactpuntUri1 = publicService['http://data.europa.eu/m8g/hasContactPoint'][0]['@id'];
            const contactpunt1 = IpdcStub.getObjectById(instancePublishedInIpdc, contactpuntUri1);

            const contactpuntUri2 = publicService['http://data.europa.eu/m8g/hasContactPoint'][1]['@id'];
            const contactpunt2 = IpdcStub.getObjectById(instancePublishedInIpdc, contactpuntUri2);

            const contactpuntUri3 = publicService['http://data.europa.eu/m8g/hasContactPoint'][2]['@id'];
            const contactpunt3 = IpdcStub.getObjectById(instancePublishedInIpdc, contactpuntUri3);

            const contactpunten = [contactpunt1,contactpunt2,contactpunt3];
            const sortedContactpunten = sortBy(contactpunten, (contactpunt) => Number(contactpunt['http://www.w3.org/ns/shacl#order'][0]['@value']))

            // CONTACT POINT 1
            expect(sortedContactpunten[0]['http://schema.org/email']).toHaveLength(1);
            expect(sortedContactpunten[0]['http://schema.org/email']).toEqual([{ "@value": `1${email}` }]);

            expect(sortedContactpunten[0]['http://schema.org/telephone']).toHaveLength(1);
            expect(sortedContactpunten[0]['http://schema.org/telephone']).toEqual([{ "@value": `${telefoon}1` }]);

            expect(sortedContactpunten[0]['http://schema.org/url']).toHaveLength(1);
            expect(sortedContactpunten[0]['http://schema.org/url']).toEqual([{ "@value": `${website}/1` }]);

            expect(sortedContactpunten[0]['http://schema.org/openingHours']).toHaveLength(1);
            expect(sortedContactpunten[0]['http://schema.org/openingHours']).toEqual([{ "@value": `${website}/1/openingsuren` }]);

            expect(sortedContactpunten[0]['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address']).toHaveLength(1);

            expect(sortedContactpunten[0]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
            expect(sortedContactpunten[0]['http://www.w3.org/ns/shacl#order'][0])
                .toEqual({ "@value": "1", "@type": "http://www.w3.org/2001/XMLSchema#integer"});


            // CONTACT POINT 3
            expect(sortedContactpunten[1]['http://schema.org/email']).toHaveLength(1);
            expect(sortedContactpunten[1]['http://schema.org/email']).toEqual([{ "@value": `3${email}` }]);

            expect(sortedContactpunten[1]['http://schema.org/telephone']).toHaveLength(1);
            expect(sortedContactpunten[1]['http://schema.org/telephone']).toEqual([{ "@value": `${telefoon}3` }]);

            expect(sortedContactpunten[1]['http://schema.org/url']).toHaveLength(1);
            expect(sortedContactpunten[1]['http://schema.org/url']).toEqual([{ "@value": `${website}/3` }]);

            expect(sortedContactpunten[1]['http://schema.org/openingHours']).toHaveLength(1);
            expect(sortedContactpunten[1]['http://schema.org/openingHours']).toEqual([{ "@value": `${website}/3/openingsuren` }]);

            expect(sortedContactpunten[1]['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address']).toHaveLength(1);

            expect(sortedContactpunten[1]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
            expect(sortedContactpunten[1]['http://www.w3.org/ns/shacl#order'][0])
                .toEqual({ "@value": "3", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

            // CONTACT POINT 4
            expect(sortedContactpunten[2]['http://schema.org/email']).toHaveLength(1);
            expect(sortedContactpunten[2]['http://schema.org/email']).toEqual([{ "@value": `4${email}` }]);

            expect(sortedContactpunten[2]['http://schema.org/telephone']).toHaveLength(1);
            expect(sortedContactpunten[2]['http://schema.org/telephone']).toEqual([{ "@value": `${telefoon}4` }]);

            expect(sortedContactpunten[2]['http://schema.org/url']).toHaveLength(1);
            expect(sortedContactpunten[2]['http://schema.org/url']).toEqual([{ "@value": `${website}/4` }]);

            expect(sortedContactpunten[2]['http://schema.org/openingHours']).toHaveLength(1);
            expect(sortedContactpunten[2]['http://schema.org/openingHours']).toEqual([{ "@value": `${website}/4/openingsuren` }]);

            expect(sortedContactpunten[2]['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address']).toHaveLength(1);

            expect(sortedContactpunten[2]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
            expect(sortedContactpunten[2]['http://www.w3.org/ns/shacl#order'][0])
                .toEqual({ "@value": "4", "@type": "http://www.w3.org/2001/XMLSchema#integer"});
        })
    });

    async function startVanConcept () {
        await toevoegenPage.resultTable.row(second_row).link('Financiële tussenkomst voor een verblijf in een woonzorgcentrum').click();

        await conceptDetailsPage.expectToBeVisible();
        await expect(conceptDetailsPage.heading).toHaveText('Concept: Financiële tussenkomst voor een verblijf in een woonzorgcentrum');
        await conceptDetailsPage.voegToeButton.click();

        await instantieDetailsPage.expectToBeVisible();
        await expect(instantieDetailsPage.heading).toHaveText(`Financiële tussenkomst voor een verblijf in een woonzorgcentrum - ${formalInformalChoiceSuffix}`);
        await expect(instantieDetailsPage.inhoudTab).toHaveClass(/active/);
        await expect(instantieDetailsPage.eigenschappenTab).not.toHaveClass(/active/);

        titel = await instantieDetailsPage.titelInput.inputValue();
        expect(titel).toEqual(`Financiële tussenkomst voor een verblijf in een woonzorgcentrum - ${formalInformalChoiceSuffix}`);

        const beschrijving = await instantieDetailsPage.beschrijvingEditor.textContent();
        expect(beschrijving).toEqual(`Als u problemen hebt om uw verblijf in een woonzorgcentrum te betalen, dan kan het OCMW tussenkomen in de financiële kosten. - ${formalInformalChoiceSuffix}`);

    }

    async function voorwaardeOrderCheck (){

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
    async function procedureOrderCheck () {

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
    async function kostOrderCheck () {

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
    async function financieelVoordeelOrderCheck () {

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
    async function websiteOrderCheck () {

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

    function verifyPublishedInstance(instance: any[], {
                                         procedureWebsiteTitel,
                                         procedureWebsiteTitelEngels,
                                         procedureWebsiteBeschrijving,
                                         procedureWebsiteBeschrijvingEngels,
                                         procedureWebsiteUrl1,
                                         procedureWebsiteUrl3,
                                         procedureWebsiteUrlNew,
                                     },
                                     expectedFormalOrInformalTripleLanguage: string) {

        // PROCEDURE
        const publicService = IpdcStub.getObjectByType(instance, 'http://purl.org/vocab/cpsv#PublicService');
        const procedureUri = publicService['http://purl.org/vocab/cpsv#follows'][0]["@id"];
        const procedure = IpdcStub.getObjectById(instance, procedureUri);

        expect(procedure['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites']).toHaveLength(3);
        const procedureWebsiteUri1 = procedure['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites'][0]['@id'];
        const procedureWebsite1 = IpdcStub.getObjectById(instance, procedureWebsiteUri1);

        const procedureWebsiteUri2 = procedure['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites'][1]['@id'];
        const procedureWebsite2 = IpdcStub.getObjectById(instance, procedureWebsiteUri2);

        const procedureWebsiteUri3 = procedure['https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites'][2]['@id'];
        const procedureWebsite3 = IpdcStub.getObjectById(instance, procedureWebsiteUri3);

        const procedureWebsites = [procedureWebsite1, procedureWebsite2, procedureWebsite3];
        const sortedProcedureWebsites = sortBy(procedureWebsites, (procedureWebsite) => Number(procedureWebsite['http://www.w3.org/ns/shacl#order'][0]['@value']))

        expect(procedure['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(procedure['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({"@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // PROCEDURE WEBSITE 1
        expect(sortedProcedureWebsites[0]['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(sortedProcedureWebsites[0]['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            {"@language": expectedFormalOrInformalTripleLanguage, "@value": `${procedureWebsiteTitel} 1`},
            {"@language": "en", "@value": `${procedureWebsiteTitelEngels} 1`}
        ]));

        expect(sortedProcedureWebsites[0]['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(sortedProcedureWebsites[0]['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `${procedureWebsiteBeschrijving} 1`
            },
            {"@language": "en", "@value": `${procedureWebsiteBeschrijvingEngels} 1`}
        ]));

        expect(sortedProcedureWebsites[0]['http://schema.org/url']).toHaveLength(1);
        expect(sortedProcedureWebsites[0]['http://schema.org/url'][0]).toEqual({"@value": procedureWebsiteUrl1});

        expect(sortedProcedureWebsites[0]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(sortedProcedureWebsites[0]['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({"@value": "0", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

      // PROCEDURE WEBSITE 3
        expect(sortedProcedureWebsites[1]['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(sortedProcedureWebsites[1]['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            {"@language": expectedFormalOrInformalTripleLanguage, "@value": `${procedureWebsiteTitel} 3`},
            {"@language": "en", "@value": `${procedureWebsiteTitelEngels} 3`}
        ]));

        expect(sortedProcedureWebsites[1]['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(sortedProcedureWebsites[1]['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `${procedureWebsiteBeschrijving} 3`
            },
            {"@language": "en", "@value": `${procedureWebsiteBeschrijvingEngels} 3`}
        ]));

        expect(sortedProcedureWebsites[1]['http://schema.org/url']).toHaveLength(1);
        expect(sortedProcedureWebsites[1]['http://schema.org/url'][0]).toEqual({"@value": procedureWebsiteUrl3});

        expect(sortedProcedureWebsites[1]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(sortedProcedureWebsites[1]['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({"@value": "2", "@type": "http://www.w3.org/2001/XMLSchema#integer"});

        // PROCEDURE WEBSITE NEW
        expect(sortedProcedureWebsites[2]['http://purl.org/dc/terms/title']).toHaveLength(2);
        expect(sortedProcedureWebsites[2]['http://purl.org/dc/terms/title']).toEqual(expect.arrayContaining([
            {"@language": expectedFormalOrInformalTripleLanguage, "@value": `${procedureWebsiteTitel} new`},
            {"@language": "en", "@value": `${procedureWebsiteTitelEngels} new`}
        ]));

        expect(sortedProcedureWebsites[2]['http://purl.org/dc/terms/description']).toHaveLength(2);
        expect(sortedProcedureWebsites[2]['http://purl.org/dc/terms/description']).toEqual(expect.arrayContaining([
            {
                "@language": expectedFormalOrInformalTripleLanguage,
                "@value": `<p data-indentation-level="0">${procedureWebsiteBeschrijving} new</p>`
            },
            {"@language": "en", "@value": `<p data-indentation-level="0">${procedureWebsiteBeschrijvingEngels} new</p>`}
        ]));

        expect(sortedProcedureWebsites[2]['http://schema.org/url']).toHaveLength(1);
        expect(sortedProcedureWebsites[2]['http://schema.org/url'][0]).toEqual({"@value": procedureWebsiteUrlNew});

        expect(sortedProcedureWebsites[2]['http://www.w3.org/ns/shacl#order']).toHaveLength(1);
        expect(sortedProcedureWebsites[2]['http://www.w3.org/ns/shacl#order'][0])
            .toEqual({"@value": "3", "@type": "http://www.w3.org/2001/XMLSchema#integer"});
    }

    async function verzendNaarVlaamseOverheid(){
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();
    }

});
