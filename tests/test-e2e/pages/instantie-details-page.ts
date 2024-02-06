import {expect, Locator, Page} from "@playwright/test";
import {AbstractPage} from "./abstract-page";
import {MultiSelect} from "../components/multi-select";
import {Select} from "../components/select";
import {SelectWithCreate} from "../components/select-with-create";

export class InstantieDetailsPage extends AbstractPage {

    private readonly menuHeader: Locator;
    readonly heading: Locator;

    readonly inhoudTab: Locator;
    readonly eigenschappenTab: Locator;

    readonly titelHeading: Locator;

    readonly koppelConceptLink: Locator;
    readonly conceptLoskoppelenButton: Locator;
    readonly gekoppeldConceptLink: Locator;

    readonly instantieLoskoppelenAlert: Locator;
    readonly instantieLoskoppelenAlertLoskoppelenButton: Locator;

    readonly aangemaaktOpHeader: Locator;
    readonly bewerktOpHeader: Locator;
    readonly statusDocumentHeader: Locator;

    readonly herzieningNodigAlert: Locator;
    readonly herzieningNodigAlertConceptBekijken: Locator;
    readonly herzieningNodigAlertGeenAanpassigenNodig: Locator;

    readonly conceptGearchiveerdAlert: Locator; 
    readonly conceptGearchiveerdAlertConceptBekijken: Locator;
    readonly conceptGearchiveerdAlertGeenAanpassigenNodig: Locator;

    readonly titelInput: Locator;
    readonly titelEngelsInput: Locator;
    readonly beschrijvingEditor: Locator;
    readonly beschrijvingEngelsEditor: Locator;
    readonly beschrijvingReadonly: Locator;
    readonly beschrijvingEngelsReadonly: Locator;

    readonly aanvullendeBeschrijvingEditor: Locator;
    readonly aanvullendeBeschrijvingReadonly: Locator;
    readonly aanvullendeBeschrijvingEngelsEditor: Locator;
    readonly aanvullendeBeschrijvingEngelsReadonly: Locator;

    readonly uitzonderingenEditor: Locator;
    readonly uitzonderingenEngelsEditor: Locator;
    readonly uitzonderingenReadonly: Locator;
    readonly uitzonderingenEngelsReadonly: Locator;

    readonly voegVoorwaardeToeButton: Locator;
    readonly titelVoorwaardeInput: (order?: number) => Locator;
    readonly titelVoorwaardeEngelsInput: (order?: number) => Locator;
    readonly beschrijvingVoorwaardeEditor: (order?: number) => Locator;
    readonly beschrijvingVoorwaardeEngelsEditor: (order?: number) => Locator;
    readonly beschrijvingVoorwaardeReadonly: (order?: number) => Locator;
    readonly beschrijvingVoorwaardeEngelsReadonly: (order?: number) => Locator;
    readonly verwijderVoorwaardeButton: (order?: number) => Locator;

    readonly voegBewijsstukToeButton: (order?: number) => Locator;
    readonly titelBewijsstukInput: (order?: number) => Locator;
    readonly titelBewijsstukEngelsInput: (order?: number) => Locator;
    readonly beschrijvingBewijsstukEditor: (order?: number) => Locator;
    readonly beschrijvingBewijsstukEngelsEditor: (order?: number) => Locator;
    readonly beschrijvingBewijsstukReadonly: (order?: number) => Locator;
    readonly beschrijvingBewijsstukEngelsReadonly: (order?: number) => Locator;
    readonly verwijderBewijsButton: (order?: number) => Locator;

    readonly voegProcedureToeButton: Locator;
    readonly titelProcedureInput: (order?: number) => Locator;
    readonly titelProcedureEngelsInput: (order?: number) => Locator;
    readonly beschrijvingProcedureEditor: (order?: number) => Locator;
    readonly beschrijvingProcedureEngelsEditor: (order?: number) => Locator;
    readonly beschrijvingProcedureReadonly: (order?: number) => Locator;
    readonly beschrijvingProcedureEngelsReadonly: (order?: number) => Locator;
    readonly verwijderProcedureButton: (order?: number) => Locator;

    readonly voegWebsiteToeButtonVoorProcedure: (order?: number) => Locator;
    readonly titelWebsiteVoorProcedureInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly titelWebsiteVoorProcedureEngelsInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureEditor: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureEngelsEditor: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteVoorProcedureEngelsReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly websiteURLVoorProcedureInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly verwijderWebsiteButtonVoorProcedure: (order?: number) => Locator;

