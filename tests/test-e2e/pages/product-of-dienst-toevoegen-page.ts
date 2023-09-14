import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";

export class AddProductOrServicePage extends AbstractPage {
    private readonly header: Locator;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Product of dienst toevoegen' });
    }

    static create(page: Page): AddProductOrServicePage {
        return new AddProductOrServicePage(page);
    }

    async expectToBeVisible() {
        await expect(this.header).toBeVisible();
    }

}