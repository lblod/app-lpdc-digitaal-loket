import {expect, Page, test} from "@playwright/test";

test('Scenario: Load concept from ldes-stream', async ({page}) => {
    await navigateToBaseUrl(page);
    await dismissUJeModal(page);
    await navigateFromInstanceOverviewToConceptOverview(page);

    await expect(page.getByText('Akte van Belgische nationaliteit')).toBeVisible();
    await expect(page.getByText('Concept 1 edited')).toBeVisible();
});

test('Scenario: Create instance from concept', async ({page}) => {
    await navigateToBaseUrl(page);
    await dismissUJeModal(page);
    await navigateFromInstanceOverviewToConceptOverview(page);

    // TODO


});

async function navigateToBaseUrl(page: Page) {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible();
}

async function dismissUJeModal(page: Page) {
    await expect(page.locator('.au-c-modal')).toBeVisible();
    await page.getByRole('button', { name: 'Later kiezen' }).click();
    await expect(page.locator('.au-c-modal')).not.toBeAttached();
}

async function navigateFromInstanceOverviewToConceptOverview(page: Page) {
    await page.getByRole('link', { name: 'Product of dienst toevoegen' }).click();
    await expect(page.getByRole('heading', { name: 'Product of dienst toevoegen' })).toBeVisible();
}
