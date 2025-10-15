import { test, expect } from '@playwright/test';
import { resetDb } from '../resetDatabase';
import { goto } from '../utils';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/warranties');
});


test.describe('Warranties', () => {
  test('Display warranties', async ({ page }) => {
    await page.waitForSelector('table tr');
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });
});
