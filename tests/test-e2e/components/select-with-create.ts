import { Locator, Page } from "@playwright/test";

export class SelectWithCreate {

    private readonly page: Page;
    private readonly selectDiv: Locator;
    readonly selectedItem: Locator;

    constructor(page: Page, forLabel: string) {
        this.page = page;

        this.selectDiv = page.locator(`div.ember-basic-dropdown-trigger:below(label:text-is('${forLabel}'))`).first();
        this.selectedItem = page.locator(`span.ember-power-select-selected-item:below(label:text-is('${forLabel}'))`).first();
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

}