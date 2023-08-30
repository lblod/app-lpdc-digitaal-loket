import {expect, Page} from "@playwright/test";


export async function loginAsPepingen(page: Page) {
    await page.goto('http://localhost:4200/mock-login');

    await expect(page.getByRole('heading', { name: 'Kies een bestuurseenheid om mee in te loggen.' })).toBeVisible();
    await page.getByPlaceholder('Aalst, Berchem,...').fill('pepi');

    await expect(page.getByText('Gemeente Pepingen')).toBeVisible()
    await page.getByText('Gemeente Pepingen').click();

    await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible();

}