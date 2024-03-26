import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import {dashboardUrl, lpdcUrl} from "../../test-api/test-helpers/test-options";

export class MockLoginPage extends AbstractPage {

    readonly searchInput: Locator;
    private readonly baseURL: string;

    private constructor(page: Page, baseURL: string) {
        super(page);

        this.baseURL = baseURL;
        this.searchInput = page.getByPlaceholder('Aalst, Berchem');
    }

    static createForLpdc(page: Page): MockLoginPage {
        return new MockLoginPage(page, lpdcUrl);
    }

    static createForDashboard(page: Page): MockLoginPage {
        return new MockLoginPage(page, dashboardUrl);
    }

    async goto() {
        await this.page.goto(`${this.baseURL}/mock-login`)
        await this.expectToBeVisible();
    }

    async expectToBeVisible() {
        await expect(this.searchInput).toBeVisible();
    }

    async login(bestuur: string){
        await this.page.getByText(bestuur).click();
    }

}