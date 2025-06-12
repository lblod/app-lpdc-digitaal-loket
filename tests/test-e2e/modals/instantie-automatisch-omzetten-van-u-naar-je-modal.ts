import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class InstantieAutomatischOmzettenVanUNaarJeModal extends AbstractModal {

    readonly doorgaan: Locator;

    private constructor(page: Page) {
        super(page, 'Instantie automatisch omzetten naar de je-vorm?');

        this.doorgaan = page.locator("div.au-c-modal__footer button").first();
    }

    public static create(page: Page): InstantieAutomatischOmzettenVanUNaarJeModal {
        return new InstantieAutomatischOmzettenVanUNaarJeModal(page);
    }

}