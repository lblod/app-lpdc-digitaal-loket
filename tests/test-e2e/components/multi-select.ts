import { Locator, Page } from "@playwright/test";

export class MultiSelect {

    private readonly page: Page;
    private readonly selectDiv: Locator;
    private readonly listContainer: Locator;

    constructor(page: Page, forLabel: string) {
        this.page = page;

        this.selectDiv = page.locator(`div.ember-basic-dropdown-trigger:below(label:text-is('${forLabel}'))`).first();
        this.listContainer = page.locator(`ul:below(label:text-is('${forLabel}'))`).first();
    }

    async selectValue(text: string) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await this.option(text).click();
    }

    async insertNewValue(text: string) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await this.page.keyboard.press('Enter');
    }

    private option(text: string): Locator {
        return this.page.getByRole('option', { name: text });
    }

    options(): Locator {
        return this.listContainer.locator(':is(li.ember-power-select-multiple-option, li:has(> span))');
    }

    optionsDeleteButtons(): Locator {
        return this.options().locator('span.ember-power-select-multiple-remove-btn');
    }

}