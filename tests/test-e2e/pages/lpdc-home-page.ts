import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { Table } from "../components/table";

export class LpdcHomePage extends AbstractPage {

    private readonly header: Locator;
    readonly productOfDienstToevoegenButton: Locator;
    readonly resultTable: Table;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' });
        this.productOfDienstToevoegenButton = page.getByRole('link', { name: 'Product of dienst toevoegen' });
        this.resultTable = new Table(page);
    }

    static create(page: Page): LpdcHomePage {
        return new LpdcHomePage(page);
    }

    async expectToBeVisible() {
        await expect(this.header).toBeVisible();
    }
    
}