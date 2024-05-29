import { MultiSelect } from "../components/multi-select";
import { Select } from "../components/select";
import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';

export class ConceptOvernemenModal extends AbstractModal {

    readonly meestRecenteConceptInput: Locator;
    readonly conceptWaaropInstantieIsGebaseerdInput: Locator;
    readonly instantieInput: Locator;

    readonly meestRecenteConceptRichTextReadonly: Locator;
    readonly conceptWaaropInstantieIsGebaseerdRichTextReadonly: Locator;
    readonly instantieRichText: Locator;

    readonly meestRecenteConceptSelect: Select;
    readonly conceptWaaropInstantieIsGebaseerdSelect: Select;
    readonly instantieSelect: Select;

    readonly meestRecenteConceptMultiSelect: MultiSelect;
    readonly conceptWaaropInstantieIsGebaseerdMultiSelect: MultiSelect;
    readonly instantieMultiSelect: MultiSelect;

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

        this.meestRecenteConceptSelect = new Select(page, 'Meest recente concept', undefined, undefined, 'div.au-c-modal__body');
        this.conceptWaaropInstantieIsGebaseerdSelect = new Select(page, 'Concept waarop instantie is gebaseerd', undefined, undefined, 'div.au-c-modal__body');
        this.instantieSelect = new Select(page, 'Instantie', undefined, undefined, 'div.au-c-modal__body');

        this.meestRecenteConceptMultiSelect = new MultiSelect(page, 'Meest recente concept', 'div.au-c-modal__body');
        this.conceptWaaropInstantieIsGebaseerdMultiSelect = new MultiSelect(page, 'Concept waarop instantie is gebaseerd', 'div.au-c-modal__body');
        this.instantieMultiSelect = new MultiSelect(page, 'Instantie', 'div.au-c-modal__body span.instantie-form');

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
