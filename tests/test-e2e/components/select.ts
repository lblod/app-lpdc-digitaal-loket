import { Locator, Page } from "@playwright/test";

export class Select {

    private readonly page: Page;
    readonly selectDiv: Locator;
    readonly selectedItem: Locator;
    readonly clearButton: Locator;

    constructor(page: Page, forLabel: string, belowTitle?: string, nthMatchTitle?: number) {
        this.page = page;

        const belowTitleSelector = belowTitle && nthMatchTitle ? `:below(:nth-match(h2:text-is('${belowTitle}'), ${nthMatchTitle}))` : '';
        this.selectDiv = page.locator(`div.ember-basic-dropdown-trigger${belowTitleSelector}:below(label:text-is('${forLabel}'))`).first();
        this.clearButton = page.locator(`div.ember-basic-dropdown-trigger${belowTitleSelector}:below(label:text-is('${forLabel}'))`).first().locator(`span.ember-power-select-clear-btn`);
        this.selectedItem = page.locator(`span.ember-power-select-selected-item${belowTitleSelector}:below(label:text-is('${forLabel}'))`).first();
    }

    async selectValue(text: string) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await this.option(text).click();
    }

    private option(text: string): Locator {
        return this.page.getByRole('option', { name: text });
    }

}