import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!import.meta.env.CI,
  retries: import.meta.env.CI ? 2 : 0,
  workers: import.meta.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run tauri dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !import.meta.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
