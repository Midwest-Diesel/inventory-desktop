import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });


test.describe('Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/warranties');
    await page.getByTestId('username').fill('bennett');
    await page.getByTestId('login-btn').click();
    await page.waitForSelector('.navbar');
  });

  test('Display warranties', async ({ page }) => {
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });
});
