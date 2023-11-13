import { defineConfig } from '@playwright/test';
import type { TestOptions } from './test-api/test-helpers/test-options';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  testDir: './.',
  /* Run tests in files not in parallel */
  fullyParallel: false, // use true to run in parallel
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 2,
  /* Opt out of parallel tests. */
  workers: 1, // use 20 workers to simulate a load test
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', {  open: 'never' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: true
  },
  globalSetup: require.resolve('./global-setup'),
  timeout: 120000,
  expect: {
    timeout: 20000
  }
});
