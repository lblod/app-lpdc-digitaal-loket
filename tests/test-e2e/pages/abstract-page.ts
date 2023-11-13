import {Page} from '@playwright/test';

export abstract class AbstractPage {
    
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  abstract expectToBeVisible(): Promise<void>;

  async reloadUntil(assertion: () => Promise<void>) {
    const maxRefreshAttempts = 60;
    for (let i = 0; i < maxRefreshAttempts; i++) {
      await this.page.reload();
      await this.delay(1000);
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