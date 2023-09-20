import { Locator, LocatorScreenshotOptions, Page } from "@playwright/test";

export class Table {

    private readonly rows: Locator;

    constructor(page: Page) {
        this.rows = page.locator(`table > tbody > tr`);
    }

    row(row: number): Row {
        return new Row(this.rows.nth(row));
    }

}

export class Row {

    readonly locator: Locator;

    constructor(locator: Locator) {
        this.locator = locator;
    }

    link(title: string) {
        return this.locator.getByRole('link', { name: title });
    }

}

const first_row = 0;
const second_row = 1;

export { first_row, second_row }