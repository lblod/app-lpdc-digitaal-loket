import { expect, Locator, Page } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { MultiSelect } from "../components/multi-select";
import { Select } from "../components/select";
import { SelectWithCreate } from "../components/select-with-create";
import { Alert } from "../components/alert";

export class InstantieDetailsPage extends AbstractPage {

    private readonly menuHeader: Locator;
    readonly heading: Locator;

    readonly inhoudTab: Locator;
    readonly eigenschappenTab: Locator;

    readonly basisinformatieHeading: Locator;

    readonly koppelConceptLink: Locator;
    readonly conceptLoskoppelenButton: Locator;
    readonly gekoppeldConceptLink: Locator;

    readonly uJeVersie: Locator;

    readonly instantieLoskoppelenAlert: Alert;
    readonly instantieLoskoppelenAlertLoskoppelenButton: Locator;

    readonly ipdcConceptIdHeader: Locator;
    readonly productTypeHeader: Locator;
    readonly aangemaaktOpHeader: Locator;
    readonly bewerktOpHeader: Locator;
    readonly geldigVanafHeader: Locator;
    readonly geldigTotHeader: Locator;
    readonly statusHeader: Locator;

    readonly herzieningNodigAlert: Alert;
    readonly herzieningNodigAlertConceptBekijken: Locator;
    readonly herzieningNodigAlertConceptOvernemen: Locator;
    readonly herzieningNodigAlertGeenAanpassigenNodig: Locator;

    readonly conceptGearchiveerdAlert: Alert;
    readonly conceptGearchiveerdAlertConceptBekijken: Locator;
    readonly conceptGearchiveerdAlertGeenAanpassigenNodig: Locator;

    readonly omzettenNaarDeJeVormAlert: Alert
    readonly instantieInJeVormBekijkenButton: Locator
    readonly omzettenNaarDeJeVormButton: Locator
    readonly inhoudIsAlInDeJeVormButton: Locator
    readonly draftInstanceConversionAlert: Alert

    readonly titelInput: Locator;
    readonly titelConceptWijzigingenOvernemenLink: Locator;
    readonly beschrijvingEditor: Locator;
    readonly beschrijvingReadonly: Locator;
    readonly beschrijvingConceptWijzigingenOvernemenLink: Locator
    readonly aanvullendeBeschrijvingEditor: Locator;
    readonly aanvullendeBeschrijvingReadonly: Locator;
    readonly aanvullendeBeschrijvingConceptWijzigingenOvernemenLink: Locator
    readonly uitzonderingenEditor: Locator;
    readonly uitzonderingenReadonly: Locator;
    readonly uitzonderingenConceptWijzigingenOvernemenLink: Locator

    readonly voegVoorwaardeToeButton: Locator;
    readonly titelVoorwaardeInput: (order?: number) => Locator;
    readonly titelVoorwaardeConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingVoorwaardeEditor: (order?: number) => Locator;
    readonly beschrijvingVoorwaardeReadonly: (order?: number) => Locator
    readonly beschrijvingVoorwaardeConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly verwijderVoorwaardeButton: (order?: number) => Locator;

    readonly voegBewijsstukToeButton: (order?: number) => Locator;
    readonly titelBewijsstukInput: (order?: number) => Locator;
    readonly titelBewijsstukConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingBewijsstukEditor: (order?: number) => Locator;
    readonly beschrijvingBewijsstukReadonly: (order?: number) => Locator;
    readonly beschrijvingBewijsstukConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly verwijderBewijsButton: (order?: number) => Locator;

    readonly voegProcedureToeButton: Locator;
    readonly titelProcedureInput: (order?: number) => Locator;
    readonly titelProcedureConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingProcedureEditor: (order?: number) => Locator;
    readonly beschrijvingProcedureReadonly: (order?: number) => Locator;
    readonly beschrijvingProcedureConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly verwijderProcedureButton: (order?: number) => Locator;

    readonly voegWebsiteToeButtonVoorProcedure: (order?: number) => Locator;
    readonly titelWebsiteVoorProcedureInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureEditor: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink: (childOrder?: number, parentOrder?: number) => Locator;
    readonly websiteURLVoorProcedureInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly websiteURLVoorProcedureConceptWijzigingenOvernemenLink: (childOrder?: number, parentOrder?: number) => Locator;
    readonly verwijderWebsiteButtonVoorProcedure: (order?: number) => Locator;

