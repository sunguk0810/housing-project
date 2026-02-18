import { defineConfig } from '@playwright/test';

const PORT = process.env.TEST_PORT ?? '3000';
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `${BASE_URL}/search`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
