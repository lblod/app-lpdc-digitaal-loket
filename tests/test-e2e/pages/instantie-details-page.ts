import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";

export class InstantieDetailsPage extends AbstractPage {
    
    private readonly menuHeader: Locator;
    readonly heading: Locator; 
    readonly eigenschappenTab: Locator;
    readonly titelInput: Locator;
    readonly titelKostEngels: Locator;
    readonly beschrijvingKostEngels: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Details' });
        this.heading = page.getByRole('heading').first();
        this.eigenschappenTab = page.getByRole('link', { name: 'Eigenschappen' });
        this.titelInput = page.locator(`input:below(label:text-is('Titel'))`).first();
        this.titelKostEngels = page.locator(`input:right-of(label:has-text('Titel Kost'))`).first();
        this.beschrijvingKostEngels = page.locator(`div.ProseMirror:right-of(label:has-text('Beschrijving kost'))`).first();
    }

    static create(page: Page): InstantieDetailsPage {
        return new InstantieDetailsPage(page);
    }
    
    async expectToBeVisible() {
        await expect(this.menuHeader).toBeVisible();
    }

}