    readonly voegKostToeButton: Locator;
    readonly verwijderKostButton: (order?: number) => Locator;
    readonly hetAantalKostenIsGewijzigdPill: Locator;
    readonly titelKostInput: (order?: number) => Locator;
    readonly titelKostConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingKostEditor: (order?: number) => Locator;
    readonly beschrijvingKostReadonly: (order?: number) => Locator;
    readonly beschrijvingKostConceptWijzigingenOvernemenLink: (order?: number) => Locator;

    readonly voegFinancieelVoordeelToeButton: Locator;
    readonly verwijderFinancieelVoordeelButton: (order?: number) => Locator;
    readonly titelFinancieelVoordeelInput: (order?: number) => Locator;
    readonly titelFinancieelVoordeelConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEditor: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelReadonly: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink: (order?: number) => Locator;

    readonly beschrijvingRegelgevingEditor: (order?: number) => Locator;
    readonly beschrijvingRegelgevingReadonly: (order?: number) => Locator;
    readonly beschrijvingRegelgevingConceptWijzigingenOvernemenLink: (order?: number) => Locator;

    readonly voegRegelgevendeBronToeButton: Locator;
    readonly verwijderRegelgevendeBronButton: (order?: number) => Locator;
    readonly titelRegelgevendeBronInput: (order?: number) => Locator;
    readonly titelRegelgevendeBronConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingRegelgevendeBronEditor: (order?: number) => Locator;
    readonly beschrijvingRegelgevendeBronReadonly: (order?: number) => Locator;
    readonly beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly regelgevendeBronUrlInput: (order?: number) => Locator;
    readonly regelgevendeBronUrlConceptWijzigingenOvernemenLink: (order?: number) => Locator;

    readonly contactpuntHeading: Locator;
    readonly voegContactpuntToeButton: Locator;
    readonly verwijderContactpuntButton: (order?: number) => Locator;
    readonly contactpuntEmailSelect: (order?: number) => SelectWithCreate;
    readonly contactpuntEmailReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly contactpuntTelefoonSelect: (order?: number) => SelectWithCreate;
    readonly contactpuntTelefoonReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly contactpuntWebsiteURLSelect: (order?: number) => SelectWithCreate;
    readonly contactpuntWebsiteURLReadonly: (order?: number) => Locator;
    readonly contactpuntOpeningsurenSelect: (order?: number) => SelectWithCreate;
    readonly contactpuntOpeningsurenReadonly: (order?: number) => Locator;
    readonly voegAdresToeButton: (order?: number) => Locator;
    readonly verwijderAdresButton: (order?: number) => Locator;
    readonly contactpuntAdresGemeenteSelect: (order?: number) => Select;
    readonly contactpuntAdresStraatSelect: (order?: number) => Select;
    readonly contactpuntAdresHuisnummerInput: (order?: number) => Locator;
    readonly contactpuntAdresBusnummerInput: (order?: number) => Locator;
    readonly contactpuntAdresValidatie: (order?: number) => Locator;

    readonly voegWebsiteToeButton: Locator;
    readonly verwijderWebsiteButton: (order?: number) => Locator;
    readonly hetAantalWebsitesIsGewijzigdPill: Locator;
    readonly titelWebsiteInput: (order?: number) => Locator;
    readonly titelWebsiteConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly beschrijvingWebsiteEditor: (order?: number) => Locator;
    readonly beschrijvingWebsiteReadonly: (order?: number) => Locator;
    readonly beschrijvingWebsiteConceptWijzigingenOvernemenLink: (order?: number) => Locator;
    readonly websiteURLInput: (order?: number) => Locator;
    readonly websiteURLConceptWijzigingenOvernemenLink: (order?: number) => Locator;

    //Eigenschappen
    readonly algemeneInfoHeading: Locator;

