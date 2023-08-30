import {expect, test} from "@playwright/test";
import {loginAsPepingen} from "./test-helpers/login";
import UOrJeModal from "./test-helpers/u-or-je-modal";

test(`Concepts loaded form ldes-stream are visible on concept overview page`, async ({page}) => {
    await loginAsPepingen(page);

    await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible();
    await new UOrJeModal(page).choseLater();
    await page.getByRole('link', { name: 'Product of dienst toevoegen' }).click();

    await expect(page.getByText('Akte van Belgische nationaliteit')).toBeVisible();
    await expect(page.getByText('Concept 1 edited')).toBeVisible();

});