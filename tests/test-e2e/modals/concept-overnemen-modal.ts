import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ConceptOvernemenModal extends AbstractModal {

    readonly volledigOvernemen: Locator;
    readonly perVeldBekijken: Locator;
    readonly annuleren: Locator;

    private constructor(page: Page) {
        super(page, 'wijzigingen overnemen');

        this.volledigOvernemen = page.locator("div.au-c-modal__footer button").first();
        this.perVeldBekijken = page.locator("div.au-c-modal__footer button").nth(1);
        this.annuleren = page.locator("div.au-c-modal__footer button").last();
    }

    public static create(page: Page): ConceptOvernemenModal {
        return new ConceptOvernemenModal(page);
    }

}