    readonly productOfDienstGeldigVanafInput: Locator;
    readonly productOfDienstGeldigVanafConceptWijzigingenOvernemenLink: Locator;
    readonly productOfDienstGeldigTotInput: Locator;
    readonly productOfDienstGeldigTotConceptWijzigingenOvernemenLink: Locator;
    readonly productTypeSelect: Select;
    readonly productTypeConceptWijzigingenOvernemenLink: Locator;
    readonly doelgroepenMultiSelect: MultiSelect;
    readonly doelgroepenConceptWijzigingenOvernemenLink: Locator;
    readonly themasMultiSelect: MultiSelect;
    readonly themasConceptWijzigingenOvernemenLink: Locator;
    readonly talenMultiSelect: MultiSelect;

    readonly bevoegdBestuursniveauMultiSelect: MultiSelect;
    readonly bevoegdBestuursniveauConceptWijzigingenOvernemenLink: Locator;
    readonly bevoegdeOverheidMultiSelect: MultiSelect;
    readonly bevoegdeOverheidConceptWijzigingenOvernemenLink: Locator;
    readonly uitvoerendBestuursniveauMultiSelect: MultiSelect;
    readonly uitvoerendBestuursniveauConceptWijzigingenOvernemenLink: Locator;
    readonly uitvoerendeOverheidMultiSelect: MultiSelect;
    readonly uitvoerendeOverheidConceptWijzigingenOvernemenLink: Locator;
    readonly geografischToepassingsgebiedMultiSelect: MultiSelect;

    readonly tagsMultiSelect: MultiSelect;
    readonly tagsConceptWijzigingenOvernemenLink: Locator;
    readonly publicatieKanalenMultiSelect: MultiSelect;
    readonly publicatieKanalenConceptWijzigingenOvernemenLink: Locator;
    readonly categorieenYourEuropeMultiSelect: MultiSelect;
    readonly categorieenYourEuropeConceptWijzigingenOvernemenLink: Locator;

    readonly verzendNaarVlaamseOverheidButton: Locator;
    readonly wijzigingenBewarenButton: Locator;
    readonly terugNaarHetOverzichtButton: Locator;
    readonly productOpnieuwBewerkenButton: Locator;
    readonly productVerwijderenButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Details' });
        this.heading = page.getByRole('heading').first();

        this.inhoudTab = page.getByRole('link', { name: 'Inhoud', exact: true })
        this.eigenschappenTab = page.getByRole('link', { name: 'Eigenschappen', exact: true });

        this.basisinformatieHeading = page.getByRole('heading', { name: 'Basisinformatie', exact: true });

        this.koppelConceptLink = page.getByRole('link', { name: 'Koppelen' });
        this.gekoppeldConceptLink = page.locator('a:left-of(button:has-text("Loskoppelen"))').first();
        this.conceptLoskoppelenButton = page.getByRole('button', { name: 'Loskoppelen' });

        this.uJeVersie = page.locator('dd:below(dt:has-text("Versie"))').first();

        this.instantieLoskoppelenAlert = new Alert(page, 'Instantie loskoppelen van het concept');
        this.instantieLoskoppelenAlertLoskoppelenButton = this.instantieLoskoppelenAlert.button('Loskoppelen');

        this.herzieningNodigAlert = new Alert(page, 'In het concept waarop dit product is gebaseerd, zijn de volgende velden aangepast:');
        this.herzieningNodigAlertConceptBekijken = this.herzieningNodigAlert.link('Concept bekijken');
        this.herzieningNodigAlertConceptOvernemen = this.herzieningNodigAlert.button('Wijzigingen overnemen');
        this.herzieningNodigAlertGeenAanpassigenNodig = this.herzieningNodigAlert.button('Geen aanpassingen nodig');

        this.conceptGearchiveerdAlert = new Alert(page, 'Het concept waarop dit product is gebaseerd, werd gearchiveerd.');
        this.conceptGearchiveerdAlertConceptBekijken = this.conceptGearchiveerdAlert.link('Concept bekijken');
        this.conceptGearchiveerdAlertGeenAanpassigenNodig = this.conceptGearchiveerdAlert.button('Geen aanpassingen nodig');

