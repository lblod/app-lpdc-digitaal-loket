import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";

export class MockLoginPage extends AbstractPage {

    private readonly search: Locator;

    constructor(page: Page, baseSpaURL: string) {
        super(page, baseSpaURL);

        this.search = page.getByPlaceholder('Aalst, Berchem,...');
    }

    async goto() {
        await this.openPage('/mock-login');
        await this.expectToBeVisible();
    }

    async expectToBeVisible() {
        await expect(this.search).toBeVisible();
    }

    async searchFor(bestuur: string) {
        await this.search.fill(bestuur);
    }

    async login(bestuur: string){
        await this.page.getByText(bestuur).click();
    }

}