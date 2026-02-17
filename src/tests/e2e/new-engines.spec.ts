import { test, expect } from '@playwright/test';
import { resetDb } from '../resetDatabase';
import { goto } from '../utils';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('test');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/engines/new-engine');
  await page.getByTestId('model-btn').first().click();
});


test.describe('Quotes', () => {
  test('Create engine quote', async ({ page }) => {
    await page.getByTestId('quote-btn').first().click();
    const stockNum = await page.getByTestId('stock-num-link').first().textContent();
    expect(stockNum).not.toBeNull();
    await (await page.$('.dropdown'))?.click();
    await page.getByTestId('dropdown-option-LKQ HEAVY DUTY REBUILDERS').click();
    await page.getByTestId('desc').fill('Test Engine');
    await page.getByTestId('price').fill('100');
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await goto(page, '/');
    await page.getByTestId('engine-quotes-btn').click();
    await expect(page.getByTestId('quote-stock-num').first()).toHaveText(stockNum!);
  });
});
