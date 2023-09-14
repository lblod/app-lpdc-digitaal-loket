import { Locator, Page } from "@playwright/test";

export class Table {

    private readonly page: Page;
    private readonly rows: Locator;

    constructor(page: Page) {
        this.page = page;
        this.rows = page.locator(`table > tbody > tr`);
    }

    linkWithTextInRow(title: string, rowNmbr: number): Locator {
        return this.row(rowNmbr).getByRole('link', { name: title });
    }

    row(row: number): Locator {
        return this.rows.nth(row);
    }

}

const first_row = 0;
const second_row = 1;

export { first_row, second_row }