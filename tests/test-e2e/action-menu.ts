import {expect, Locator, Page} from "@playwright/test";


export class ActionMenu {

    private readonly page: Page;
    private readonly actionMenu: Locator;
    readonly productVerwijderenButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.actionMenu = page.getByRole('button', { name: 'Acties' });
        this.productVerwijderenButton = page.getByRole('menuitem', { name: 'Product verwijderen' })
    }

    async expectToBeVisible() {
        await expect(this.actionMenu).toBeVisible();
    }

    async open() {
        await this.actionMenu.click();
    }

}