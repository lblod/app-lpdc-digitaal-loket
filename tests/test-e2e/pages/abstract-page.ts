import {Page} from '@playwright/test';
import {wait} from "../shared/shared";

export abstract class AbstractPage {
    
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  abstract expectToBeVisible(): Promise<void>;

  async reloadUntil(assertion: () => Promise<void>) {
    const maxReloadAttempts = 30;
    for (let i = 0; i < maxReloadAttempts; i++) {
      try {
      await this.page.reload();
      await wait(1000);
        await assertion();
        return;
      } catch (e) {
        console.error(`reload until: assertion not met, retrying ... ${assertion.toString()}`, e);
      }
    }
    throw Error(`reload until: assertion not met after ${maxReloadAttempts} attempts. ${assertion.toString()}`);
  }
}
