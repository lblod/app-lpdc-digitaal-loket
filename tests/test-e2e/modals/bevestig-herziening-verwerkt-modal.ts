import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class BevestigHerzieningVerwerktModal extends AbstractModal {

    readonly jaVerwijderHerzieningNodigLabel: Locator;
    readonly nee: Locator;

    private constructor(page: Page) {
        super(page, 'Is deze herziening klaar?');

        this.jaVerwijderHerzieningNodigLabel = page.locator("div.au-c-modal__footer button").first();
        this.nee = page.locator("div.au-c-modal__footer button").last();
    }

    public static create(page: Page): BevestigHerzieningVerwerktModal {
        return new BevestigHerzieningVerwerktModal(page);
    }

}