import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ProductOfDienstOpnieuwBewerkenModal extends AbstractModal {

    readonly productOpnieuwBewerkenButton: Locator;

    private constructor(page: Page) {
        super(page, 'Product of dienst opnieuw bewerken?');

        this.productOpnieuwBewerkenButton = page.locator("div.au-c-modal__footer button").first();
    }

    public static create(page: Page): ProductOfDienstOpnieuwBewerkenModal {
        return new ProductOfDienstOpnieuwBewerkenModal(page);
    }

}