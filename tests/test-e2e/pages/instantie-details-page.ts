import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { MultiSelect } from "../components/multi-select";
import { Select } from "../components/select";

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

    readonly titelWebsiteVoorProcedureInput: Locator;
    readonly titelWebsiteVoorProcedureEngelsInput: Locator;
    readonly beschrijvingWebsiteVoorProcedureEditor: Locator;
    readonly beschrijvingWebsiteVoorProcedureReadonly: Locator;
    readonly beschrijvingWebsiteVoorProcedureEngelsEditor: Locator;
    readonly beschrijvingWebsiteVoorProcedureEngelsReadonly: Locator;
    readonly websiteURLVoorProcedureInput: Locator;

    readonly titelKostInput: Locator;
    readonly titelKostEngelsInput: Locator;
    readonly beschrijvingKostEditor: Locator;
    readonly beschrijvingKostReadonly: Locator;
    readonly beschrijvingKostEngelsEditor: Locator;
    readonly beschrijvingKostEngelsReadonly: Locator;

    readonly titelFinancieelVoordeelInput: Locator;
    readonly titelFinancieelVoordeelEngelsInput: Locator;
    readonly beschrijvingFinancieelVoordeelEditor: Locator;
    readonly beschrijvingFinancieelVoordeelReadonly: Locator;
    readonly beschrijvingFinancieelVoordeelEngelsEditor: Locator;
    readonly beschrijvingFinancieelVoordeelEngelsReadonly: Locator;

    readonly beschrijvingRegelgevingEditor: Locator;
    readonly beschrijvingRegelgevingReadonly: Locator;
    readonly beschrijvingRegelgevingEngelsEditor: Locator;
    readonly beschrijvingRegelgevingEngelsReadonly: Locator;

    readonly titelWebsiteInput: Locator;
    readonly titelWebsiteEngelsInput: Locator;
    readonly beschrijvingWebsiteEditor: Locator;
    readonly beschrijvingWebsiteReadonly: Locator;
    readonly beschrijvingWebsiteEngelsEditor: Locator;
    readonly beschrijvingWebsiteEngelsReadonly: Locator;
    readonly websiteURLInput: Locator;

    readonly algemeneInfoHeading: Locator;
    readonly productOfDienstGeldigVanafInput: Locator;
    readonly productOfDienstGeldigTotInput: Locator;
    readonly productTypeSelect: Select;
    readonly doelgroepenMultiSelect: MultiSelect;
    readonly bevoegdeOverheidMultiSelect: MultiSelect;
    readonly geografischToepassingsgebiedMultiSelect: MultiSelect;
    readonly verzendNaarVlaamseOverheidButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Details' });
        this.heading = page.getByRole('heading').first();

        this.inhoudTab = page.getByRole('link', { name: 'Inhoud', exact: true })
        this.eigenschappenTab = page.getByRole('link', { name: 'Eigenschappen', exact: true });

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

        this.titelWebsiteVoorProcedureInput = page.locator(`input:below(label:text-is('Titel website'):below(h2:text-is('Website procedure')))`).first();
        this.titelWebsiteVoorProcedureEngelsInput = page.locator(`input:right-of(label:text-is('Titel website'):below(h2:text-is('Website procedure')))`).first();
        this.beschrijvingWebsiteVoorProcedureEditor = page.locator(`div.ProseMirror:below(label:text-is('Beschrijving website'):below(h2:text-is('Website procedure')))`).first();
        this.beschrijvingWebsiteVoorProcedureReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving website'):below(h2:text-is('Website procedure')))`).first();
        this.beschrijvingWebsiteVoorProcedureEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Website procedure')))`).first();
        this.beschrijvingWebsiteVoorProcedureEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Website procedure')))`).first();
        this.websiteURLVoorProcedureInput = page.locator(`input:below(label:text-is('Website URL'):below(h2:text-is('Website procedure')))`).first();

        this.titelKostInput = this.inputBelow('Titel kost');
        this.titelKostEngelsInput = this.inputRightOf('Titel kost');
        this.beschrijvingKostEditor = this.editorBelow('Beschrijving kost');
        this.beschrijvingKostReadonly = this.readonlyBelow('Beschrijving kost');
        this.beschrijvingKostEngelsEditor = this.editorRightOf('Beschrijving kost');
        this.beschrijvingKostEngelsReadonly = this.readonlyRightOf('Beschrijving kost');

        this.titelFinancieelVoordeelInput = this.inputBelow('Titel financieel voordeel');
        this.titelFinancieelVoordeelEngelsInput = this.inputRightOf('Titel financieel voordeel');
        this.beschrijvingFinancieelVoordeelEditor = this.editorBelow('Beschrijving financieel voordeel');
        this.beschrijvingFinancieelVoordeelReadonly = this.readonlyBelow('Beschrijving financieel voordeel');
        this.beschrijvingFinancieelVoordeelEngelsEditor = this.editorRightOf('Beschrijving financieel voordeel');
        this.beschrijvingFinancieelVoordeelEngelsReadonly = this.readonlyRightOf('Beschrijving financieel voordeel');

        this.beschrijvingRegelgevingEditor = this.editorBelow('Regelgeving');
        this.beschrijvingRegelgevingReadonly = this.readonlyBelow('Regelgeving');
        this.beschrijvingRegelgevingEngelsEditor = this.editorRightOf('Regelgeving');
        this.beschrijvingRegelgevingEngelsReadonly = this.readonlyRightOf('Regelgeving');

        this.titelWebsiteInput = page.locator(`input:below(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).first();
        this.titelWebsiteEngelsInput = page.locator(`input:right-of(label:text-is('Titel website'):below(h2:text-is('Gegevens website')))`).first();
        this.beschrijvingWebsiteEditor = page.locator(`div.ProseMirror:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).first();
        this.beschrijvingWebsiteReadonly = page.locator(`div.rich-text-editor-content:below(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).first();
        this.beschrijvingWebsiteEngelsEditor = page.locator(`div.ProseMirror:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).first();
        this.beschrijvingWebsiteEngelsReadonly = page.locator(`div.rich-text-editor-content:right-of(label:text-is('Beschrijving website'):below(h2:text-is('Gegevens website')))`).first();
        this.websiteURLInput = page.locator(`input:below(label:text-is('Website URL'):below(h2:text-is('Gegevens website')))`).first();

        this.algemeneInfoHeading = page.getByRole('heading', { name: 'Algemene info' });
        this.productOfDienstGeldigVanafInput = this.inputBelow('Product of dienst geldig vanaf');
        this.productOfDienstGeldigTotInput = this.inputBelow('Product of dienst geldig tot');
        this.productTypeSelect = new Select(page, 'Product type');
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
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