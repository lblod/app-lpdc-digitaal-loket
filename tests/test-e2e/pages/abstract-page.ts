import {Locator, Page} from '@playwright/test';

export abstract class AbstractPage {
    
  protected readonly page: Page;

  private readonly baseURL;

  protected constructor(page: Page, baseURL: string) {
    this.page = page;
    this.baseURL = baseURL;
  }

  protected async openPage(path: string) {
      await this.page.goto(`${this.baseURL}${path}`);
  }

  abstract expectToBeVisible(): Promise<void>;

}