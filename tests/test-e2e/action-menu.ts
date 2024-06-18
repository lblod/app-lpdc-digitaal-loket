import {expect, Locator, Page} from "@playwright/test";


export class ActionMenu {

    private readonly page: Page;
    readonly locator: Locator;
    readonly productVerwijderenButton: Locator;
    readonly bekijkEngelseVertalingButton: Locator;
    readonly bekijkEngelseVertalingNaPublicatieButton: Locator;
    readonly productKopierenButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.locator = page.getByRole('button', { name: 'Acties' });
        this.productVerwijderenButton = page.getByRole('menuitem', { name: 'Product verwijderen' })
        this.bekijkEngelseVertalingButton = page.getByRole('menuitem', { name: 'Bekijk Engelse vertaling' })
        this.bekijkEngelseVertalingNaPublicatieButton = page.getByRole('menuitem', { name: 'Engelse vertaling na publicatie' })
        this.productKopierenButton = page.getByRole('menuitem', { name: 'Product kopiëren' })
    }

    async expectToBeVisible() {
        await expect(this.locator).toBeVisible();
    }

}
