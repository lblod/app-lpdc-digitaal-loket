import { test as base, expect } from '@playwright/test';

export const test = base.extend({
    page: async ({ baseURL, page }, use) => {
        await page.goto('http://localhost:4200/mock-login');

        await page.getByPlaceholder('Aalst, Berchem,...').fill('pepi');

        await expect(page.getByText('Gemeente Pepingen')).toBeVisible()
        await page.getByText('Gemeente Pepingen').click();

        await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible();

        await use(page);
    },
});
export { expect } from '@playwright/test';