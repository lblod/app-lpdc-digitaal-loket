import { Locator, Page, expect } from "@playwright/test";

export class Table {

    private readonly rows: Locator;
    private readonly headerLocator: Locator;
    readonly alertMessage: Locator;

    constructor(page: Page) {
        this.rows = page.locator(`table > tbody > tr`);
        this.headerLocator = page.locator(`table > thead > tr`);
        this.alertMessage = page.locator(`table > tr > td > div[role=alert]`);
    }

    header(): Header {
        return new Header(this.headerLocator);
    }

    row(row: number): Row {
        return new Row(this.rows.nth(row));
    }

}

export class Header {

    readonly locator: Locator;

    constructor(locator: Locator) {
        this.locator = locator;
    }

    cell(column: number): HeaderCell {
        return new HeaderCell(this.locator.locator('th').nth(column));
    }
}

export class HeaderCell {
    
    readonly locator: Locator;
    readonly sortUpIcon: Locator;
    readonly sortDownIcon: Locator;
    readonly sortUpDownIcon: Locator;

    constructor(locator: Locator) {
        this.locator = locator;
        this.sortUpIcon = this.locator.locator('svg.au-c-icon--nav-up');
        this.sortDownIcon = this.locator.locator('svg.au-c-icon--nav-down');
        this.sortUpDownIcon = this.locator.locator('svg.au-c-icon--nav-up-down');
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

    cell(column: number): Locator {
        return this.locator.locator('td').nth(column);
    }

    pill(label: string): Locator {
        return this.locator.locator(`.au-c-pill:has-text('${label}')`)
    }

}

const first_row = 0;
const second_row = 1;
const third_row = 2;
const fourth_row = 3;
const fifth_row = 4;
const sixth_row = 5;
const seventh_row = 6;
const eighth_row = 7;

const first_column = 0;
const second_column = 1;
const third_column = 2;
const fourth_column = 3;
const fifth_column = 4;
const sixth_column = 5;
const seventh_column = 6;
const eighth_column = 7;

export { first_row, second_row, third_row, fourth_row, fifth_row, sixth_row, seventh_row, eighth_row }
export { first_column, second_column, third_column, fourth_column, fifth_column, sixth_column, seventh_column, eighth_column }