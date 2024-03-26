import { Locator, Page } from "@playwright/test";

export class SelectWithCreate {

    private readonly page: Page;
    readonly selectDiv: Locator;
    readonly clearButton: Locator;
    readonly selectedItem: Locator;

    constructor(page: Page, forLabel: string, order:number =0) {
        this.page = page;

        this.selectDiv = page.locator(`div.ember-basic-dropdown-trigger:below(label:text-is('${forLabel}'))`).nth(order);
        this.clearButton = page.locator(`div.ember-basic-dropdown-trigger:below(label:text-is('${forLabel}'))`).locator(`span.ember-power-select-clear-btn`).nth(order);
        this.selectedItem = page.locator(`span.ember-power-select-selected-item:below(label:text-is('${forLabel}'))`).first();
    }

    async selectValue(text: string) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await this.option(text).click();
    }

    async searchValue(text: string): Promise<string> {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        return this.option(text).last().innerText();
    }

    async insertNewValue(text: string) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await this.page.keyboard.press('Enter');
    }

    private option(text: string): Locator {
        return this.page.getByRole('option', { name: text });
    }

}