import { Locator, Page } from "@playwright/test";

export class MultiSelect {

    private readonly page: Page;
    private readonly input: Locator;

    constructor(page: Page, forLabel: string) {
        this.page = page;

        this.input = page.locator(`input:below(label:text-is('${forLabel}'))`).first();
    }

    async type(text: string) {
        await this.input.fill(text);
    }

    option(text: string): Locator {
        return this.page.getByRole('option', { name: text });
    }

}