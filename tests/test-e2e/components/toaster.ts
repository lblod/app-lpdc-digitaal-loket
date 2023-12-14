import {Locator, Page} from "@playwright/test";


export class Toaster {

    private readonly page: Page;
    readonly message: Locator;
    readonly closeButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.message = page.locator('div.au-c-toaster div.au-c-alert__message p')
        this.closeButton = page.locator('div.au-c-toaster button:has-text("sluit")')
    }

}