import { test, expect, Page } from '@playwright/test';
import { altSearch, goto } from '../utils';
import { resetDb } from '../resetDatabase';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/add-ons/shop/part');
  page.on('dialog', (dialog) => dialog.accept());
});


async function newAddon(page: Page) {
  await page.getByTestId('new-part-btn').click();
  await page.waitForLoadState('networkidle');
  await page.reload();
  await page.getByTestId('qty').first().fill('1');
  await page.getByTestId('part-num').first().fill('4700');
  await page.keyboard.down('Tab');
  await page.getByTestId('save-btn').click();
  await page.waitForTimeout(100);
}

function formatDateStockNum(suffix: string) {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(2);
  const day = date.getDate();
  return `INJ${month}${year}-${day}${suffix}`;
}


test.describe('Create addon and add to inventory', () => {
  test('Create new add on', async ({ page }) => {
    await page.getByTestId('new-part-btn').click();
    await page.reload();
    await page.getByTestId('qty').first().fill('1');
    await page.getByTestId('save-btn').click();
    await page.reload();
    await expect(page.getByTestId('qty').first()).toHaveValue('1');
  });

  test('Autofill part number', async ({ page }) => {
    await page.getByTestId('part-num').first().fill('470');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('part-num').first()).toHaveValue('4700245');
    await expect(page.getByTestId('desc').first()).toHaveValue('INJECTOR C9');
  });

  test('Set rating from remarks', async ({ page }) => {
    await newAddon(page);
    await page.getByTestId('remarks').first().fill('(9.5) TEST');
    await page.keyboard.down('Tab');
    await expect(page.getByTestId('rating').first()).toHaveValue('9.5');
  });

  test('Autofill stock number', async ({ page }) => {
    await newAddon(page);
    await page.getByTestId('engine-num').first().fill('5168');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue('INJ5168');
  });

  test('Autofill stock number with engine number 0', async ({ page }) => {
    await page.getByTestId('engine-num').first().fill('0');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue('UP21372');
  });

  test('Autofill stock number with engine number 1', async ({ page }) => {
    await newAddon(page);
    await page.getByTestId('engine-num').first().fill('1');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue(formatDateStockNum('A'));
  });

  test('Get next stock number suffix with engine number 1', async ({ page }) => {
    await newAddon(page);
    await page.getByTestId('engine-num').first().fill('1');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue(formatDateStockNum('A'));

    await page.getByTestId('duplicate-btn').first().click();
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('engine-num').first().fill('1');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue(formatDateStockNum('B'));
  });

  test('Send to office addons', async ({ page }) => {
    await newAddon(page);
    await page.getByTestId('engine-num').first().fill('1');
    await page.keyboard.down('Tab');
    await page.getByTestId('print-btn').first().click();
    await page.waitForLoadState('networkidle');
    await goto(page, '/add-ons/office/part');
    await expect(page.getByTestId('stock-num').first()).toHaveValue(formatDateStockNum('A'));

    // Add to inventory
    await page.getByTestId('add-to-inventory-btn').first().click();
    await page.waitForLoadState('networkidle');
    await goto(page, '/');

    const stockNum = formatDateStockNum('A');
    await altSearch(page, { stockNum });
    await expect(page.getByTestId('stock-num').first()).toHaveText(stockNum);
  });
});
