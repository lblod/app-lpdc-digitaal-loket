import { Locator, Page, expect } from "@playwright/test";

export abstract class AbstractModal {
    
    protected readonly page: Page;
    protected readonly modalFrame: Locator;
    protected readonly header: Locator;
  
    protected constructor(page: Page, modalTitleText: string) {
      this.page = page;
      this.modalFrame = page.locator('.au-c-modal');
      this.header = page.locator(`h1.au-c-modal__title:has-text('${modalTitleText}')`);
    }
  
    async expectToBeVisible() {
        await expect(this.modalFrame).toBeVisible();
        await expect(this.header).toBeVisible();
    }

    async expectToBeClosed() {
        await expect(this.modalFrame).not.toBeAttached();
    }
  
  }
