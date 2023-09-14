import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";

export class ConceptDetailsPage extends AbstractPage {
    
    private readonly menuHeader: Locator;
    readonly heading: Locator; 
    readonly voegToeButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Concept details' });
        this.heading = page.getByRole('heading').first();
        this.voegToeButton = page.getByRole('link', { name: 'Voeg toe' });
    }

    static create(page: Page): ConceptDetailsPage {
        return new ConceptDetailsPage(page);
    }
    
    async expectToBeVisible() {
        await expect(this.menuHeader).toBeVisible();
    }


}