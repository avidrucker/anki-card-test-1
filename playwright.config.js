import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:15173/anki-card-test-1/',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npx vite --port 15173 --strictPort',
    url: 'http://localhost:15173/anki-card-test-1/',
    reuseExistingServer: false,
  },
});
