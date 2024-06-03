import { MultiSelect } from "../components/multi-select";
import { Select } from "../components/select";
import { AbstractModal } from "./abstract-modal";
import { Locator, Page } from '@playwright/test';
import moment from "moment";

export class ConceptOvernemenModal extends AbstractModal {

    readonly meestRecenteRevisieLabel: Locator;
    readonly conceptWaaropInstantieIsGebaseerdLabel: Locator;

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

    private constructor(page: Page, title: string, conceptWaaropInstantieIsGebaseerdGeneratedAt: string, meestRecenteRevisieGeneratedAt: string) {
        super(page, title);
        
        const meestRecenteRevisieFormSelector = `div.au-c-modal__body form[aria-label="Concept meest recente revisie"]`;
        const conceptWaaropInstantieIsGebaseerdFormSelector = `div.au-c-modal__body form[aria-label="Concept waarop instantie gebaseerd is"]`;
        const instantieFormSelector = `div.au-c-modal__body form[aria-label="Instantie"]`;

        this.meestRecenteRevisieLabel = this.page.getByText(`Meest recente concept (${moment(meestRecenteRevisieGeneratedAt).local().format('DD-MM-YYYY - HH:mm')})`);
        this.conceptWaaropInstantieIsGebaseerdLabel = this.page.getByText(`Concept waarop instantie is gebaseerd (${moment(conceptWaaropInstantieIsGebaseerdGeneratedAt).local().format('DD-MM-YYYY - HH:mm')})`);

        this.meestRecenteConceptInput = this.inputBelow(meestRecenteRevisieFormSelector, 'Meest recente concept');
        this.conceptWaaropInstantieIsGebaseerdInput = this.inputBelow(conceptWaaropInstantieIsGebaseerdFormSelector, 'Concept waarop instantie is gebaseerd');
        this.instantieInput = this.inputBelow(instantieFormSelector, 'Instantie');

        this.meestRecenteConceptRichTextReadonly = this.readonlyRichTextBelow(meestRecenteRevisieFormSelector, 'Meest recente concept');
        this.conceptWaaropInstantieIsGebaseerdRichTextReadonly = this.readonlyRichTextBelow(conceptWaaropInstantieIsGebaseerdFormSelector, 'Concept waarop instantie is gebaseerd');
        this.instantieRichText = this.richTextBelow(instantieFormSelector, 'Instantie');

        this.meestRecenteConceptSelect = new Select(page, 'Meest recente concept', undefined, undefined, meestRecenteRevisieFormSelector);
        this.conceptWaaropInstantieIsGebaseerdSelect = new Select(page, 'Concept waarop instantie is gebaseerd', undefined, undefined, conceptWaaropInstantieIsGebaseerdFormSelector);
        this.instantieSelect = new Select(page, 'Instantie', undefined, undefined, instantieFormSelector);

        this.meestRecenteConceptMultiSelect = new MultiSelect(page, 'Meest recente concept', meestRecenteRevisieFormSelector);
        this.conceptWaaropInstantieIsGebaseerdMultiSelect = new MultiSelect(page, 'Concept waarop instantie is gebaseerd', conceptWaaropInstantieIsGebaseerdFormSelector);
        this.instantieMultiSelect = new MultiSelect(page, 'Instantie', instantieFormSelector);

        this.overnemenLink = this.page.getByRole('link', { name: 'Overnemen', exact: true });

        this.bewaarButton = page.locator("div.au-c-modal__footer button").first();
        this.annuleerButton = page.locator("div.au-c-modal__footer button").last();
    }

    public static create(page: Page, titel: string, conceptWaaropInstantieIsGebaseerdGeneratedAt: string, meestRecenteRevisieGeneratedAt: string): ConceptOvernemenModal {
        return new ConceptOvernemenModal(page, titel, conceptWaaropInstantieIsGebaseerdGeneratedAt, meestRecenteRevisieGeneratedAt);
    }

    private inputBelow(formSelector: string, formLabel: string): Locator {
        return this.page.locator(`${formSelector} input:below(label:has-text('${formLabel}'))`).first();
    }

    private readonlyRichTextBelow(formSelector: string, label: string): Locator {
        return this.page.locator(`${formSelector} div.rich-text-editor-content:below(label:has-text('${label}'))`).first();
    }

    private richTextBelow(formSelector: string, label: string): Locator {
        return this.page.locator(`${formSelector} div.ProseMirror:below(label:has-text('${label}'))`).first();
    }
}