    readonly voegKostToeButton: Locator;
    readonly verwijderKostButton:(order?: number) => Locator;
    readonly titelKostInput: (order?: number) => Locator;
    readonly titelKostEngelsInput: (order?: number) => Locator;
    readonly beschrijvingKostEditor: (order?: number) => Locator;
    readonly beschrijvingKostReadonly: (order?: number) => Locator;
    readonly beschrijvingKostEngelsEditor: (order?: number) => Locator;
    readonly beschrijvingKostEngelsReadonly: (order?: number) => Locator;

    readonly voegFinancieelVoordeelToeButton: Locator;
    readonly verwijderFinancieelVoordeelButton: (order?: number) => Locator;
    readonly titelFinancieelVoordeelInput: (order?: number) => Locator;
    readonly titelFinancieelVoordeelEngelsInput: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEditor: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelReadonly: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEngelsEditor: (order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEngelsReadonly: (order?: number) => Locator;

    readonly beschrijvingRegelgevingEditor: (order?: number) => Locator;
    readonly beschrijvingRegelgevingReadonly: (order?: number) => Locator;
    readonly beschrijvingRegelgevingEngelsEditor: (order?: number) => Locator;
    readonly beschrijvingRegelgevingEngelsReadonly: (order?: number) => Locator;

    readonly contactpuntHeading: Locator;
    readonly voegContactpuntToeButton: Locator;
    readonly verwijderContactpuntButton:(order?: number) => Locator;
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
    readonly titelWebsiteInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly titelWebsiteEngelsInput: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteEditor: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteEngelsEditor: (childOrder?: number, parentOrder?: number) => Locator;
    readonly beschrijvingWebsiteEngelsReadonly: (childOrder?: number, parentOrder?: number) => Locator;
    readonly websiteURLInput: (childOrder?: number, parentOrder?: number) => Locator;


    //Eigenschappen
    readonly algemeneInfoHeading: Locator;

    readonly productOfDienstGeldigVanafInput: Locator;
    readonly productOfDienstGeldigTotInput: Locator;
    readonly productTypeSelect: Select;
    readonly doelgroepenMultiSelect: MultiSelect;
    readonly themasMultiSelect: MultiSelect;

    readonly bevoegdBestuursniveauMultiSelect: MultiSelect;
    readonly bevoegdeOverheidMultiSelect: MultiSelect;
    readonly uitvoerendBestuursniveauMultiSelect: MultiSelect;
    readonly uitvoerendeOverheidMultiSelect: MultiSelect;
    readonly geografischToepassingsgebiedMultiSelect: MultiSelect;

    readonly tagsMultiSelect: MultiSelect;
    readonly publicatieKanalenMultiSelect: MultiSelect;
    readonly categorieenYourEuropeMultiSelect: MultiSelect;

    readonly verzendNaarVlaamseOverheidButton: Locator;
    readonly wijzigingenBewarenButton: Locator;
    readonly terugNaarHetOverzichtButton: Locator;
    readonly productOpnieuwBewerkenButton: Locator;
    readonly productVerwijderenButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', {name: 'Details'});
        this.heading = page.getByRole('heading').first();

        this.inhoudTab = page.getByRole('link', {name: 'Inhoud', exact: true})
        this.eigenschappenTab = page.getByRole('link', {name: 'Eigenschappen', exact: true});

        this.titelHeading = page.getByRole('heading', {name: 'Titel', exact: true});

        this.koppelConceptLink = page.getByRole('link', {name: 'Koppelen'});
        this.gekoppeldConceptLink = page.locator('a:left-of(button:has-text("Loskoppelen"))').first();
        this.conceptLoskoppelenButton = page.getByRole('button', {name: 'Loskoppelen'});

        this.instantieLoskoppelenAlert = page.getByRole('alert').locator('.au-c-alert__title:has-text("Instantie loskoppelen van het concept")');
        this.instantieLoskoppelenAlertLoskoppelenButton = page.locator('[role="alert"]:has-text("Instantie loskoppelen van het concept") button:has-text("Loskoppelen")');

        this.herzieningNodigAlert = page.getByRole('alert').locator('.au-c-alert__title:has-text("Herziening nodig")');
        this.herzieningNodigAlertConceptBekijken = page.locator('[role="alert"]:has-text("Herziening nodig") a:has-text("Concept bekijken")');
        this.herzieningNodigAlertGeenAanpassigenNodig = page.locator('[role="alert"]:has-text("Herziening nodig") button:has-text("Geen aanpassingen nodig")');

        this.conceptGearchiveerdAlert = page.getByRole('alert').locator('.au-c-alert__title:has-text("Concept gearchiveerd")');
        this.conceptGearchiveerdAlertConceptBekijken = page.locator('[role="alert"]:has-text("Concept gearchiveerd") a:has-text("Concept bekijken")');
        this.conceptGearchiveerdAlertGeenAanpassigenNodig = page.locator('[role="alert"]:has-text("Concept gearchiveerd") button:has-text("Geen aanpassingen nodig")')

        this.aangemaaktOpHeader = page.locator('dl div').filter({ hasText: 'Aangemaakt op' }).getByRole('definition');
        this.bewerktOpHeader = page.locator('dl div').filter({ hasText: 'Bewerkt op' }).getByRole('definition');
        this.statusDocumentHeader = page.locator('dl div').filter({ hasText: 'Status document' }).getByRole('definition');

        this.titelInput = this.inputBelow('Titel').first();
        this.titelEngelsInput = this.inputRightOf('Titel').first()
        this.beschrijvingEditor = this.editorBelow('Beschrijving').first();
        this.beschrijvingEngelsEditor = this.editorRightOf('Beschrijving').first()
        this.beschrijvingReadonly = this.readonlyBelow('Beschrijving').first();
        this.beschrijvingEngelsReadonly = this.readonlyRightOf('Beschrijving').first();

        this.aanvullendeBeschrijvingEditor = this.editorBelow('Aanvullende Beschrijving').first();
        this.aanvullendeBeschrijvingEngelsEditor = this.editorRightOf('Aanvullende Beschrijving').first();
        this.aanvullendeBeschrijvingReadonly = this.readonlyBelow('Aanvullende Beschrijving').first();
        this.aanvullendeBeschrijvingEngelsReadonly = this.readonlyRightOf('Aanvullende Beschrijving').first();

        this.uitzonderingenEditor = this.editorBelow('Uitzonderingen').first();
        this.uitzonderingenEngelsEditor = this.editorRightOf('Uitzonderingen').first();
        this.uitzonderingenReadonly = this.readonlyBelow('Uitzonderingen').first();
        this.uitzonderingenEngelsReadonly = this.readonlyRightOf('Uitzonderingen').first();

        this.voegVoorwaardeToeButton = this.buttonFor("Voeg voorwaarde toe","Voorwaarden");
        this.titelVoorwaardeInput = (order: number = 0) => this.inputBelow('Titel voorwaarde').nth(order);
        this.titelVoorwaardeEngelsInput = (order: number = 0) => this.inputRightOf('Titel voorwaarde').nth(order);
        this.beschrijvingVoorwaardeEditor = (order: number = 0) => this.editorBelow('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving voorwaarde').nth(order);
        this.verwijderVoorwaardeButton = (order: number = 0) => this.buttonFor('Verwijder voorwaarde','Voorwaarden').nth(order);

        this.voegBewijsstukToeButton = (order: number = 0) => this.buttonFor('Voeg bewijsstuk toe', 'Voorwaarden').nth(order);
        this.titelBewijsstukInput = (order: number = 0) => this.inputBelow('Titel bewijsstuk').nth(order);
        this.titelBewijsstukEngelsInput = (order: number = 0) => this.inputRightOf('Titel bewijsstuk').nth(order);
        this.beschrijvingBewijsstukEditor = (order: number = 0) => this.editorBelow('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving bewijsstuk').nth(order);
        this.verwijderBewijsButton = (order: number = 0) => this.buttonFor('Verwijder bewijsstuk', 'Voorwaarden').nth(order);

        this.voegProcedureToeButton = this.buttonFor('Voeg procedure toe', 'Procedure');
        this.titelProcedureInput = (order: number = 0) => this.inputBelow('Titel procedure').nth(order);
        this.titelProcedureEngelsInput = (order: number = 0) => this.inputRightOf('Titel procedure').nth(order);
        this.beschrijvingProcedureEditor = (order: number = 0) => this.editorBelow('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving procedure').nth(order);
        this.verwijderProcedureButton = (order: number = 0) => this.buttonFor('Verwijder procedure','Procedure').nth(order);

        this.voegWebsiteToeButtonVoorProcedure = (order: number = 0) => this.buttonFor('Voeg website toe','Procedure').nth(order);
        this.titelWebsiteVoorProcedureInput = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Titel website'), childOrder, 'Website procedure', parentOrder);
        this.titelWebsiteVoorProcedureEngelsInput = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputRightOf('Titel website'), childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEditor = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.editorBelow('Beschrijving website'), childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.readonlyBelow('Beschrijving website'), childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEngelsEditor = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.editorRightOf('Beschrijving website'), childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEngelsReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.readonlyRightOf('Beschrijving website'), childOrder, 'Website procedure', parentOrder);
        this.websiteURLVoorProcedureInput = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Website URL'), childOrder, 'Website procedure', parentOrder);
        this.verwijderWebsiteButtonVoorProcedure = (order: number = 0) => this.buttonFor('Verwijder website','Procedure').nth(order);

