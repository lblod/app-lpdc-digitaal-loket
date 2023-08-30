import {expect, test} from "@playwright/test";

test(`Login`, async ({page}) => {
    await page.goto('http://localhost:4200/');

    await page.locator('#ember133').click();

    await expect(page.getByRole('heading', { name: 'Kies een bestuurseenheid om mee in te loggen.' })).toBeVisible();
    await page.getByPlaceholder('Aalst, Berchem,...').fill('pepi');

    await expect(page.getByText('Gemeente Pepingen')).toBeVisible()
    await page.getByText('Gemeente Pepingen').click();

    await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible()
});