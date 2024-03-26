import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class UJeModal extends AbstractModal {

    readonly mijnBestuurKiestVoorDeJeVormRadio: Locator;
    readonly mijnBestuurKiestVoorDeUVormRadio: Locator;
    readonly laterKiezenButton: Locator;
    readonly bevestigenButton: Locator;

    private constructor(page: Page) {
        super(page, 'Kiest jouw lokaal bestuur voor "je" of voor "u"?');

        this.mijnBestuurKiestVoorDeJeVormRadio = page.getByText('Mijn bestuur kiest voor de "je"-vorm');
        this.mijnBestuurKiestVoorDeUVormRadio = page.getByText('Mijn bestuur kiest voor de "u"-vorm');
        this.laterKiezenButton = page.getByRole('button', { name: 'Later kiezen' });
        this.bevestigenButton = page.getByRole('button', { name: 'Bevestigen' });
    }

    public static create(page: Page): UJeModal {
        return new UJeModal(page);
    }


}