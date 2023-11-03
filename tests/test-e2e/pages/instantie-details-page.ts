import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { MultiSelect } from "../components/multi-select";
import { Select } from "../components/select";
import {SelectWithCreate} from "../components/select-with-create";

export class InstantieDetailsPage extends AbstractPage {

    private readonly menuHeader: Locator;
    readonly heading: Locator;

    readonly inhoudTab: Locator;
    readonly eigenschappenTab: Locator;

    readonly titelHeading: Locator;

    readonly herzieningNodigAlert: Locator;
    readonly herzieningNodigAlertGeenAanpassigenNodig: Locator;

    readonly conceptGearchiveerdAlert: Locator;
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

    readonly titelVoorwaardeInput: (order?: number) => Locator;
    readonly titelVoorwaardeEngelsInput:(order?: number) => Locator;
    readonly beschrijvingVoorwaardeEditor:(order?: number) => Locator;
    readonly beschrijvingVoorwaardeEngelsEditor:(order?: number) => Locator;
    readonly beschrijvingVoorwaardeReadonly:(order?: number) => Locator;
    readonly beschrijvingVoorwaardeEngelsReadonly:(order?: number) => Locator;

    readonly titelBewijsstukInput:(order?: number) => Locator;
    readonly titelBewijsstukEngelsInput:(order?: number) => Locator;

    readonly beschrijvingBewijsstukEditor:(order?: number) => Locator;
    readonly beschrijvingBewijsstukEngelsEditor:(order?: number) => Locator;
    readonly beschrijvingBewijsstukReadonly:(order?: number) => Locator;
    readonly beschrijvingBewijsstukEngelsReadonly:(order?: number) => Locator;

    readonly titelProcedureInput:(order?: number) => Locator;
    readonly titelProcedureEngelsInput:(order?: number) => Locator;
    readonly beschrijvingProcedureEditor:(order?: number) => Locator;
    readonly beschrijvingProcedureEngelsEditor:(order?: number) => Locator;
    readonly beschrijvingProcedureReadonly:(order?: number) => Locator;
    readonly beschrijvingProcedureEngelsReadonly:(order?: number) => Locator;

    readonly titelWebsiteVoorProcedureInput:(childOrder?: number, parentOrder?: number) => Locator;
    readonly titelWebsiteVoorProcedureEngelsInput:(childOrder?: number, parentOrder?: number)=> Locator;
    readonly beschrijvingWebsiteVoorProcedureEditor:(childOrder?: number, parentOrder?: number)=> Locator;
    readonly beschrijvingWebsiteVoorProcedureReadonly:(childOrder?: number, parentOrder?: number)=> Locator;
    readonly beschrijvingWebsiteVoorProcedureEngelsEditor:(childOrder?: number, parentOrder?: number)=> Locator;
    readonly beschrijvingWebsiteVoorProcedureEngelsReadonly:(childOrder?: number, parentOrder?: number)=> Locator;
    readonly websiteURLVoorProcedureInput:(childOrder?: number, parentOrder?: number)=> Locator;

    readonly titelKostInput:(order?: number) => Locator;
    readonly titelKostEngelsInput:(order?: number) => Locator;
    readonly beschrijvingKostEditor:(order?: number) => Locator;
    readonly beschrijvingKostReadonly:(order?: number) => Locator;
    readonly beschrijvingKostEngelsEditor:(order?: number) => Locator;
    readonly beschrijvingKostEngelsReadonly:(order?: number) => Locator;

