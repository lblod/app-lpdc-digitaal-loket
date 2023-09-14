import { Locator, Page, expect } from "@playwright/test";
import { lpdcUrl } from "../../test-api/test-helpers/test-options";
import { AbstractPage } from "./abstract-page";

export class LpdcHomePage extends AbstractPage {

    private readonly header: Locator;

    private constructor(page: Page) {
        super(page, lpdcUrl);

        this.header = page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' });
    }

    static create(page: Page): LpdcHomePage {
        return new LpdcHomePage(page);
    }


    async expectToBeVisible() {
        await expect(this.header).toBeVisible();
    }
    
}