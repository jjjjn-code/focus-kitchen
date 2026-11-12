import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: {
    ...devices['iPhone 15'],
    // The iPhone profile defaults to WebKit; Chromium keeps local and CI setup simple.
    browserName: 'chromium',
    baseURL: 'http://localhost:4173/focus-kitchen/',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/focus-kitchen/',
    reuseExistingServer: !process.env.CI,
  },
});
