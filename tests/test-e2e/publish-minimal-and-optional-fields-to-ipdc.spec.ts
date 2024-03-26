import { expect, Page, test } from '@playwright/test';
import { LpdcHomePage } from "./pages/lpdc-home-page";
import { MockLoginPage } from "./pages/mock-login-page";
import { UJeModal } from './modals/u-je-modal';
import { AddProductOrServicePage as ProductOfDienstToevoegenPage } from './pages/product-of-dienst-toevoegen-page';
import { InstantieDetailsPage } from './pages/instantie-details-page';
import { VerzendNaarVlaamseOverheidModal } from './modals/verzend-naar-vlaamse-overheid-modal';
import { IpdcStub } from "./components/ipdc-stub";
import { verifyInstancePublishedOnIPDC } from './shared/verify-instance-published-on-ipdc';
import { v4 as uuid } from 'uuid';

test.describe.configure({ mode: 'parallel' });
test.describe('Verifies editing and publishing of value objects with optional fields', () => {

    let page: Page;
    let mockLoginPage: MockLoginPage;
    let homePage: LpdcHomePage;
    let toevoegenPage: ProductOfDienstToevoegenPage;
    let instantieDetailsPage: InstantieDetailsPage;
    let verzendNaarVlaamseOverheidModal: VerzendNaarVlaamseOverheidModal;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        mockLoginPage = MockLoginPage.createForLpdc(page);
        homePage = LpdcHomePage.create(page);

        toevoegenPage = ProductOfDienstToevoegenPage.create(page);
        instantieDetailsPage = InstantieDetailsPage.create(page);
        verzendNaarVlaamseOverheidModal = VerzendNaarVlaamseOverheidModal.create(page);

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

    test.afterEach(async () => {
        await page.close();
    });

    test.describe('Voorwaarde', () => {

        test(`Voorwaarde > bewijsstuk`, async () => {
            const titel = `voorwaarde bewijsstuk optioneel ${uuid()}`;

            const voorwaardeTitel = 'voorwaarde titel';
            const voorwaardeBeschrijving = 'voorwaarde beschrijving';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegVoorwaardeToeButton.click();
            await instantieDetailsPage.titelVoorwaardeInput().fill(voorwaardeTitel);
            await instantieDetailsPage.beschrijvingVoorwaardeEditor().fill(voorwaardeBeschrijving);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    voorwaarden: [
                        {
                            titel: { nl: voorwaardeTitel },
                            beschrijving: { nl: voorwaardeBeschrijving },
                            order: 1,
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

    });

    test.describe('Procedure', () => {

        test(`Procedure > website is optioneel`, async () => {
            const titel = `Procedure > website is optioneel ${uuid()}`;

            const procedureTitel = 'procedure titel';
            const procedureBeschrijving = 'procedure beschrijving';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegProcedureToeButton.click();
            await instantieDetailsPage.titelProcedureInput().fill(procedureTitel);
            await instantieDetailsPage.beschrijvingProcedureEditor().fill(procedureBeschrijving);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    procedures: [
                        {
                            titel: { nl: procedureTitel },
                            beschrijving: { nl: procedureBeschrijving },
                            order: 1,
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test(`Procedure > website > beschrijving is optioneel`, async () => {
            const titel = `Procedure > website > beschrijving is optioneel ${uuid()}`;

            const procedureTitel = 'procedure titel';
            const procedureBeschrijving = 'procedure beschrijving';

            const procedureWebsiteTitel = 'procedure website titel';
            const procedureWebsiteUrl = 'http://procedure.website.url';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegProcedureToeButton.click();
            await instantieDetailsPage.titelProcedureInput().fill(procedureTitel);
            await instantieDetailsPage.beschrijvingProcedureEditor().fill(procedureBeschrijving);

            await instantieDetailsPage.voegWebsiteToeButtonVoorProcedure().click();
            await instantieDetailsPage.titelWebsiteVoorProcedureInput().fill(procedureWebsiteTitel);
            await instantieDetailsPage.websiteURLVoorProcedureInput().fill(procedureWebsiteUrl);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    procedures: [
                        {
                            titel: { nl: procedureTitel },
                            beschrijving: { nl: procedureBeschrijving },
                            order: 1,
                            nestedGroup: [
                                {
                                    titel: { nl: procedureWebsiteTitel },
                                    url: procedureWebsiteUrl,
                                    order: 1
                                }
                            ]
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

    });

    test.describe('Regelgevende bron', () => {

        test(`Regelgevende bron > titel is optioneel`, async () => {
            const titel = `legal resources titel optioneel ${uuid()}`;

            const regelgevendeBronBeschrijving = 'regelgevende bron beschrijving';
            const regelgevendeBronUrl = 'http://codex.vlaanderen.be/url';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegRegelgevendeBronToeButton.click();
            await instantieDetailsPage.beschrijvingRegelgevendeBronEditor().fill(regelgevendeBronBeschrijving);
            await instantieDetailsPage.regelgevendeBronUrlInput().fill(regelgevendeBronUrl);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    regelgevendeBronnen: [
                        {
                            beschrijving: { nl: regelgevendeBronBeschrijving },
                            url: regelgevendeBronUrl,
                            order: 1,
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test(`Regelgevende bron > beschrijving is optioneel`, async () => {
            const titel = `legal resources beschrijving optioneel ${uuid()}`;

            const regelgevendeBronTitel = 'regelgevende bron titel';
            const regelgevendeBronUrl = 'http://codex.vlaanderen.be/url';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegRegelgevendeBronToeButton.click();
            await instantieDetailsPage.titelRegelgevendeBronInput().fill(regelgevendeBronTitel);
            await instantieDetailsPage.regelgevendeBronUrlInput().fill(regelgevendeBronUrl);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    regelgevendeBronnen: [
                        {
                            titel: { nl: regelgevendeBronTitel },
                            url: regelgevendeBronUrl,
                            order: 1,
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test(`Regelgevende bron > titel en beschrijving zijn optioneel`, async () => {
            const titel = `Regelgevende bron > titel en beschrijving zijn optioneel ${uuid()}`;

            const regelgevendeBronUrl = 'http://codex.vlaanderen.be/url';

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegRegelgevendeBronToeButton.click();
            await instantieDetailsPage.regelgevendeBronUrlInput().fill(regelgevendeBronUrl);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    regelgevendeBronnen: [
                        {
                            url: regelgevendeBronUrl,
                            order: 1,
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

    });

    test.describe('Contactpunt', () => {

        let nmbr = 0;

        test(`Contactpunt > email is optioneel`, async () => {
            const titel = `Contactpunt > email is optioneel ${uuid()}`;

            const contactpuntTelefoon = `111111111`;
            const contactpuntWebsiteUrl = `http://test${nmbr++}@test.com`;
            const contactpuntOpeningsUren = `ma - vrij - ${nmbr++}`;

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue(contactpuntTelefoon);
            await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue(contactpuntWebsiteUrl);
            await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue(contactpuntOpeningsUren);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    contactPunten: [
                        {
                            telephone: contactpuntTelefoon,
                            url: contactpuntWebsiteUrl,
                            openingHours: contactpuntOpeningsUren,
                            order: 1
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test(`Contactpunt > telefoon is optioneel`, async () => {
            const titel = `Contactpunt > telefoon is optioneel ${uuid()}`;

            const contactpuntEmail = `test${nmbr++}@me.com`;
            const contactpuntWebsiteUrl = `http://test${nmbr++}@test.com`;
            const contactpuntOpeningsUren = `ma - vrij - ${nmbr++}`;

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect().insertNewValue(contactpuntEmail);
            await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue(contactpuntWebsiteUrl);
            await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue(contactpuntOpeningsUren);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    contactPunten: [
                        {
                            email: contactpuntEmail,
                            url: contactpuntWebsiteUrl,
                            openingHours: contactpuntOpeningsUren,
                            order: 1
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test(`Contactpunt > website is optioneel`, async () => {
            const titel = `Contactpunt > website is optioneel ${uuid()}`;

            const contactpuntEmail = `test${nmbr++}@me.com`;
            const contactpuntTelefoon = `111111111`;
            const contactpuntOpeningsUren = `ma - vrij - ${nmbr++}`;

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect().insertNewValue(contactpuntEmail);
            await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue(contactpuntTelefoon);
            await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue(contactpuntOpeningsUren);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    contactPunten: [
                        {
                            email: contactpuntEmail,
                            telephone: contactpuntTelefoon,
                            openingHours: contactpuntOpeningsUren,
                            order: 1
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test(`Contactpunt > openingsuren is optioneel`, async () => {
            const titel = `Contactpunt > openingsuren is optioneel ${uuid()}`;

            const contactpuntEmail = `test${nmbr++}@me.com`;
            const contactpuntTelefoon = `111111111`;
            const contactpuntWebsiteUrl = `http://test${nmbr++}@test.com`;

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegContactpuntToeButton.click();
            await instantieDetailsPage.contactpuntEmailSelect().insertNewValue(contactpuntEmail);
            await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue(contactpuntTelefoon);
            await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue(contactpuntWebsiteUrl);

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    contactPunten: [
                        {
                            email: contactpuntEmail,
                            telephone: contactpuntTelefoon,
                            url: contactpuntWebsiteUrl,
                            order: 1
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

        test.describe('Adres', () => {

            test(`Contactpunt > Adres is optioneel`, async () => {
                const titel = `Contactpunt > Adres is optioneel ${uuid()}`;

                const contactpuntEmail = `test${nmbr++}@me.com`;
                const contactpuntTelefoon = `111111111`;
                const contactpuntWebsiteUrl = `http://test${nmbr++}@test.com`;
                const contactpuntOpeningsUren = `ma - vrij - ${nmbr++}`;

                await toevoegenPage.volledigNieuwProductToevoegenButton.click();
                await instantieDetailsPage.expectToBeVisible();

                await instantieDetailsPage.titelInput.fill(titel);
                await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

                await instantieDetailsPage.voegContactpuntToeButton.click();
                await instantieDetailsPage.contactpuntEmailSelect().insertNewValue(contactpuntEmail);
                await instantieDetailsPage.contactpuntTelefoonSelect().insertNewValue(contactpuntTelefoon);
                await instantieDetailsPage.contactpuntWebsiteURLSelect().insertNewValue(contactpuntWebsiteUrl);
                await instantieDetailsPage.contactpuntOpeningsurenSelect().insertNewValue(contactpuntOpeningsUren);

                await instantieDetailsPage.wijzigingenBewarenButton.click();
                await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

                await verzendNaarVlaamseOverheid();

                const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
                const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
                expect(instancePublishedInIpdc).toBeTruthy();

                verifyInstancePublishedOnIPDC(
                    instancePublishedInIpdc,
                    {
                        contactPunten: [
                            {
                                email: contactpuntEmail,
                                telephone: contactpuntTelefoon,
                                url: contactpuntWebsiteUrl,
                                openingHours: contactpuntOpeningsUren,
                                order: 1
                            }
                        ]
                    },
                    expectedFormalOrInformalTripleLanguage
                );
            });
        });

    });

    test.describe('Meer Info Website', () => {

        test(`Meer Info Website > beschrijving is optioneel`, async () => {
            const titel = `Meer Info Website > beschrijving is optioneel ${uuid()}`;

            const meerInfoTitel = `meer info website titel`;
            const meerInfoUrl = `http://test@test.com`;

            await toevoegenPage.volledigNieuwProductToevoegenButton.click();
            await instantieDetailsPage.expectToBeVisible();

            await instantieDetailsPage.titelInput.fill(titel);
            await instantieDetailsPage.beschrijvingEditor.fill(`${titel} beschrijving`);

            await instantieDetailsPage.voegWebsiteToeButton.click();
            await instantieDetailsPage.titelWebsiteInput().fill(meerInfoTitel)
            await instantieDetailsPage.websiteURLInput().fill(meerInfoUrl)

            await instantieDetailsPage.wijzigingenBewarenButton.click();
            await expect(instantieDetailsPage.wijzigingenBewarenButton).toBeDisabled();

            await verzendNaarVlaamseOverheid();

            const expectedFormalOrInformalTripleLanguage = 'nl-be-x-informal';
            const instancePublishedInIpdc = await IpdcStub.findPublishedInstance({ title: titel, expectedFormalOrInformalTripleLanguage: expectedFormalOrInformalTripleLanguage });
            expect(instancePublishedInIpdc).toBeTruthy();

            verifyInstancePublishedOnIPDC(
                instancePublishedInIpdc,
                {
                    meerInfos: [
                        {
                            titel: { nl: meerInfoTitel },
                            url: meerInfoUrl,
                            order: 1
                        }
                    ]
                },
                expectedFormalOrInformalTripleLanguage
            );
        });

    });

    async function verzendNaarVlaamseOverheid() {
        await instantieDetailsPage.verzendNaarVlaamseOverheidButton.click();

        await verzendNaarVlaamseOverheidModal.expectToBeVisible();
        await verzendNaarVlaamseOverheidModal.verzendNaarVlaamseOverheidButton.click();
        await verzendNaarVlaamseOverheidModal.expectToBeClosed();
    }

});
