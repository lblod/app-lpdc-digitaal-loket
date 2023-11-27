import {Page} from '@playwright/test';
import {wait} from "../shared/shared";

export abstract class AbstractPage {
    
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  abstract expectToBeVisible(): Promise<void>;

  async reloadUntil(assertion: () => Promise<void>) {
    const maxReloadAttempts = 60;
    for (let i = 0; i < maxReloadAttempts; i++) {
      await this.page.reload();
      await wait(1000);
      try {
        await assertion();
        return;
      } catch (e) {
        console.error(`reload until: assertion not met, retrying ... ${assertion.toString()}`);
      }
    }
    throw Error(`reload until: assertion not met after ${maxReloadAttempts} attempts. ${assertion.toString()}`);
  }
}