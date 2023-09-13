import { test as base, expect } from '@playwright/test';
import { lpdcUrl } from '../test-api/test-helpers/test-options';
import { MockLoginPage } from './pages/mock-login-page';

export const test = base.extend({
    page: async ({ baseURL, page }, use) => {
        const mlp = new MockLoginPage(page, lpdcUrl);
        mlp.goto();
        mlp.searchFor('Pepingen');
        mlp.login('Gemeente Pepingen');
        
        await expect(page.getByRole('heading', { name: 'Lokale Producten- en Dienstencatalogus' })).toBeVisible();

        await use(page);
    },
});
export { expect } from '@playwright/test';