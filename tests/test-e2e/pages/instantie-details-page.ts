import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { MultiSelect } from "../components/multi-select";

export class InstantieDetailsPage extends AbstractPage {
    
    private readonly menuHeader: Locator;
    readonly heading: Locator; 

    readonly inhoudTab: Locator;
    readonly eigenschappenTab: Locator;

    readonly titelHeading: Locator;
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

    readonly titelVoorwaardeInput: Locator;
    readonly titelVoorwaardeEngelsInput: Locator;

    readonly beschrijvingVoorwaardeEditor: Locator;
    readonly beschrijvingVoorwaardeEngelsEditor: Locator;
    readonly beschrijvingVoorwaardeReadonly: Locator;
    readonly beschrijvingVoorwaardeEngelsReadonly: Locator;

    readonly titelBewijsstukInput: Locator;
    readonly titelBewijsstukEngelsInput: Locator;

    readonly beschrijvingBewijsstukEditor: Locator;
    readonly beschrijvingBewijsstukEngelsEditor: Locator;
    readonly beschrijvingBewijsstukReadonly: Locator;
    readonly beschrijvingBewijsstukEngelsReadonly: Locator;

    readonly titelProcedureInput: Locator;
    readonly titelProcedureEngelsInput: Locator;

    readonly beschrijvingProcedureEditor: Locator;
    readonly beschrijvingProcedureEngelsEditor: Locator;
    readonly beschrijvingProcedureReadonly: Locator;
    readonly beschrijvingProcedureEngelsReadonly: Locator;

    readonly voegWebsiteToeVoorProcedureButton: Locator; 

    readonly titelKostEngelsInput: Locator;
    readonly beschrijvingKostEngelsEditor: Locator;

    readonly algemeneInfoHeading: Locator;
    readonly bevoegdeOverheidMultiSelect: MultiSelect;
    readonly geografischToepassingsgebiedMultiSelect: MultiSelect;
    readonly verzendNaarVlaamseOverheidButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Details' });
        this.heading = page.getByRole('heading').first();

        this.inhoudTab = page.getByRole('link', { name: 'Inhoud', exact: true })
        this.eigenschappenTab = page.getByRole('link', { name: 'Eigenschappen', exact: true  });
        
        this.titelHeading = page.getByRole('heading', { name: 'Titel', exact: true });

        this.titelInput = this.inputBelow('Titel');
        this.titelEngelsInput = this.inputRightOf('Titel');
        
        this.beschrijvingEditor = this.editorBelow('Beschrijving');
        this.beschrijvingEngelsEditor = this.editorRightOf('Beschrijving');
        this.beschrijvingReadonly = this.readonlyBelow('Beschrijving');
        this.beschrijvingEngelsReadonly = this.readonlyRightOf('Beschrijving');

        this.aanvullendeBeschrijvingEditor = this.editorBelow('Aanvullende Beschrijving');
        this.aanvullendeBeschrijvingEngelsEditor = this.editorRightOf('Aanvullende Beschrijving');
        this.aanvullendeBeschrijvingReadonly = this.readonlyBelow('Aanvullende Beschrijving');
        this.aanvullendeBeschrijvingEngelsReadonly = this.readonlyRightOf('Aanvullende Beschrijving');;

        this.uitzonderingenEditor = this.editorBelow('Uitzonderingen');
        this.uitzonderingenEngelsEditor = this.editorRightOf('Uitzonderingen');
        this.uitzonderingenReadonly = this.readonlyBelow('Uitzonderingen');
        this.uitzonderingenEngelsReadonly = this.readonlyRightOf('Uitzonderingen');

        this.titelVoorwaardeInput = this.inputBelow('Titel voorwaarde');
        this.titelVoorwaardeEngelsInput = this.inputRightOf('Titel voorwaarde');

        this.beschrijvingVoorwaardeEditor = this.editorBelow('Beschrijving voorwaarde');
        this.beschrijvingVoorwaardeEngelsEditor = this.editorRightOf('Beschrijving voorwaarde');
        this.beschrijvingVoorwaardeReadonly = this.readonlyBelow('Beschrijving voorwaarde');
        this.beschrijvingVoorwaardeEngelsReadonly = this.readonlyRightOf('Beschrijving voorwaarde');

        this.titelBewijsstukInput = this.inputBelow('Titel bewijsstuk');
        this.titelBewijsstukEngelsInput = this.inputRightOf('Titel bewijsstuk');

        this.beschrijvingBewijsstukEditor = this.editorBelow('Beschrijving bewijsstuk');
        this.beschrijvingBewijsstukEngelsEditor = this.editorRightOf('Beschrijving bewijsstuk');
        this.beschrijvingBewijsstukReadonly = this.readonlyBelow('Beschrijving bewijsstuk');
        this.beschrijvingBewijsstukEngelsReadonly = this.readonlyRightOf('Beschrijving bewijsstuk');

        this.titelProcedureInput = this.inputBelow('Titel procedure');
        this.titelProcedureEngelsInput = this.inputRightOf('Titel procedure');

        this.beschrijvingProcedureEditor = this.editorBelow('Beschrijving procedure');
        this.beschrijvingProcedureEngelsEditor = this.editorRightOf('Beschrijving procedure');
        this.beschrijvingProcedureReadonly = this.readonlyBelow('Beschrijving procedure');
        this.beschrijvingProcedureEngelsReadonly = this.readonlyRightOf('Beschrijving procedure');

        this.voegWebsiteToeVoorProcedureButton = page.locator(`button:text-is('Voeg website toe'):below(h2:text-is('Website procedure'))`).first();
        
        this.titelKostEngelsInput = page.locator(`input:right-of(label:has-text('Titel Kost'))`).first();
        this.beschrijvingKostEngelsEditor = this.editorRightOf('Beschrijving kost');

        this.algemeneInfoHeading = page.getByRole('heading', { name: 'Algemene info' });
        this.bevoegdeOverheidMultiSelect = new MultiSelect(page, 'Bevoegde overheid');
        this.geografischToepassingsgebiedMultiSelect = new MultiSelect(page, 'Geografisch toepassingsgebied');
        this.verzendNaarVlaamseOverheidButton = page.getByRole('button', { name: 'Verzend naar Vlaamse overheid' });
    }

    static create(page: Page): InstantieDetailsPage {
        return new InstantieDetailsPage(page);
    }
    
    async expectToBeVisible() {
        await expect(this.menuHeader).toBeVisible();
    }
 
    private inputBelow(label: string): Locator {
        return this.page.locator(`input:below(label:text-is('${label}'))`).first();
    }

    private inputRightOf(label: string): Locator {
        return this.page.locator(`input:right-of(label:text-is('${label}'))`).first();
    }

    private editorBelow(label: string): Locator {
        return this.page.locator(`div.ProseMirror:below(label:text-is('${label}'))`).first();
    }

    private readonlyBelow(label: string): Locator {
        return this.page.locator(`div.rich-text-editor-content:below(label:text-is('${label}'))`).first();;
    }

    private editorRightOf(label: string): Locator {
        return this.page.locator(`div.ProseMirror:right-of(label:text-is('${label}'))`).first();
    }

    private readonlyRightOf(label: string): Locator {
        return this.page.locator(`div.rich-text-editor-content:right-of(label:text-is('${label}'))`).first();;
    }

}