        this.omzettenNaarDeJeVormAlert = new Alert(page, 'Omzetting naar de je-vorm')
        this.instantieInJeVormBekijkenButton = this.omzettenNaarDeJeVormAlert.button('Instantie in je-vorm bekijken');
        this.omzettenNaarDeJeVormButton = this.omzettenNaarDeJeVormAlert.button('Omzetten naar de je-vorm');
        this.inhoudIsAlInDeJeVormButton = this.omzettenNaarDeJeVormAlert.button('Inhoud is al in de je-vorm');
        this.draftInstanceConversionAlert = new Alert(page, '')

        this.ipdcConceptIdHeader = page.locator('dl div').filter({ hasText: 'IPDC Concept ID' }).getByRole('definition');
        this.productTypeHeader = page.locator('dl div').filter({ hasText: 'Product type' }).getByRole('definition');
        this.aangemaaktOpHeader = page.locator('dl div').filter({ hasText: 'Aangemaakt op' }).getByRole('definition');
        this.bewerktOpHeader = page.locator('dl div').filter({ hasText: 'Bewerkt op' }).getByRole('definition');
        this.geldigVanafHeader = page.locator('dl div').filter({ hasText: 'Geldig vanaf' }).getByRole('definition');
        this.geldigTotHeader = page.locator('dl div').filter({ hasText: 'Geldig tot' }).getByRole('definition');
        this.statusHeader = page.locator('dl div').filter({ hasText: 'Status' }).getByRole('definition');

        this.titelInput = this.inputBelow('Titel').first();
        this.titelConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel'));
        this.beschrijvingEditor = this.editorBelow('Beschrijving').first();
        this.beschrijvingReadonly = this.readonlyBelow('Beschrijving').first();
        this.beschrijvingConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving'));
        this.aanvullendeBeschrijvingEditor = this.editorBelow('Aanvullende Beschrijving').first();
        this.aanvullendeBeschrijvingReadonly = this.readonlyBelow('Aanvullende Beschrijving').first();
        this.aanvullendeBeschrijvingConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Aanvullende Beschrijving'));
        this.uitzonderingenEditor = this.editorBelow('Uitzonderingen').first();
        this.uitzonderingenReadonly = this.readonlyBelow('Uitzonderingen').first();
        this.uitzonderingenConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Uitzonderingen'));

