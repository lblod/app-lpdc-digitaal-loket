import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class WijzigingenOvernemenModal extends AbstractModal {

    readonly conceptVolledigOvernemenButton: Locator;
    readonly wijzigingenPerVeldBekijkenButton: Locator;
    readonly annuleerButton: Locator;

    private constructor(page: Page) {
        super(page, 'Wijzigingen overnemen');

        this.conceptVolledigOvernemenButton = page.locator("div.au-c-modal__footer button").first();
        this.wijzigingenPerVeldBekijkenButton = page.locator("div.au-c-modal__footer button").nth(1);
        this.annuleerButton = page.locator("div.au-c-modal__footer button").last();
    }

    public static create(page: Page): WijzigingenOvernemenModal {
        return new WijzigingenOvernemenModal(page);
    }

}
