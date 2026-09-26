import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30 * 60 * 1000,
  expect: { timeout: 15_000 },
  reporter: [['line'], ['html', { open: 'never' }]],
  outputDir: 'artifacts/browser/run-output',
  use: {
    baseURL: process.env.BASELINE_URL || 'http://127.0.0.1:3000',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    browserName: 'chromium',
    colorScheme: 'light',
    deviceScaleFactor: 1,
    locale: 'en-US',
    reducedMotion: 'no-preference',
    trace: 'off',
    video: 'off',
  },
  webServer: process.env.BASELINE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});