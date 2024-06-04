import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { Table } from "../components/table";

export class AddProductOrServicePage extends AbstractPage {
    private readonly header: Locator;
    private readonly searchInput: Locator;
    readonly resultTable: Table;
    readonly volledigNieuwProductToevoegenButton: Locator;
    readonly nuKeuzeMakenLink: Locator;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Product of dienst toevoegen' });
        this.resultTable = new Table(page);
        this.volledigNieuwProductToevoegenButton = page.getByRole('link', { name: 'Volledig nieuw product toevoegen' });
        this.searchInput = page.locator('input:below(label:text-is("Zoeken"))').first();
        this.nuKeuzeMakenLink = page.getByRole('button', { name: 'Nu keuze maken' });
    }

    static create(page: Page): AddProductOrServicePage {
        return new AddProductOrServicePage(page);
    }

    async searchConcept(name: string) {
        await this.searchInput.fill(name);
    }

    async expectToBeVisible() {
        await expect(this.header).toBeVisible();
    }

}