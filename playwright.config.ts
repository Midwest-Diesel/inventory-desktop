import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  globalSetup: './src/tests/globalSetup.ts',
  testDir: './src/tests/e2e',
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
