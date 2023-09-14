import { Locator, Page } from "@playwright/test";

export class MultiSelect {

    private readonly page: Page;
    private readonly input: Locator;
    private readonly listContainer: Locator;

    constructor(page: Page, forLabel: string) {
        this.page = page;

        this.input = page.locator(`input:below(label:text-is('${forLabel}'))`).first();
        this.listContainer = page.locator(`ul.ember-power-select-multiple-options:below(label:text-is('${forLabel}'))`).first();
    }

    async type(text: string) {
        await this.input.fill(text);
    }

    option(text: string): Locator {
        return this.page.getByRole('option', { name: text });
    }

    options(): Locator {
        return this.listContainer.locator('li.ember-power-select-multiple-option');
    }

}