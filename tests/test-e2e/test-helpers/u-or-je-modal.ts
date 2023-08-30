import {expect, Page} from "@playwright/test";


export default class UOrJeModal {

    constructor(private page: Page) {
    }

    async choseLater() {
        await expect(this.page.locator('.au-c-modal')).toBeVisible();
        await this.page.getByRole('button', { name: 'Later kiezen' }).click();
        await expect(this.page.locator('.au-c-modal')).not.toBeAttached();
    }
}
