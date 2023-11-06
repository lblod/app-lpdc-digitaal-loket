import {Page} from '@playwright/test';

export abstract class AbstractPage {
    
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  abstract expectToBeVisible(): Promise<void>;

  async reloadUntil(assertion: () => Promise<void>) {
    const maxRefreshAttempts = 10;
    for (let i = 0; i < maxRefreshAttempts; i++) {
      await this.delay(5000);
      await this.page.reload();
      try {
        await assertion();
        return;
      } catch (e) {
        console.error('refresh until: assertion not met');
      }
    }
    throw Error(`refresh until: assertion not met after ${maxRefreshAttempts} attempts. ${assertion.toString()}`);
  }

  private delay(milliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }
}