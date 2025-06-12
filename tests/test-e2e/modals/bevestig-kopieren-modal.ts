import {AbstractModal} from "./abstract-modal";
import {Locator, Page} from "@playwright/test";


export class BevestigKopierenModal extends AbstractModal {

    readonly jaBestemdVoorFusie: Locator;
    readonly neeEnkelKopieren: Locator;
    readonly annuleer: Locator;

    private constructor(page: Page) {
        super(page, 'Product kopiëren');

        this.jaBestemdVoorFusie = page.locator(`div.au-c-modal__footer button:has-text('Ja, bestemd voor een fusie')`);
        this.neeEnkelKopieren = page.locator(`div.au-c-modal__footer button:has-text('Neen, enkel kopiëren')`);
        this.annuleer = page.locator(`div.au-c-modal__footer button:has-text('Annuleer')`);
    }

    public static create(page: Page): BevestigKopierenModal {
        return new BevestigKopierenModal(page);
    }
}