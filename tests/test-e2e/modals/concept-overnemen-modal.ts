import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ConceptOvernemenModal extends AbstractModal {

    readonly meestRecenteConceptInput: Locator;
    readonly conceptWaaropInstantieIsGebaseerdInput: Locator;
    readonly instantieInput: Locator;

    readonly meestRecenteConceptRichTextReadonly: Locator;
    readonly conceptWaaropInstantieIsGebaseerdRichTextReadonly: Locator;
    readonly instantieRichText: Locator;

    readonly overnemenLink: Locator;

    readonly bewaarButton: Locator;
    readonly annuleerButton: Locator;

    private constructor(page: Page) {
        super(page, 'Concept overnemen');

        this.meestRecenteConceptInput = this.inputBelow('Meest recente concept');
        this.conceptWaaropInstantieIsGebaseerdInput = this.inputBelow('Concept waarop instantie is gebaseerd');
        this.instantieInput = this.inputBelow('Instantie');

        this.meestRecenteConceptRichTextReadonly = this.readonlyRichTextBelow('Meest recente concept');
        this.conceptWaaropInstantieIsGebaseerdRichTextReadonly = this.readonlyRichTextBelow('Concept waarop instantie is gebaseerd');
        this.instantieRichText = this.richTextBelow('Instantie');

        this.overnemenLink = this.page.getByRole('link', { name: 'Overnemen', exact: true });

        this.bewaarButton = page.locator("div.au-c-modal__footer button").first();
        this.annuleerButton = page.locator("div.au-c-modal__footer button").last();
    }

    public static create(page: Page): ConceptOvernemenModal {
        return new ConceptOvernemenModal(page);
    }

    private inputBelow(label: string): Locator {
        return this.page.locator(`div.au-c-modal__body input:below(label:has-text('${label}'))`).first();
    }

    private readonlyRichTextBelow(label: string): Locator {
        return this.page.locator(`div.au-c-modal__body div.rich-text-editor-content:below(label:has-text('${label}'))`).first();
    }

    private richTextBelow(label: string): Locator {
        return this.page.locator(`div.au-c-modal__body div.ProseMirror:below(label:has-text('${label}'))`).first();
    }
}
