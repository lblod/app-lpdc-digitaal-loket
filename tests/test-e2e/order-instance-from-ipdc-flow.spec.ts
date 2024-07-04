import { expect, Page, test } from '@playwright/test';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from './pages/product-of-dienst-toevoegen-page';
import { first_row, second_row } from './components/table';
import { ConceptDetailsPage as ConceptDetailsPage } from './pages/concept-details-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { WijzigingenBewarenModal } from './modals/wijzigingen-bewaren-modal';
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
import { IpdcStub } from "./components/ipdc-stub";
import { verifyInstancePublishedOnIPDC } from './shared/verify-instance-published-on-ipdc';
import {v4 as uuid} from 'uuid';

test.describe.configure({ mode: 'parallel' });
test.describe('Order instance from IPDC flow', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let conceptDetailsPage: ConceptDetailsPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let wijzigingenBewarenModal: WijzigingenBewarenModal;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;
    let formalInformalChoiceSuffix = 'informal';
    let titel: string;

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
            await regelgevendeBronCheck();
        });

        test('Adding and removing keeps orders correct', async () => {
            const titelWebsiteVoorProcedure = 'Procedure website naam - informal';
            const beschrijvingWebsiteVoorProcedure = 'procedure website beschrijving - informal';
            const websiteURLVoorProcedure1 = 'https://procedure-website1.com';
            const websiteURLVoorProcedure3 = 'https://procedure-website3.com';
            const websiteURLVoorProcedureNew = 'https://procedure-websiteNew.com';

            await startVanConcept();
            await instantieDetailsPage.verwijderWebsiteButtonVoorProcedure(1).click();

            //add website to procedure
            await instantieDetailsPage.voegWebsiteToeButtonVoorProcedure().click();

            await instantieDetailsPage.titelWebsiteVoorProcedureInput(2).fill(`${titelWebsiteVoorProcedure} new`);
            await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(2).fill(`${beschrijvingWebsiteVoorProcedure} new`);
            await instantieDetailsPage.websiteURLVoorProcedureInput(2).fill(websiteURLVoorProcedureNew);

            await instantieDetailsPage.eigenschappenTab.click();
            await wijzigingenBewarenModal.expectToBeVisible();
            await wijzigingenBewarenModal.bewaarButton.click();
            await wijzigingenBewarenModal.expectToBeClosed();

            await instantieDetailsPage.bevoegdeOverheidMultiSelect.selectValue('Aarschot (Gemeente)');
            await instantieDetailsPage.geografischToepassingsgebiedMultiSelect.selectValue('Provincie Vlaams-Brabant');

            await verzendNaarVlaamseOverheid();

            //check order after send
            await homePage.resultTable.row(first_row).link('Financiële tussenkomst voor een verblijf in een woonzorgcentrum').click();

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(0)).toHaveValue(`${titelWebsiteVoorProcedure} 1`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(0).textContent()).toContain(`${beschrijvingWebsiteVoorProcedure} 1`);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput(0)).toHaveValue(websiteURLVoorProcedure1);

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(1)).toHaveValue(`${titelWebsiteVoorProcedure} 3`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(1).textContent()).toContain(`${beschrijvingWebsiteVoorProcedure} 3`);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput(1)).toHaveValue(websiteURLVoorProcedure3);

            await expect(instantieDetailsPage.titelWebsiteVoorProcedureInput(2)).toHaveValue(`${titelWebsiteVoorProcedure} new`);
            expect(await instantieDetailsPage.beschrijvingWebsiteVoorProcedureReadonly(2).textContent()).toContain(`${beschrijvingWebsiteVoorProcedure} new`);
            await expect(instantieDetailsPage.websiteURLVoorProcedureInput(2)).toHaveValue(websiteURLVoorProcedureNew);

            //check order in Ipdc
            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    procedures: [
                        {
                            nestedGroup: [
                                {
                                    titel: {nl: `${titelWebsiteVoorProcedure} 1` },
                                    beschrijving: {nl: `${beschrijvingWebsiteVoorProcedure} 1`, notRich: true},
                                    url: websiteURLVoorProcedure1,
                                    order: 0,
                                },
                                {
                                    titel: {nl: `${titelWebsiteVoorProcedure} 3` },
                                    beschrijving: {nl: `${beschrijvingWebsiteVoorProcedure} 3`, notRich: true},
                                    url: websiteURLVoorProcedure3,
                                    order: 2,
                                },
                                {
                                    titel: {nl: `${titelWebsiteVoorProcedure} new` },
                                    beschrijving: {nl: `${beschrijvingWebsiteVoorProcedure} new` },
                                    url: websiteURLVoorProcedureNew,
                                    order: 3,
                                },
                            ]
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test('Starting an instance from scratch and adding and removing items keeps the order', async () => {
            titel = 'Order test';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`)

            //KOST 1
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput().fill('Kost 1');
            await instantieDetailsPage.beschrijvingKostEditor().click();
            await instantieDetailsPage.beschrijvingKostEditor().fill('Kost beschrijving 1');

            //KOST 2
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput(1).fill('Kost 2');
            await instantieDetailsPage.beschrijvingKostEditor(1).click();
            await instantieDetailsPage.beschrijvingKostEditor(1).fill('Kost beschrijving 2');

            //KOST 3
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput(2).fill('Kost 3');
            await instantieDetailsPage.beschrijvingKostEditor(2).click();
            await instantieDetailsPage.beschrijvingKostEditor(2).fill('Kost beschrijving 3');

            //DELETE KOST 2
            await instantieDetailsPage.verwijderKostButton(1).click();

            //KOST 4
            await instantieDetailsPage.voegKostToeButton.click();
            await instantieDetailsPage.titelKostInput(2).fill('Kost 4');
            await instantieDetailsPage.beschrijvingKostEditor(2).click();
            await instantieDetailsPage.beschrijvingKostEditor(2).fill('Kost beschrijving 4');

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    kosten: [
                        {
                            titel: {nl: `Kost 1`},
                            beschrijving: {nl: `Kost beschrijving 1`},
                            order: 1,
                        },
                        {
                            titel: {nl: `Kost 3`},
                            beschrijving: {nl: `Kost beschrijving 3`},
                            order: 3,
                        },
                        {
                            titel: {nl: `Kost 4`},
                            beschrijving: {nl: `Kost beschrijving 4`},
                            order: 4,
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test('Contactpunten order gets saved and sent correctly', async () => {
            titel = 'Contactpunten order test';
            const email = 'mail@example.com'
            const telefoon = '041234567'
            const website = 'https://www.example.com'

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.click();
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

            await verzendNaarVlaamseOverheid();

            //check order in Ipdc
            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    contactPunten: [
                        {
                            email: `1${email}`,
                            telephone: `${telefoon}1`,
                            url: `${website}/1`,
                            openingHours: `${website}/1/openingsuren`,
                            order: 1,
                            address: {     
                                land: 'België',
                                gemeentenaam: 'Harelbeke',
                                straatnaam: 'Generaal Deprezstraat',
                                huisnummer: '2',
                                busnummer: '50',
                            },
                        },
                        {
                            email: `3${email}`,
                            telephone: `${telefoon}3`,
                            url: `${website}/3`,
                            openingHours: `${website}/3/openingsuren`,
                            order: 3,
                            address: {     
                                land: 'België',
                                gemeentenaam: 'Harelbeke',
                                straatnaam: 'Generaal Deprezstraat',
                                huisnummer: '2',
                                busnummer: '50',
                            },
                        },
                        {
                            email: `4${email}`,
                            telephone: `${telefoon}4`,
                            url: `${website}/4`,
                            openingHours: `${website}/4/openingsuren`,
                            order: 4,
                            address: {     
                                land: 'België',
                                gemeentenaam: 'Harelbeke',
                                straatnaam: 'Generaal Deprezstraat',
                                huisnummer: '2',
                                busnummer: '50',
                            },
                        },
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test('Legal resources order gets saved and sent correctly', async() => {
            titel = `legal resources order test ${uuid()}`;
            
            const regelgevendeBronTitel = 'regelgevende bron titel';
            const regelgevendeBronBeschrijving = 'regelgevende bron beschrijving';
            const regelgevendeBronUrl = 'http://codex.vlaanderen.be/url';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.click();
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegRegelgevendeBronToeButton.click();
            await instantieDetailsPage.titelRegelgevendeBronInput(0).fill(`${regelgevendeBronTitel} 1`);
            await instantieDetailsPage.beschrijvingRegelgevendeBronEditor(0).fill(`${regelgevendeBronBeschrijving} 1`);
            await instantieDetailsPage.regelgevendeBronUrlInput(0).fill(`${regelgevendeBronUrl}-1`);

            await instantieDetailsPage.voegRegelgevendeBronToeButton.click();
            await instantieDetailsPage.titelRegelgevendeBronInput(1).fill(`${regelgevendeBronTitel} 2`);
            await instantieDetailsPage.beschrijvingRegelgevendeBronEditor(1).fill(`${regelgevendeBronBeschrijving} 2`);
            await instantieDetailsPage.regelgevendeBronUrlInput(1).fill(`${regelgevendeBronUrl}-2`);

            await instantieDetailsPage.voegRegelgevendeBronToeButton.click();
            await instantieDetailsPage.titelRegelgevendeBronInput(2).fill(`${regelgevendeBronTitel} 3`);
            await instantieDetailsPage.beschrijvingRegelgevendeBronEditor(2).fill(`${regelgevendeBronBeschrijving} 3`);
            await instantieDetailsPage.regelgevendeBronUrlInput(2).fill(`${regelgevendeBronUrl}-3`);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await instantieDetailsPage.verwijderRegelgevendeBronButton(1).click();

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();
            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    regelgeving: [
                        {
                            titel: {nl: `${regelgevendeBronTitel} 1`},
                            beschrijving: {nl: `${regelgevendeBronBeschrijving} 1`},
                            url: `${regelgevendeBronUrl}-1`,
                            order: 1,
                        },
                        {
                            titel: {nl: `${regelgevendeBronTitel} 3`},
                            beschrijving: {nl: `${regelgevendeBronBeschrijving} 3`},
                            url: `${regelgevendeBronUrl}-3`,
                            order: 3,
                        }                    
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );

        });
    });

    

    async function startVanConcept() {
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

    async function voorwaardeOrderCheck() {

        for (let i = 1; i < 4; i++) {
            let order = i - 1;

            const titelVoorwaarde = await instantieDetailsPage.titelVoorwaardeInput(order).inputValue();
            expect(titelVoorwaarde).toEqual(`Wat meebrengen - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingVoorwaarde = await instantieDetailsPage.beschrijvingVoorwaardeEditor(order).textContent();
            expect(beschrijvingVoorwaarde).toEqual(`Wat meebrengen - ${formalInformalChoiceSuffix} ${i}`);

            const titelBewijsstuk = await instantieDetailsPage.titelBewijsstukInput(order).inputValue();
            expect(titelBewijsstuk).toEqual(`Bewijs om mee te brengen - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingBewijsstuk = await instantieDetailsPage.beschrijvingBewijsstukEditor(order).textContent();
            expect(beschrijvingBewijsstuk).toEqual(`Een overzicht van het volledige gezinsinkomen, een overzicht van de spaargelden, een kopie van uw identiteitskaart - ${formalInformalChoiceSuffix} ${i}`);
        }

    }

    async function procedureOrderCheck() {

        const titelProcedure = await instantieDetailsPage.titelProcedureInput().inputValue();
        expect(titelProcedure).toEqual(`Procedure titel. - ${formalInformalChoiceSuffix}`);

        const beschrijvingProcedure = await instantieDetailsPage.beschrijvingProcedureEditor().textContent();
        expect(beschrijvingProcedure).toEqual(`Procedure beschrijving. - ${formalInformalChoiceSuffix}`);

        for (let i = 1; i < 4; i++) {
            let order = i - 1
            const titelWebsiteVoorProcedure = await instantieDetailsPage.titelWebsiteVoorProcedureInput(order).inputValue();
            expect(titelWebsiteVoorProcedure).toEqual(`Procedure website naam - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingWebsiteVoorProcedure = await instantieDetailsPage.beschrijvingWebsiteVoorProcedureEditor(order).textContent();
            expect(beschrijvingWebsiteVoorProcedure).toEqual(`procedure website beschrijving - ${formalInformalChoiceSuffix} ${i}`);

            const websiteURLVoorProcedure = await instantieDetailsPage.websiteURLVoorProcedureInput(order).inputValue();
            expect(websiteURLVoorProcedure).toEqual(`https://procedure-website${i}.com`);
        }

    }

    async function kostOrderCheck() {

        for (let i = 1; i < 4; i++) {
            let order = i - 1

            const titelKost = await instantieDetailsPage.titelKostInput(order).inputValue();
            expect(titelKost).toEqual(`Bedrag kost - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingKost = await instantieDetailsPage.beschrijvingKostEditor(order).textContent();
            expect(beschrijvingKost).toEqual(`De aanvraag en het attest zijn gratis. - ${formalInformalChoiceSuffix} ${i}`);
        }

    }

    async function financieelVoordeelOrderCheck() {

        for (let i = 1; i < 4; i++) {
            let order = i - 1

            const titelFinancieelVoordeel = await instantieDetailsPage.titelFinancieelVoordeelInput(order).inputValue();
            expect(titelFinancieelVoordeel).toEqual(`Titel financieel voordeel. - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingFinancieelVoordeel = await instantieDetailsPage.beschrijvingFinancieelVoordeelEditor(order).textContent();
            expect(beschrijvingFinancieelVoordeel).toEqual(`Beschrijving financieel voordeel. - ${formalInformalChoiceSuffix} ${i}`);
        }
    }

    async function websiteOrderCheck() {

        for (let i = 1; i < 4; i++) {
            let order = i - 1

            const titelWebsite = await instantieDetailsPage.titelWebsiteInput(order).inputValue();
            expect(titelWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingWebsite = await instantieDetailsPage.beschrijvingWebsiteEditor(order).textContent();
            expect(beschrijvingWebsite).toEqual(`Website Belgische nationaliteit en naturalisatie beschrijving - ${formalInformalChoiceSuffix} ${i}`);

            const websiteURL = await instantieDetailsPage.websiteURLInput(order).inputValue();
            expect(websiteURL).toEqual(`https://justitie.belgium.be/nl/themas_en_dossiers/personen_en_gezinnen/nationaliteit_${i}`);
        }

    }

    async function regelgevendeBronCheck() {

        for (let i = 1; i < 4; i++) {
            let order = i - 1

            const titelRegelgevendeBron = await instantieDetailsPage.titelRegelgevendeBronInput(order).inputValue();
            expect(titelRegelgevendeBron).toEqual(`Regelgevende bron Belgische nationaliteit en naturalisatie - ${formalInformalChoiceSuffix} ${i}`);

            const beschrijvingRegelgevendeBron = await instantieDetailsPage.beschrijvingRegelgevendeBronEditor(order).textContent();
            expect(beschrijvingRegelgevendeBron).toEqual(`Regelgevende bron Belgische nationaliteit en naturalisatie beschrijving - ${formalInformalChoiceSuffix} ${i}`);

            const RegelgevendeBronURL = await instantieDetailsPage.regelgevendeBronUrlInput(order).inputValue();
            expect(RegelgevendeBronURL).toEqual(`https://codex.be/regelgevende-bron-${i}`);
        }

    }

    async function verzendNaarVlaamseOverheid() {
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();
    }

});
