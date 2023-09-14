import { test as base, expect } from '@playwright/test';
import { MockLoginPage } from './pages/mock-login-page';
import { LpdcHomePage } from './pages/lpdc-home-page';

export const test = base.extend({
    page: async ({ page }, use) => {

        const mlp = MockLoginPage.createForLpdc(page);
        await mlp.goto();
        await mlp.searchFor('Pepingen');
        await mlp.login('Gemeente Pepingen');

        await LpdcHomePage.create(page).expectToBeVisible();

        await use(page);
    },
});

export { expect } from '@playwright/test';