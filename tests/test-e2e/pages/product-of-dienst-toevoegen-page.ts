import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { Table } from "../components/table";
import { MultiSelect } from "../components/multi-select";

export class AddProductOrServicePage extends AbstractPage {
    private readonly header: Locator;
    private readonly searchInput: Locator;
    readonly resultTable: Table;
    readonly volledigNieuwProductToevoegenButton: Locator;
    readonly nuKeuzeMakenLink: Locator;
    readonly nieuweProductenCheckbox: Locator;
    readonly nietToegevoegdeProductenCheckbox: Locator;
    readonly yourEuropeCheckbox: Locator;
    readonly producttypeMultiSelect: MultiSelect;
    readonly doelgroepenMultiSelect: MultiSelect;
    readonly themasMultiSelect: MultiSelect;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Product of dienst toevoegen' });
        this.resultTable = new Table(page);
        this.volledigNieuwProductToevoegenButton = page.getByRole('link', { name: 'Volledig nieuw product toevoegen' });
        this.searchInput = page.locator('input:below(label:text-is("Zoeken"))').first();
        this.nuKeuzeMakenLink = page.getByRole('button', { name: 'Nu keuze maken' });
        this.nieuweProductenCheckbox = page.getByText('Nieuwe producten');
        this.nietToegevoegdeProductenCheckbox = page.getByText('Niet toegevoegde producten');
        this.yourEuropeCheckbox = page.locator('label').filter({ hasText: 'Your Europe' });
        this.producttypeMultiSelect = new MultiSelect(page, 'Producttype');
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
        this.themasMultiSelect = new MultiSelect(page, 'Thema\\\'s');
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