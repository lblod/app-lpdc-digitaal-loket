import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ConceptOvernemenModal extends AbstractModal {

    readonly meestRecenteConceptInput: Locator;
    readonly conceptWaaropInstantieGebaseerdIsInput: Locator;
    readonly instantieInput: Locator;

    readonly annuleerButton: Locator;

    private constructor(page: Page) {
        super(page, 'Concept overnemen');

        this.meestRecenteConceptInput = this.inputBelow('Meest recente concept');
        this.conceptWaaropInstantieGebaseerdIsInput = this.inputBelow('Concept waarop instantie is gebaseerd');
        this.instantieInput = this.inputBelow('Instantie');

        this.annuleerButton = page.locator("div.au-c-modal__footer button").last();

    }

    public static create(page: Page): ConceptOvernemenModal {
        return new ConceptOvernemenModal(page);
    }

    private inputBelow(label: string): Locator {
        return this.page.locator(`input:below(label:text-is('${label}'))`)
    }

}