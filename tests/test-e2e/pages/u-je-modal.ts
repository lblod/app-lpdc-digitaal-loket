import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class UJeModal extends AbstractModal {

    readonly laterKiezenButton: Locator;

    private constructor(page: Page) {
        super(page, 'Kiest jouw lokaal bestuur voor "je" of voor "u"?');

        this.laterKiezenButton = page.getByRole('button', { name: 'Later kiezen' });
    }

    public static create(page: Page): UJeModal {
        return new UJeModal(page);
    }


}