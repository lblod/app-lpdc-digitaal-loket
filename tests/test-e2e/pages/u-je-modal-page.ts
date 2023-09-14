import { AbstractPage } from "./abstract-page";
import { Locator, Page, expect } from '@playwright/test';

export class UJeModalPage extends AbstractPage {

    private readonly modalFrame: Locator;
    private readonly header: Locator;
    
    readonly laterKiezenButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.modalFrame = page.locator('.au-c-modal');
        this.header = page.getByText('Kiest jouw lokaal bestuur voor "je" of voor "u"?');
        this.laterKiezenButton = page.getByRole('button', { name: 'Later kiezen' });
    }

    public static create(page: Page): UJeModalPage {
        return new UJeModalPage(page);
    }

    async expectToBeVisible() {
        await expect(this.modalFrame).toBeVisible();
        await expect(this.header).toBeVisible();
    }

    async expectToBeClosed() {
        await expect(this.modalFrame).not.toBeAttached();
    }

}