        this.voegKostToeButton = this.buttonFor("Voeg kost toe","Kosten");
        this.verwijderKostButton = (order: number = 0) => this.buttonFor('Verwijder kost','Kosten').nth(order);
        this.titelKostInput = (order: number = 0) => this.inputBelow('Titel kost').nth(order);
        this.titelKostEngelsInput = (order: number = 0) => this.inputRightOf('Titel kost').nth(order);
        this.beschrijvingKostEditor = (order: number = 0) => this.editorBelow('Beschrijving kost').nth(order);
        this.beschrijvingKostReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving kost').nth(order);
        this.beschrijvingKostEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving kost').nth(order);
        this.beschrijvingKostEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving kost').nth(order);

        this.voegFinancieelVoordeelToeButton = this.buttonFor('Voeg financieel voordeel toe', 'Financiële Voordelen');
        this.verwijderFinancieelVoordeelButton = (order: number = 0) => this.buttonFor('Verwijder financieel voordeel','Financiële Voordelen').nth(order);
        this.titelFinancieelVoordeelInput = (order: number = 0) => this.inputBelow('Titel financieel voordeel').nth(order);
        this.titelFinancieelVoordeelEngelsInput = (order: number = 0) => this.inputRightOf('Titel financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelEditor = (order: number = 0) => this.editorBelow('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving financieel voordeel').nth(order);

        this.beschrijvingRegelgevingEditor = (order: number = 0) => this.editorBelow('Regelgeving').nth(order);
        this.beschrijvingRegelgevingReadonly = (order: number = 0) => this.readonlyBelow('Regelgeving').nth(order);
        this.beschrijvingRegelgevingEngelsEditor = (order: number = 0) => this.editorRightOf('Regelgeving').nth(order);
        this.beschrijvingRegelgevingEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Regelgeving').nth(order);

        this.voegContactpuntToeButton = page.getByRole('button', {name: 'Voeg contactpunt toe'});
        this.verwijderContactpuntButton = (order: number = 0) => this.buttonFor('Verwijder contactpunt','Contactpunten').nth(order);
        this.contactpuntHeading = page.getByRole('heading', {name: 'Contactpunt', exact: true});
        this.contactpuntEmailSelect = (order: number = 0) => new SelectWithCreate(page, 'Email', order);
        this.contactpuntEmailReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Email'), childOrder, 'Contactpunt', parentOrder);
        this.contactpuntTelefoonSelect = (order: number = 0) => new SelectWithCreate(page, 'Telefoon', order);
        this.contactpuntTelefoonReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Telefoon'), childOrder, 'Contactpunt', parentOrder);
        this.contactpuntWebsiteURLSelect = (order: number = 0) => new SelectWithCreate(page, 'Website URL', order);
        this.contactpuntWebsiteURLReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Website URL'), childOrder, 'Contactpunt', parentOrder);
        this.contactpuntOpeningsurenSelect = (order: number = 0) => new SelectWithCreate(page, 'Openingsuren', order);
        this.contactpuntOpeningsurenReadonly = (childOrder: number = 0, parentOrder: number = 0) => this.nestedLocator(this.inputBelow('Openingsuren'), childOrder, 'Contactpunt', parentOrder);

        this.voegAdresToeButton = (order: number = 0) => page.getByRole('button', {name: 'Voeg adres toe'}).nth(order);
        this.verwijderAdresButton = (order: number = 0) => this.buttonFor('Verwijder adres','Contactpunten').nth(order);
        this.contactpuntAdresGemeenteSelect = (order: number = 0) => new Select(page, 'Gemeente', 'Adres', order + 1);
        this.contactpuntAdresStraatSelect = (order: number = 0) => new Select(page, 'Straat', 'Adres', order + 1);
        this.contactpuntAdresHuisnummerInput = (order: number = 0) => this.inputBelow('Huisnummer').nth(order);
        this.contactpuntAdresBusnummerInput = (order: number = 0) => this.inputBelow('Bus').nth(order);
        this.contactpuntAdresValidatie = (order: number = 0) => page.getByRole('alert').nth(order);

        this.voegWebsiteToeButton = this.buttonFor('Voeg website toe', 'Meer info');
        this.verwijderWebsiteButton = (order: number = 0) => this.buttonFor('Verwijder website','Meer info').nth(order);
        this.titelWebsiteInput = (order: number = 0) => page.locator(`input:below(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).nth(order)
        this.titelWebsiteEngelsInput = (order: number = 0) => page.locator(`input:right-of(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).nth(order)
        this.beschrijvingWebsiteEditor = (order: number = 0) => page.locator(`div.ProseMirror:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(order)
        this.beschrijvingWebsiteReadonly = (order: number = 0) => page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(order)
        this.beschrijvingWebsiteEngelsEditor = (order: number = 0) => page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(order)
        this.beschrijvingWebsiteEngelsReadonly = (order: number = 0) => page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(order)
        this.websiteURLInput = (order: number = 0) => page.locator(`input:below(label:text-is('Website URL'):below(h2:text-is('Gegevens website')))`).nth(order)

        this.algemeneInfoHeading = page.getByRole('heading', {name: 'Algemene info'});

        this.productOfDienstGeldigVanafInput = this.inputBelow('Product of dienst geldig vanaf').first();
        this.productOfDienstGeldigTotInput = this.inputBelow('Product of dienst geldig tot').first();
        this.productTypeSelect = new Select(page, 'Product type');
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
        this.themasMultiSelect = new MultiSelect(page, `Thema\\\'s`);

        this.bevoegdBestuursniveauMultiSelect = new MultiSelect(page, 'Bevoegd bestuursniveau');
        this.bevoegdeOverheidMultiSelect = new MultiSelect(page, 'Bevoegde overheid');
        this.uitvoerendBestuursniveauMultiSelect = new MultiSelect(page, 'Uitvoerend bestuursniveau');
        this.uitvoerendeOverheidMultiSelect = new MultiSelect(page, 'Uitvoerende overheid');
        this.geografischToepassingsgebiedMultiSelect = new MultiSelect(page, 'Geografisch toepassingsgebied');

        this.tagsMultiSelect = new MultiSelect(page, "Tags");
        this.publicatieKanalenMultiSelect = new MultiSelect(page, "Publicatiekanalen");
        this.categorieenYourEuropeMultiSelect = new MultiSelect(page, "Categorieën Your Europe");

        this.verzendNaarVlaamseOverheidButton = page.getByRole('button', {name: 'Verzend naar Vlaamse overheid'});
        this.wijzigingenBewarenButton = page.getByRole('button', {name: 'Wijzigingen bewaren'});
        this.terugNaarHetOverzichtButton = page.getByRole('link', {name: 'Terug naar het overzicht'});
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
        return this.page.locator(`input:below(label:text-is('${label}'))`)
    }

    private inputRightOf(label: string): Locator {
        return this.page.locator(`input:right-of(label:text-is('${label}'))`);
    }

    private editorBelow(label: string): Locator {
        return this.page.locator(`div.ProseMirror:below(label:text-is('${label}'))`);
    }

    private readonlyBelow(label: string): Locator {
        return this.page.locator(`div.rich-text-editor-content:below(label:text-is('${label}'))`);
    }

    private editorRightOf(label: string): Locator {
        return this.page.locator(`div.ProseMirror:right-of(label:text-is('${label}'))`);
    }

    private readonlyRightOf(label: string): Locator {
        return this.page.locator(`div.rich-text-editor-content:right-of(label:text-is('${label}'))`);
    }

    private buttonFor(button: string, header:string): Locator {
       return this.page.locator(`button:text-is('${button}'):below(h1:text-is('${header}'))`);
    }

    private nestedLocator(childLocator: Locator, childOrder: number, parentLocator: string, parentOrder: number): Locator {
        return this.page.locator(`:below(:nth-match(h2:text-is('${parentLocator}'), ${parentOrder + 1}))`).locator(childLocator.nth(childOrder));
    }

}