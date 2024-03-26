import { Locator, Page } from "@playwright/test";
import { AbstractModal } from "./abstract-modal";

export class WijzigingenBewarenModal extends AbstractModal {

    readonly bewaarButton: Locator;

    private constructor(page: Page) {
        super(page, 'Wijzigingen bewaren?');

        this.bewaarButton = page.getByRole('button', { name: 'Bewaar' });
    }

    public static create(page: Page): WijzigingenBewarenModal {
        return new WijzigingenBewarenModal(page);
    }

}