import { Locator, Page, expect } from "@playwright/test";
import { AbstractPage } from "./abstract-page";
import {Alert} from "../components/alert";

export class ConceptDetailsPage extends AbstractPage {
    
    private readonly menuHeader: Locator;
    readonly heading: Locator; 
    readonly voegToeButton: Locator;
    readonly nieuwConceptAlert: Alert;
    readonly nieuwConceptAlertBerichtNietMeerTonenButton: Locator;
    readonly bekijkAndereConceptenButton: Locator;

    private constructor(page: Page) {
        super(page);

        this.menuHeader = page.getByRole('menuitem', { name: 'Concept details' });
        this.heading = page.getByRole('heading').first();
        this.voegToeButton = page.getByRole('link', { name: 'Voeg toe' });
        this.nieuwConceptAlert = new Alert(page, 'Dit is een nieuw product of dienst toegevoegd door IPDC');
        this.nieuwConceptAlertBerichtNietMeerTonenButton = this.nieuwConceptAlert.button('Dit bericht niet meer tonen');
        this.bekijkAndereConceptenButton = page.getByRole('link', { name: 'Bekijk andere concepten'});
    }

    static create(page: Page): ConceptDetailsPage {
        return new ConceptDetailsPage(page);
    }
    
    async expectToBeVisible() {
        await expect(this.menuHeader).toBeVisible();
    }


}