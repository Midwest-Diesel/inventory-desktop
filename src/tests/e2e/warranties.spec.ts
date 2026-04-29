import { test, expect } from '@playwright/test';
import { resetDb } from '../resetDatabase';
import { goto } from '../utils';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('test');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/warranties');
});


test.describe('Warranties', () => {
  test('Create warranty', async ({ page }) => {
    const oldWarranty = Number(await page.getByTestId('warranty-link').first().textContent());
    await page.getByTestId('new-btn').click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('warranty-link').first().click();

    const newWarranty = Number(await page.getByTestId('warranty-link').first().textContent());    
    expect(newWarranty).toEqual(oldWarranty + 1);
  });
});
