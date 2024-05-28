import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ConceptOvernemenModal extends AbstractModal {

    readonly meestRecenteConceptInput: Locator;
    readonly conceptWaaropInstantieGebaseerdIsInput: Locator;
    readonly instantieInput: Locator;

    readonly meestRecenteConceptRichText: Locator;
    readonly conceptWaaropInstantieGebaseerdIsRichText: Locator;
    readonly instantieRichText: Locator;

    readonly annuleerButton: Locator;

    private constructor(page: Page ) {
        super(page, 'Concept overnemen');

        this.meestRecenteConceptInput = this.inputBelow('Concept meest recente revisie');
        this.conceptWaaropInstantieGebaseerdIsInput = this.inputBelow('Concept waarop instantie gebaseerd is');
        this.instantieInput = this.inputBelow('Instantie');

        this.meestRecenteConceptRichText = this.richTextBelow('Concept meest recente revisie');
        this.conceptWaaropInstantieGebaseerdIsRichText = this.richTextBelow('Concept waarop instantie gebaseerd is');
        this.instantieRichText = this.richTextBelow('Instantie');

        this.annuleerButton = page.locator("div.au-c-modal__footer button").last();

    }

    public static create(page: Page): ConceptOvernemenModal {
        return new ConceptOvernemenModal(page);
    }

    private inputBelow(label: string): Locator {
        return this.page.getByLabel(label, { exact: true }).locator('input');
    }
    private richTextBelow(label: string): Locator {
        return this.page.getByLabel(label, { exact: true }).locator('p');
    }
}
