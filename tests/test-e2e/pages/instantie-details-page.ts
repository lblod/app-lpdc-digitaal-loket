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
    readonly beschrijvingReadonly: Locator;
    readonly beschrijvingEngelsEditor: Locator;
    readonly beschrijvingEngelsReadonly: Locator;

    readonly aanvullendeBeschrijvingEditor: Locator;
    readonly aanvullendeBeschrijvingReadonly: Locator;
    readonly aanvullendeBeschrijvingEngelsEditor: Locator;
    readonly aanvullendeBeschrijvingEngelsReadonly: Locator;

    readonly uitzonderingenEditor: Locator;
    readonly uitzonderingenReadonly: Locator;
    readonly uitzonderingenEngelsEditor: Locator;
    readonly uitzonderingenEngelsReadonly: Locator;

    readonly titelVoorwaardeInput: Locator;
    readonly titelVoorwaardeEngelsInput: Locator;

    readonly beschrijvingVoorwaardeEditor: Locator;
    readonly beschrijvingVoorwaardeReadonly: Locator;
    readonly beschrijvingVoorwaardeEngelsEditor: Locator;
    readonly beschrijvingVoorwaardeEngelsReadonly: Locator;

    readonly titelBewijsstukInput: Locator;
    readonly titelBewijsstukEngelsInput: Locator;

    readonly beschrijvingBewijsstukEditor: Locator;
    readonly beschrijvingBewijsstukReadonly: Locator;
    readonly beschrijvingBewijsstukEngelsEditor: Locator;
    readonly beschrijvingBewijsstukEngelsReadonly: Locator;

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
        this.titelInput = page.locator(`input:below(label:text-is('Titel'))`).first();
        this.titelEngelsInput = page.locator(`input:right-of(label:text-is('Titel'))`).first();
        
        this.beschrijvingEditor = page.locator(`div.ProseMirror:below(label:text-is('Beschrijving'))`).first();
        this.beschrijvingReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving'))`).first();
        this.beschrijvingEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving'))`).first();
        this.beschrijvingEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving'))`).first();

        this.aanvullendeBeschrijvingEditor = page.locator(`div.ProseMirror:below(label:text-is('Aanvullende Beschrijving'))`).first();
        this.aanvullendeBeschrijvingReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Aanvullende Beschrijving'))`).first();
        this.aanvullendeBeschrijvingEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Aanvullende Beschrijving'))`).first();
        this.aanvullendeBeschrijvingEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Aanvullende Beschrijving'))`).first();

        this.uitzonderingenEditor = page.locator(`div.ProseMirror:below(label:text-is('Uitzonderingen'))`).first();
        this.uitzonderingenReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Uitzonderingen'))`).first();
        this.uitzonderingenEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Uitzonderingen'))`).first();
        this.uitzonderingenEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Uitzonderingen'))`).first();

        this.titelVoorwaardeInput = page.locator(`input:below(label:text-is('Titel voorwaarde'))`).first();
        this.titelVoorwaardeEngelsInput = page.locator(`input:right-of(label:text-is('Titel voorwaarde'))`).first();

        this.beschrijvingVoorwaardeEditor = page.locator(`div.ProseMirror:below(label:text-is('Beschrijving voorwaarde'))`).first();
        this.beschrijvingVoorwaardeReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving voorwaarde'))`).first();
        this.beschrijvingVoorwaardeEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving voorwaarde'))`).first();
        this.beschrijvingVoorwaardeEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving voorwaarde'))`).first();

        this.titelBewijsstukInput = page.locator(`input:below(label:text-is('Titel bewijsstuk'))`).first();
        this.titelBewijsstukEngelsInput = page.locator(`input:right-of(label:text-is('Titel bewijsstuk'))`).first();

        this.beschrijvingBewijsstukEditor = page.locator(`div.ProseMirror:below(label:text-is('Beschrijving bewijsstuk'))`).first();
        this.beschrijvingBewijsstukReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving bewijsstuk'))`).first();
        this.beschrijvingBewijsstukEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving bewijsstuk'))`).first();
        this.beschrijvingBewijsstukEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving bewijsstuk'))`).first();
        
        this.titelKostEngelsInput = page.locator(`input:right-of(label:has-text('Titel Kost'))`).first();
        this.beschrijvingKostEngelsEditor = page.locator(`div.ProseMirror:right-of(label:has-text('Beschrijving kost'))`).first();
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

}