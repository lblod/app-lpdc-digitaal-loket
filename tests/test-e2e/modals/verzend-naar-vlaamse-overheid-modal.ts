import { Locator, Page } from "@playwright/test";
import { AbstractModal } from "./abstract-modal";

export class VerzendNaarVlaamseOverheidModal extends AbstractModal {

    readonly verzendNaarVlaamseOverheidButton: Locator;

    private constructor(page: Page) {
        super(page, 'Verzend naar Vlaamse overheid');

        this.verzendNaarVlaamseOverheidButton = page.getByRole('dialog').getByRole('button', { name: 'Verzend naar Vlaamse overheid' });
    }

    public static create(page: Page): VerzendNaarVlaamseOverheidModal {
        return new VerzendNaarVlaamseOverheidModal(page);
    }

}