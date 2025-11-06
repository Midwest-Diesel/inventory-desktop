import { test, expect } from '@playwright/test';
import { resetDb } from '../resetDatabase';
import { goto } from '../utils';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/purchase-orders');
});


test.describe('Basic Functionality', () => {
  test('Display purchase orders', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create new purchase order', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept('123456789'));
    await page.getByTestId('new-btn').click();
    await expect(page.getByTestId('po-num-link').first()).toHaveText('123456789');
  });

  test('Edit purchase order', async ({ page }) => {
    await page.getByTestId('po-num-link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('purchased-for').fill('stock');
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('purchased-for')).toHaveText('stock');
  });

  test('Delete purchase order', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept('confirm'));
    const poNum = await page.getByTestId('po-num-link').nth(1).textContent();
    await page.getByTestId('po-num-link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('delete-btn').click();
    expect(poNum).toBeTruthy();
    await expect(page.getByTestId('po-num-link').first()).toHaveText(poNum!);
  });
});
