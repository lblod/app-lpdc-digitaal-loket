import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { Table } from "../components/table";
import { lpdcUrl } from "../../test-api/test-helpers/test-options";

export class LpdcHomePage extends AbstractPage {

    private readonly header: Locator;
    readonly productOfDienstToevoegenButton: Locator;
    readonly resultTable: Table;
    readonly searchInput: Locator;
    readonly uJeConversieNodigFilter: Locator;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' });
        this.productOfDienstToevoegenButton = page.getByRole('link', { name: 'Product of dienst toevoegen' });
        this.resultTable = new Table(page);
        this.searchInput = page.getByPlaceholder('Vul uw zoekterm in');
        this.uJeConversieNodigFilter = page.locator('label').filter({ hasText: 'u→je omzetting nodig' }).locator('span');
    }

    static create(page: Page): LpdcHomePage {
        return new LpdcHomePage(page);
    }

    async expectToBeVisible() {
        await expect(this.header).toBeVisible();
    }

    async goto() {
        await this.page.goto(`${lpdcUrl}`)
        await this.expectToBeVisible();
    }

}
