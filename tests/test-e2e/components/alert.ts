import {expect, Page, Locator} from "@playwright/test";

export class Alert {

    private readonly page: Page;
    private readonly alert: Locator;

    constructor(page: Page, title: string) {
        this.page = page;

        this.alert = page.locator(`[role="alert"]:has-text('${title}')`);
    }

    async expectToBeVisible() {
        await expect(this.alert).toBeVisible();
    }

    async expectToBeInvisible() {
        await expect(this.alert).not.toBeVisible();
    }

    link(label: string): Locator {
        return this.alert.locator(`a:has-text('${label}')`);
    }

    button(label: string): Locator {
        return this.alert.locator(`button:has-text('${label}')`);
    }

    getMessage(){
        return this.alert.locator('.au-c-alert__message')
    }
}
