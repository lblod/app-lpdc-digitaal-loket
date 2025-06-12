import { Locator, Page } from "@playwright/test";
import { AbstractModal } from "./abstract-modal";

export class WijzigingenBewarenModal extends AbstractModal {

    readonly bewaarButton: Locator;
    readonly nietBewarenButton: Locator;

    private constructor(page: Page) {
        super(page, 'Wijzigingen bewaren?');

        this.bewaarButton = page.getByRole('button', { name: 'Bewaar' });
        this.nietBewarenButton = page.getByRole('button', { name: 'Niet bewaren' });
    }

    public static create(page: Page): WijzigingenBewarenModal {
        return new WijzigingenBewarenModal(page);
    }

}