    readonly titelFinancieelVoordeelInput:(order?: number) => Locator;
    readonly titelFinancieelVoordeelEngelsInput:(order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEditor:(order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelReadonly:(order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEngelsEditor:(order?: number) => Locator;
    readonly beschrijvingFinancieelVoordeelEngelsReadonly:(order?: number) => Locator;

    readonly beschrijvingRegelgevingEditor:(order?: number) => Locator;
    readonly beschrijvingRegelgevingReadonly:(order?: number) => Locator;
    readonly beschrijvingRegelgevingEngelsEditor:(order?: number) => Locator;
    readonly beschrijvingRegelgevingEngelsReadonly:(order?: number) => Locator;

    readonly voegContactpuntToeButton: Locator;
    readonly contactpuntHeading: Locator;
    readonly contactpuntEmailSelect:(order?: number)=> SelectWithCreate;
    readonly contactpuntEmailReadonly:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly contactpuntTelefoonSelect:(order?: number)=> SelectWithCreate;
    readonly contactpuntTelefoonReadonly:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly contactpuntWebsiteURLSelect:(order?: number)=> SelectWithCreate;
    readonly contactpuntWebsiteURLReadonly:(order?:number)=> Locator;
    readonly contactpuntOpeningsurenSelect:(order?: number)=> SelectWithCreate;
    readonly contactpuntOpeningsurenReadonly:(order?:number)=> Locator;
    readonly voegAdresToeButton:(order?: number)=> Locator;
    readonly contactpuntAdresGemeenteSelect:(order?: number)=> Select;
    readonly contactpuntAdresStraatSelect:(order?: number)=> Select;
    readonly contactpuntAdresHuisnummerInput:(order?: number) => Locator;
    readonly contactpuntAdresBusnummerInput:(order?: number) => Locator;
    readonly contactpuntAdresValidatie:(order?: number) => Locator;

    readonly titelWebsiteInput:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly titelWebsiteEngelsInput:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly beschrijvingWebsiteEditor:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly beschrijvingWebsiteReadonly:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly beschrijvingWebsiteEngelsEditor:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly beschrijvingWebsiteEngelsReadonly:(childOrder?:number, parentOrder?:number)=> Locator;
    readonly websiteURLInput:(childOrder?:number, parentOrder?:number)=> Locator;


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
    readonly geografischToepassingsgebiedMultiSelect: MultiSelect;

    readonly tagsMultiSelect: MultiSelect;
    readonly publicatieKanalenMultiSelect: MultiSelect;
    readonly categorieenYourEuropeMultiSelect: MultiSelect;

    readonly verzendNaarVlaamseOverheidButton: Locator;
    readonly wijzigingenBewarenButton: Locator;
    readonly terugNaarHetOverzichtButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Details' });
        this.heading = page.getByRole('heading').first();

        this.inhoudTab = page.getByRole('link', { name: 'Inhoud', exact: true })
        this.eigenschappenTab = page.getByRole('link', { name: 'Eigenschappen', exact: true });

        this.titelHeading = page.getByRole('heading', { name: 'Titel', exact: true });

        this.herzieningNodigAlert = page.getByRole('alert').locator('.au-c-alert__title:has-text("Herziening nodig")');
        this.herzieningNodigAlertGeenAanpassigenNodig = page.locator('[role="alert"]:has-text("Herziening nodig") button:has-text("Geen aanpassingen nodig")')

        this.conceptGearchiveerdAlert = page.getByRole('alert').locator('.au-c-alert__title:has-text("Concept gearchiveerd")');
        this.conceptGearchiveerdAlertGeenAanpassigenNodig = page.locator('[role="alert"]:has-text("Concept gearchiveerd") button:has-text("Geen aanpassingen nodig")')

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

        this.titelVoorwaardeInput = (order: number = 0) => this.inputBelow('Titel voorwaarde').nth(order);
        this.titelVoorwaardeEngelsInput = (order: number = 0) => this.inputRightOf('Titel voorwaarde').nth(order);
        this.beschrijvingVoorwaardeEditor = (order: number = 0) => this.editorBelow('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving voorwaarde').nth(order);
        this.beschrijvingVoorwaardeEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving voorwaarde').nth(order);

        this.titelBewijsstukInput = (order: number = 0) => this.inputBelow('Titel bewijsstuk').nth(order);
        this.titelBewijsstukEngelsInput = (order: number = 0) => this.inputRightOf('Titel bewijsstuk').nth(order);
        this.beschrijvingBewijsstukEditor = (order: number = 0) => this.editorBelow('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving bewijsstuk').nth(order);
        this.beschrijvingBewijsstukEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving bewijsstuk').nth(order);

        this.titelProcedureInput = (order: number = 0) => this.inputBelow('Titel procedure').nth(order);
        this.titelProcedureEngelsInput = (order: number = 0) => this.inputRightOf('Titel procedure').nth(order);
        this.beschrijvingProcedureEditor = (order: number = 0) => this.editorBelow('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving procedure').nth(order);
        this.beschrijvingProcedureEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving procedure').nth(order);

        this.titelWebsiteVoorProcedureInput = (childOrder: number = 0, parentOrder:number = 0) =>  this.nestedLocator(this.inputBelow('Titel website'),childOrder, 'Website procedure', parentOrder);
        this.titelWebsiteVoorProcedureEngelsInput = (childOrder: number = 0, parentOrder:number = 0) => this.nestedLocator(this.inputRightOf('Titel website'),childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEditor =(childOrder:number = 0, parentOrder:number = 0) => this.nestedLocator(this.editorBelow('Beschrijving website'),childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureReadonly =(childOrder:number = 0, parentOrder:number = 0) => this.nestedLocator(this.readonlyBelow('Beschrijving website'),childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEngelsEditor =(childOrder:number = 0, parentOrder:number = 0) => this.nestedLocator(this.editorRightOf('Beschrijving website'),childOrder, 'Website procedure', parentOrder);
        this.beschrijvingWebsiteVoorProcedureEngelsReadonly =(childOrder:number = 0, parentOrder:number = 0) => this.nestedLocator(this.readonlyRightOf('Beschrijving website'),childOrder, 'Website procedure', parentOrder);
        this.websiteURLVoorProcedureInput=(childOrder:number = 0, parentOrder:number = 0) => this.nestedLocator(this.inputBelow('Website URL'),childOrder, 'Website procedure', parentOrder);

        this.titelKostInput = (order: number = 0) => this.inputBelow('Titel kost').nth(order);
        this.titelKostEngelsInput = (order: number = 0) => this.inputRightOf('Titel kost').nth(order);
        this.beschrijvingKostEditor = (order: number = 0) => this.editorBelow('Beschrijving kost').nth(order);
        this.beschrijvingKostReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving kost').nth(order);
        this.beschrijvingKostEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving kost').nth(order);
        this.beschrijvingKostEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving kost').nth(order);

        this.titelFinancieelVoordeelInput = (order: number = 0) => this.inputBelow('Titel financieel voordeel').nth(order);
        this.titelFinancieelVoordeelEngelsInput = (order: number = 0) => this.inputRightOf('Titel financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelEditor = (order: number = 0) => this.editorBelow('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelReadonly = (order: number = 0) => this.readonlyBelow('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelEngelsEditor = (order: number = 0) => this.editorRightOf('Beschrijving financieel voordeel').nth(order);
        this.beschrijvingFinancieelVoordeelEngelsReadonly = (order: number = 0) => this.readonlyRightOf('Beschrijving financieel voordeel').nth(order);

        this.beschrijvingRegelgevingEditor =(order: number = 0) => this.editorBelow('Regelgeving').nth(order);
        this.beschrijvingRegelgevingReadonly =(order: number = 0) => this.readonlyBelow('Regelgeving').nth(order);
        this.beschrijvingRegelgevingEngelsEditor =(order: number = 0) => this.editorRightOf('Regelgeving').nth(order);
        this.beschrijvingRegelgevingEngelsReadonly =(order: number = 0) => this.readonlyRightOf('Regelgeving').nth(order);

        this.voegContactpuntToeButton = page.getByRole('button', { name: 'Voeg contactpunt toe' });
        this.contactpuntHeading = page.getByRole('heading', { name: 'Contactpunt', exact: true });
        this.contactpuntEmailSelect = (order: number = 0) => new SelectWithCreate(page, 'Email',order);
        this.contactpuntEmailReadonly = (childOrder:number = 0, parentOrder:number = 0 ) => this.nestedLocator(this.inputBelow('Email'), childOrder,'Contactpunt', parentOrder);
        this.contactpuntTelefoonSelect = (order: number = 0)=> new SelectWithCreate(page, 'Telefoon', order);
        this.contactpuntTelefoonReadonly = (childOrder:number = 0, parentOrder:number = 0 ) => this.nestedLocator(this.inputBelow('Telefoon'), childOrder,'Contactpunt', parentOrder);
        this.contactpuntWebsiteURLSelect = (order: number = 0)=> new SelectWithCreate(page, 'Website URL', order);
        this.contactpuntWebsiteURLReadonly = (childOrder:number = 0, parentOrder:number = 0 ) => this.nestedLocator(this.inputBelow('Website URL'), childOrder,'Contactpunt', parentOrder);
        this.contactpuntOpeningsurenSelect = (order: number = 0)=> new SelectWithCreate(page, 'Openingsuren', order);
        this.contactpuntOpeningsurenReadonly = (childOrder:number = 0, parentOrder:number = 0 ) => this.nestedLocator(this.inputBelow('Openingsuren'), childOrder,'Contactpunt', parentOrder);

        this.voegAdresToeButton = (order: number = 0)=> page.getByRole('button', { name: 'Voeg adres toe' }).nth(order);
        this.contactpuntAdresGemeenteSelect = (order: number = 0) => new Select(page,'Gemeente','Adres',order+1);
        this.contactpuntAdresStraatSelect = (order: number = 0) => new Select(page,'Straat', 'Adres', order+1);
        this.contactpuntAdresHuisnummerInput = (order: number = 0) => this.inputBelow('Huisnummer').nth(order);
        this.contactpuntAdresBusnummerInput = (order: number = 0) => this.inputBelow('Bus').nth(order);
        this.contactpuntAdresValidatie = (order: number = 0)=> page.getByRole('alert').nth(order);

        // this.titelWebsiteInput = (childOrder: number = 0, parentOrder:number = 0) =>  this.nestedLocator(this.inputBelow('Titel website'),childOrder, 'Gegevens website', parentOrder);
        // this.titelWebsiteInput =(childOrder: number = 0, parentOrder:number = 0)=> page.locator(`input:below(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).nth(childOrder);
        // this.titelWebsiteEngelsInput = (childOrder:number = 0, parentOrder:number = 0 ) => this.nestedLocator(this.inputBelow('Engelse vertaling van de titel'), childOrder,'Gegevens website', parentOrder);
        // this.beschrijvingWebsiteEditor =(childOrder:number=0, parentOrder:number=0) => this.nestedLocator(this.editorBelow('Beschrijving website'),childOrder, 'Gegevens website', parentOrder);
        // this.beschrijvingWebsiteReadonly =(childOrder:number=0, parentOrder:number=0) => this.nestedLocator(this.readonlyBelow('Beschrijving website'),childOrder, 'Gegevens website', parentOrder);
        // this.beschrijvingWebsiteEngelsEditor =(childOrder:number=0, parentOrder:number=0) => this.nestedLocator(this.editorBelow('Engelse vertaling van de beschrijving'),childOrder, 'Gegevens website', parentOrder);
        // this.beschrijvingWebsiteEngelsReadonly =(childOrder:number=0, parentOrder:number=0) => this.nestedLocator(this.readonlyBelow('Engelse vertaling van de beschrijving'),childOrder, 'Gegevens website', parentOrder);
        // this.websiteURLInput =(childOrder:number=0, parentOrder:number=0) => this.nestedLocator(this.inputBelow('Website URL'),childOrder, 'Gegevens website', parentOrder);


        this.titelWebsiteInput =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`input:below(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).nth(childOrder)
        this.titelWebsiteEngelsInput =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`input:right-of(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).nth(childOrder)
        this.beschrijvingWebsiteEditor =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`div.ProseMirror:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(childOrder)
        this.beschrijvingWebsiteReadonly =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(childOrder)
        this.beschrijvingWebsiteEngelsEditor =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(childOrder)
        this.beschrijvingWebsiteEngelsReadonly =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).nth(childOrder)
        this.websiteURLInput =(childOrder: number = 0, parentOrder:number = 0)=>  page.locator(`input:below(label:text-is('Website URL'):below(h2:text-is('Gegevens website')))`).nth(childOrder)


        this.algemeneInfoHeading = page.getByRole('heading', { name: 'Algemene info' });
        
        this.productOfDienstGeldigVanafInput = this.inputBelow('Product of dienst geldig vanaf').first();
        this.productOfDienstGeldigTotInput = this.inputBelow('Product of dienst geldig tot').first();
        this.productTypeSelect = new Select(page, 'Product type');
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
        this.themasMultiSelect = new MultiSelect(page, `Thema\\\'s`);

        this.bevoegdBestuursniveauMultiSelect = new MultiSelect(page, 'Bevoegd bestuursniveau');
        this.bevoegdeOverheidMultiSelect = new MultiSelect(page, 'Bevoegde overheid');
        this.uitvoerendBestuursniveauMultiSelect = new MultiSelect(page, 'Uitvoerend bestuursniveau');
        this.geografischToepassingsgebiedMultiSelect = new MultiSelect(page, 'Geografisch toepassingsgebied');

        this.tagsMultiSelect = new MultiSelect(page, "Tags");
        this.publicatieKanalenMultiSelect = new MultiSelect(page, "Publicatiekanalen");
        this.categorieenYourEuropeMultiSelect = new MultiSelect(page, "Categorieën Your Europe");

        this.verzendNaarVlaamseOverheidButton = page.getByRole('button', { name: 'Verzend naar Vlaamse overheid' });
        this.wijzigingenBewarenButton = page.getByRole('button', {name: 'Wijzigingen bewaren'});
        this.terugNaarHetOverzichtButton = page.getByRole('link', {name: 'Terug naar het overzicht'});
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

    private inputBelowLabelAndNthTitle(label: string, title: string, nthTitle: number): Locator {
        return this.page.locator(`input:below(:nth-match(h2:text-is('${title}'), ${nthTitle})):below(label:text-is('${label}'))`).first();
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

    private nestedLocator(childLocator: Locator, childOrder: number,  parentLocator: string, parentOrder:number):Locator {
        return this.page.locator(`:below(:nth-match(h2:text-is('${parentLocator}'), ${parentOrder+1}))`).locator(childLocator.nth(childOrder));
    }

}