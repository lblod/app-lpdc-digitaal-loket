import {AbstractPage} from "./abstract-page";
import {expect, Locator, Page} from "@playwright/test";
import {Table} from "../components/table";
import { MultiSelect } from "../components/multi-select";

export class KoppelConceptPage extends AbstractPage {

    private readonly header: Locator;
    readonly searchInput: Locator;
    readonly resultTable: Table;
    readonly nieuweProductenCheckbox: Locator;
    readonly nietToegevoegdeProductenCheckbox: Locator;
    readonly yourEuropeCheckbox: Locator;
    readonly producttypeMultiSelect: MultiSelect;
    readonly doelgroepenMultiSelect: MultiSelect;
    readonly themasMultiSelect: MultiSelect;

    private constructor(page: Page) {
        super(page);

        this.header = page.getByRole('heading', { name: 'Koppel een instantie aan een concept' });
        this.resultTable = new Table(page);
        this.searchInput = page.locator('input:below(label:text-is("Zoeken"))').first();
        this.nieuweProductenCheckbox = page.getByText('Nieuwe producten');
        this.nietToegevoegdeProductenCheckbox = page.getByText('Niet toegevoegde producten');
        this.yourEuropeCheckbox = page.locator('label').filter({ hasText: 'Your Europe' });
        this.producttypeMultiSelect = new MultiSelect(page, 'Producttype');
        this.doelgroepenMultiSelect = new MultiSelect(page, 'Doelgroepen');
        this.themasMultiSelect = new MultiSelect(page, 'Thema\\\'s');
    }

    static create(page: Page): KoppelConceptPage {
        return new KoppelConceptPage(page);
    }

    async expectToBeVisible(): Promise<void> {
        await expect(this.header).toBeVisible();
    }

}