import { Locator, Page } from "@playwright/test";

export class Select {

    private readonly page: Page;
    readonly selectDiv: Locator;
    readonly selectedItem: Locator;
    readonly clearButton: Locator;

    constructor(page: Page, forLabel: string, belowTitle?: string, nthMatchTitle?: number, withinContainer: string = '') {
        this.page = page;

        const belowTitleSelector = belowTitle && nthMatchTitle ? `:below(:nth-match(h2:has-text('${belowTitle}'), ${nthMatchTitle}))` : '';
        this.selectDiv = page.locator(`${withinContainer} div.ember-basic-dropdown-trigger${belowTitleSelector}:below(label:has-text('${forLabel}'))`).first();
        this.clearButton = page.locator(`${withinContainer} div.ember-basic-dropdown-trigger${belowTitleSelector}:below(label:has-text('${forLabel}'))`).first().locator(`span.ember-power-select-clear-btn`);
        this.selectedItem = page.locator(`${withinContainer} span.ember-power-select-selected-item${belowTitleSelector}:below(label:has-text('${forLabel}'))`).first();
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