        this.voegVoorwaardeToeButton = this.buttonFor("Voeg voorwaarde toe", "Voorwaarden", "h2");
        this.titelVoorwaardeInput = (order: number = 0) => this.inputBelow('Titel voorwaarde').nth(order);
        this.titelVoorwaardeConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel voorwaarde'), order);
        this.beschrijvingVoorwaardeEditor = (order: number = 0) => this.editorBelow('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving voorwaarde'), order);
        this.verwijderVoorwaardeButton = (order: number = 0) => this.buttonFor('Verwijder voorwaarde', 'Voorwaarden', "h2").nth(order);

        this.voegBewijsstukToeButton = (order: number = 0) => this.buttonFor('Voeg bewijsstuk toe', 'Voorwaarden', "h2").nth(order);
        this.titelBewijsstukInput = (order: number = 0) => this.inputBelow('Titel bewijsstuk').nth(order);
        this.titelBewijsstukConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel bewijsstuk'), order);
        this.beschrijvingBewijsstukEditor = (order: number = 0) => this.editorBelow('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving bewijsstuk'), order);
        this.verwijderBewijsButton = (order: number = 0) => this.buttonFor('Verwijder bewijsstuk', 'Voorwaarden', "h2").nth(order);

        this.voegProcedureToeButton = this.buttonFor('Voeg procedure toe', 'Procedure', "h2");
        this.titelProcedureInput = (order: number = 0) => this.inputBelow('Titel procedure').nth(order);
        this.titelProcedureConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel procedure'), order);
        this.beschrijvingProcedureEditor = (order: number = 0) => this.editorBelow('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving procedure'), order);
        this.verwijderProcedureButton = (order: number = 0) => this.buttonFor('Verwijder procedure', 'Procedure', "h2").nth(order);

        this.voegWebsiteToeButtonVoorProcedure = (order: number = 0) => this.buttonFor('Voeg website toe', 'Procedure', "h2").nth(order);
        this.titelWebsiteVoorProcedureInput = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Titel website'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.titelWebsiteVoorProcedureConceptWijzigingenOvernemenLink = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.conceptWijzigingenOvernemenLinkNextTo('Titel website'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEditor = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.editorBelow('Beschrijving website'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.beschrijvingWebsiteVoorProcedureReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.readonlyBelow('Beschrijving website'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.beschrijvingWebsiteVoorProcedureConceptWijzigingenOvernemenLink = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.conceptWijzigingenOvernemenLinkNextTo('Beschrijving website'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.websiteURLVoorProcedureInput = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Website URL'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.websiteURLVoorProcedureConceptWijzigingenOvernemenLink = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.conceptWijzigingenOvernemenLinkNextTo('Website URL'), childOrder, 'Website procedure', 'h3', parentOrder);
        this.verwijderWebsiteButtonVoorProcedure = (order: number = 0) => this.buttonFor('Verwijder website', 'Procedure', "h2").nth(order);

        this.voegKostToeButton = this.buttonFor("Voeg kost toe", "Kosten", "h2");    
        this.verwijderKostButton = (order: number = 0) => this.buttonFor('Verwijder kost', 'Kosten', "h2").nth(order);
        this.hetAantalKostenIsGewijzigdPill = this.page.getByText('Het aantal kosten is gewijzigd');
        this.titelKostInput = (order: number = 0) => this.inputBelow('Titel kost').nth(order);
        this.titelKostConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel kost'), order);
        this.beschrijvingKostEditor = (order: number = 0) => this.editorBelow('Beschrijving kost').nth(order);
        this.beschrijvingKostReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving kost').nth(order);
        this.beschrijvingKostConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving kost'), order);

        this.voegFinancieelVoordeelToeButton = this.buttonFor('Voeg financieel voordeel toe', 'Financiële voordelen', "h2");
        this.verwijderFinancieelVoordeelButton = (order: number = 0) => this.buttonFor('Verwijder financieel voordeel', 'Financiële voordelen', "h2").nth(order);
        this.titelFinancieelVoordeelInput = (order: number = 0) => this.inputBelow('Titel financieel voordeel').nth(order);
        this.titelFinancieelVoordeelConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel financieel voordeel'), order);
        this.beschrijvingFinancieelVoordeelEditor = (order: number = 0) => this.editorBelow('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving financieel voordeel'), order);

        this.beschrijvingRegelgevingEditor = (order: number = 0) => this.editorBelow('Regelgeving').nth(order);
        this.beschrijvingRegelgevingReadonly = (order: number = 0) => this.readonlyBelow('Regelgeving').nth(order);
        this.beschrijvingRegelgevingConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Regelgeving'), order);

        this.voegRegelgevendeBronToeButton = page.getByRole('button', { name: 'Voeg regelgevende bron toe' });
        this.verwijderRegelgevendeBronButton = (order: number = 0) => this.buttonFor('Verwijder regelgevende bron', 'Regelgeving', "h1").nth(order);
        this.titelRegelgevendeBronInput = (order: number = 0) => this.inputBelow('Titel regelgevende bron').nth(order);
        this.titelRegelgevendeBronConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Titel regelgevende bron'), order);
        this.beschrijvingRegelgevendeBronEditor = (order: number = 0) => this.editorBelow('Beschrijving regelgevende bron').nth(order);
        this.beschrijvingRegelgevendeBronReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving regelgevende bron').nth(order);
        this.beschrijvingRegelgevendeBronConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.editorBelowLocator('Beschrijving regelgevende bron'), order);
        this.regelgevendeBronUrlInput = (order: number = 0) => this.inputBelow('URL regelgevende bron').nth(order);
        this.regelgevendeBronUrlConceptWijzigingenOvernemenLink = (order: number = 0) => this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('URL regelgevende bron'), order);

        this.voegContactpuntToeButton = page.getByRole('button', { name: 'Voeg contactpunt toe' });
        this.verwijderContactpuntButton = (order: number = 0) => this.buttonFor('Verwijder contactpunt', 'Contactpunten', "h1").nth(order);
        this.contactpuntHeading = page.getByRole('heading', { name: 'Contactpunt', exact: true });
        this.contactpuntEmailSelect = (order: number = 0) => new SelectWithCreate(page, 'Email', order);
        this.contactpuntEmailReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Email'), childOrder, 'Contactpunt', 'h2', parentOrder);
        this.contactpuntTelefoonSelect = (order: number = 0) => new SelectWithCreate(page, 'Telefoon', order);
        this.contactpuntTelefoonReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Telefoon'), childOrder, 'Contactpunt', 'h2', parentOrder);
        this.contactpuntWebsiteURLSelect = (order: number = 0) => new SelectWithCreate(page, 'Website URL', order);
        this.contactpuntWebsiteURLReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Website URL'), childOrder, 'Contactpunt', 'h2', parentOrder);
        this.contactpuntOpeningsurenSelect = (order: number = 0) => new SelectWithCreate(page, 'Openingsuren', order);
        this.contactpuntOpeningsurenReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Openingsuren'), childOrder, 'Contactpunt', 'h2', parentOrder);

        this.voegAdresToeButton = (order: number = 0) => page.getByRole('button', { name: 'Voeg adres toe' }).nth(order);
        this.verwijderAdresButton = (order: number = 0) => this.buttonFor('Verwijder adres', 'Contactpunten', "h1").nth(order);
        this.contactpuntAdresGemeenteSelect = (order: number = 0) => new Select(page, 'Gemeente', 'Adres', order + 1);
        this.contactpuntAdresStraatSelect = (order: number = 0) => new Select(page, 'Straat', 'Adres', order + 1);
        this.contactpuntAdresHuisnummerInput = (order: number = 0) => this.inputBelow('Huisnummer').nth(order);
        this.contactpuntAdresBusnummerInput = (order: number = 0) => this.inputBelow('Bus').nth(order);
        this.contactpuntAdresValidatie = (order: number = 0) => page.getByRole('alert').nth(order);

        this.voegWebsiteToeButton = this.buttonFor('Voeg website toe', 'Meer info', "h2");
        this.verwijderWebsiteButton = (order: number = 0) => this.buttonFor('Verwijder website', 'Meer info', "h2").nth(order);
        this.hetAantalWebsitesIsGewijzigdPill = this.page.getByText('Het aantal websites is gewijzigd');
        this.titelWebsiteInput = (order: number = 0) => page.locator(`input:below(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).nth(order);
        this.titelWebsiteConceptWijzigingenOvernemenLink = (order: number = 0) => this.page.locator(`a:has-text('ConceptWijzigingen overnemen'):above(:nth-match(input:below(label:text-is('Titel website'):below(h2:text-is('Gegevens website'))), ${order + 1}), 75)`).first();
        this.beschrijvingWebsiteEditor = (order: number = 0) => page.locator(`div.ProseMirror:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(order);
        this.beschrijvingWebsiteReadonly = (order: number = 0) => page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(order);
        this.beschrijvingWebsiteConceptWijzigingenOvernemenLink = (order: number = 0) => this.page.locator(`a:has-text('ConceptWijzigingen overnemen'):above(:nth-match(div.ProseMirror:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website'))), ${order + 1}), 75)`).first();
        this.websiteURLInput = (order: number = 0) => page.locator(`input:below(label:text-is('Website URL'):below(h2:text-is('Gegevens website')))`).nth(order);
        this.websiteURLConceptWijzigingenOvernemenLink = (order: number = 0) => this.page.locator(`a:has-text('ConceptWijzigingen overnemen'):above(:nth-match(input:below(label:text-is('Website URL'):below(h2:text-is('Gegevens website'))), 1), 75)`).nth(order);

        this.algemeneInfoHeading = page.getByRole('heading', { name: 'Algemene info' });

        this.productOfDienstGeldigVanafInput = this.inputBelow('Product of dienst geldig vanaf').first();
        this.productOfDienstGeldigVanafConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Product of dienst geldig vanaf'));
        this.productOfDienstGeldigTotInput = this.inputBelow('Product of dienst geldig tot').first();
        this.productOfDienstGeldigTotConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.inputBelowLocator('Product of dienst geldig tot'));
        this.productTypeSelect = new Select(page, 'Product type');
        this.productTypeConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.productTypeSelect.selectDivLocatorString);
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
        this.doelgroepenConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.doelgroepenMultiSelect.selectDivLocatorString);
        this.themasMultiSelect = new MultiSelect(page, `Thema\\\'s`);
        this.themasConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.themasMultiSelect.selectDivLocatorString);
        this.talenMultiSelect = new MultiSelect(page, 'Talen');

        this.bevoegdBestuursniveauMultiSelect = new MultiSelect(page, 'Bevoegd bestuursniveau');
        this.bevoegdBestuursniveauConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.bevoegdBestuursniveauMultiSelect.selectDivLocatorString);
        this.bevoegdeOverheidMultiSelect = new MultiSelect(page, 'Bevoegde overheid');
        this.bevoegdeOverheidConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.bevoegdeOverheidMultiSelect.selectDivLocatorString);
        this.uitvoerendBestuursniveauMultiSelect = new MultiSelect(page, 'Uitvoerend bestuursniveau');
        this.uitvoerendBestuursniveauConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.uitvoerendBestuursniveauMultiSelect.selectDivLocatorString);
        this.uitvoerendeOverheidMultiSelect = new MultiSelect(page, 'Uitvoerende overheid');
        this.uitvoerendeOverheidConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.uitvoerendeOverheidMultiSelect.selectDivLocatorString);
        this.geografischToepassingsgebiedMultiSelect = new MultiSelect(page, 'Geografisch toepassingsgebied');

        this.tagsMultiSelect = new MultiSelect(page, "Tags");
        this.tagsConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.tagsMultiSelect.selectDivLocatorString);
        this.publicatieKanalenMultiSelect = new MultiSelect(page, "Publicatiekanalen");
        this.publicatieKanalenConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.publicatieKanalenMultiSelect.selectDivLocatorString);
        this.categorieenYourEuropeMultiSelect = new MultiSelect(page, "Categorieën Your Europe");
        this.categorieenYourEuropeConceptWijzigingenOvernemenLink = this.conceptWijzigingenOvernemenLinkAbove(this.categorieenYourEuropeMultiSelect.selectDivLocatorString);

        this.verzendNaarVlaamseOverheidButton = page.getByRole('button', { name: 'Verzend naar Vlaamse overheid' });
        this.wijzigingenBewarenButton = page.getByRole('button', { name: 'Wijzigingen bewaren' });
        this.terugNaarHetOverzichtButton = page.getByRole('link', { name: 'Lokale Producten- en Dienstencatalogus' });
        this.productOpnieuwBewerkenButton = page.getByRole('button', { name: 'Product opnieuw bewerken' });
        this.productVerwijderenButton = page.getByRole('button', { name: 'Product verwijderen' });
    }

    static create(page: Page): InstantieDetailsPage {
        return new InstantieDetailsPage(page);
    }

    async expectToBeVisible() {
        await expect(this.menuHeader).toBeVisible();
    }

    private inputBelow(label: string): Locator {
        return this.page.locator(this.inputBelowLocator(label));
    }

    private inputBelowLocator(label: string): string {
        return `input:below(label:text-is('${label}'))`;
    }

    private conceptWijzigingenOvernemenLinkNextTo(label: string): Locator {
        return this.page.locator(`a:has-text('ConceptWijzigingen overnemen'):right-of(label:text-is('${label}'))`);
    }

    private conceptWijzigingenOvernemenLinkAbove(locatorString: string, order: number = 0): Locator {
        return this.page.locator(`a:has-text('ConceptWijzigingen overnemen'):above(:nth-match(${locatorString}, ${order + 1}), 75)`).first();
    }

    private editorBelow(label: string): Locator {
        return this.page.locator(this.editorBelowLocator(label));
    }

    private editorBelowLocator(label: string): string {
        return `div.ProseMirror:below(label:text-is('${label}'))`;
    }

    private readonlyBelow(label: string): Locator {
        return this.page.locator(`div.rich-text-editor-content:below(label:text-is('${label}'))`);
    }

    private buttonFor(button: string, header: string, parentHeader: string): Locator {
        return this.page.locator(`button:text-is('${button}'):below(${parentHeader}:text-is('${header}'))`);
    }

    private nestedLocator(childLocator: Locator, childOrder: number, parentLocator: string, parentHeader: string, parentOrder: number): Locator {
        return this.page.locator(`:below(:nth-match(${parentHeader}:text-is('${parentLocator}'), ${parentOrder + 1}))`).locator(childLocator.nth(childOrder));
    }

}
