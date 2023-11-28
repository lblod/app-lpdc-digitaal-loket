import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ProductOfDienstVerwijderenModal extends AbstractModal {

    readonly verwijderenButton: Locator;

    private constructor(page: Page) {
        super(page, 'Product of dienst verwijderen?');

        this.verwijderenButton = page.getByRole('button', { name: 'Verwijderen', exact: true });
    }

    public static create(page: Page): ProductOfDienstVerwijderenModal {
        return new ProductOfDienstVerwijderenModal(page);
    }

}