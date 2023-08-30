import { test as setup, expect } from '@playwright/test';

const userFile = 'playwright/.auth/user.json';

setup('authenticate as Pepingen', async ({ page }) => {
    await page.goto('http://localhost:4200/mock-login');

    await page.getByPlaceholder('Aalst, Berchem,...').fill('pepi');

    await expect(page.getByText('Gemeente Pepingen')).toBeVisible()
    await page.getByText('Gemeente Pepingen').click();

    await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible();

    await page.context().storageState({ path: userFile });
});