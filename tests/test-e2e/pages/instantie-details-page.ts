import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { MultiSelect } from "../components/multi-select";

export class InstantieDetailsPage extends AbstractPage {
    
    private readonly menuHeader: Locator;
    readonly heading: Locator; 
    readonly inhoudTab: Locator;
    readonly eigenschappenTab: Locator;
    readonly titelInput: Locator;
    readonly titelKostEngels: Locator;
    readonly beschrijvingKostEngels: Locator;
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
        this.titelInput = page.locator(`input:below(label:text-is('Titel'))`).first();
        this.titelKostEngels = page.locator(`input:right-of(label:has-text('Titel Kost'))`).first();
        this.beschrijvingKostEngels = page.locator(`div.ProseMirror:right-of(label:has-text('Beschrijving kost'))`).first();
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