import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import { lpdcUrl } from "../../test-api/test-helpers/test-options";

export class MockLoginPage extends AbstractPage {

    private readonly search: Locator;
    private readonly baseURL: string;

    private constructor(page: Page, baseURL: string) {
        super(page);

        this.baseURL = baseURL;
        this.search = page.getByPlaceholder('Aalst, Berchem,...');
    }

    static createForLpdc(page: Page): MockLoginPage {
        return new MockLoginPage(page, lpdcUrl);
    }

    async goto() {
        await this.page.goto(`${this.baseURL}/mock-login`)
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