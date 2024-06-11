import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { Table } from "../components/table";
import { lpdcUrl } from "../../test-api/test-helpers/test-options";
import { MultiSelect } from "../components/multi-select";

export class LpdcHomePage extends AbstractPage {

    private readonly header: Locator;
    readonly productOfDienstToevoegenButton: Locator;
    readonly resultTable: Table;
    readonly searchInput: Locator;
    readonly herzieningNodigCheckbox: Locator;
    readonly uJeConversieNodigCheckbox: Locator;
    readonly yourEuropeCheckbox: Locator;
    readonly statusMultiSelect: MultiSelect;
    readonly producttypeMultiSelect: MultiSelect;
    readonly doelgroepenMultiSelect: MultiSelect;
    readonly themasMultiSelect: MultiSelect;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' });
        this.productOfDienstToevoegenButton = page.getByRole('link', { name: 'Product of dienst toevoegen' });
        this.resultTable = new Table(page);
        this.searchInput = page.locator('input:below(label:text-is("Zoeken"))').first();
        this.herzieningNodigCheckbox = page.locator('label').filter({ hasText: 'Herziening nodig' }).locator('span');
        this.uJeConversieNodigCheckbox = page.locator('label').filter({ hasText: 'u→je omzetting nodig' }).locator('span');
        this.yourEuropeCheckbox = page.locator('label').filter({ hasText: 'Your Europe' });
        this.statusMultiSelect = new MultiSelect(page, 'Status');
        this.producttypeMultiSelect = new MultiSelect(page, 'Producttype');
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
        this.themasMultiSelect = new MultiSelect(page, 'Thema\\\'s');
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

    async logout(gemeente: string) {
        await this.page.getByText(`Gemeente ${gemeente} - Gemeente ${gemeente}`).click();
        await this.page.getByText('Afmelden').click();
    }    

}
