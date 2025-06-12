import { Locator, Page } from "@playwright/test";
import { wait } from "../shared/shared";

export class MultiSelect {

    private readonly page: Page;
    private readonly selectDiv: Locator;
    readonly selectDivLocatorString: string;
    private readonly listContainer: Locator;

    constructor(page: Page, forLabel: string, withinContainer: string = '') {
        this.page = page;

        this.selectDivLocatorString = `${withinContainer} div.ember-basic-dropdown-trigger:below(label:has-text('${forLabel}'))`;
        this.selectDiv = page.locator(this.selectDivLocatorString).first();
        this.listContainer = page.locator(`${withinContainer} ul:below(label:has-text('${forLabel}'))`).first();
    }

    async selectValue(text: string, clickOption: boolean = true) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await wait(500);
        if (clickOption) {
            await this.option(text).click();
        }
    }

    async insertNewValue(text: string) {
        await this.selectDiv.click();
        await this.page.keyboard.type(text);
        await wait(500);
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