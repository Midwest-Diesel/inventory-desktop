import { test, expect, Page } from '@playwright/test';
import { altSearch, goto } from '../utils';
import { resetDb } from '../resetDatabase';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('test');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/add-ons/shop/part');
  page.on('dialog', (dialog) => dialog.accept());
});


async function newAddon(page: Page, part: string, qtyValue: number) {
  const qty = page.getByTestId('qty').first();
  const partNum = page.getByTestId('part-num').first();
  const desc = page.getByTestId('desc').first();

  await page.getByTestId('new-part-btn').click();
  await expect(qty).toHaveValue('');
  await qty.fill(qtyValue.toString());
  await expect(qty).toHaveValue(qtyValue.toString());
  await partNum.fill(part);
  await page.keyboard.press('Tab');

  await expect(desc).not.toHaveValue('', { timeout: 10000 });
  await page.getByTestId('save-btn').click();
}

function formatDateStockNum(prefix: string, suffix: string) {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(2);
  const day = date.getDate();
  return `${prefix}${month}${year}-${day}${suffix}`;
}


test.describe('Create addon and add to inventory', () => {
  test('Create new add on', async ({ page }) => {
    await newAddon(page, '4700', 100);
    await expect(page.getByTestId('desc').first()).toHaveValue('INJECTOR C9');
    await expect(page.getByTestId('qty').first()).toHaveValue('100');
  });

  test('Set rating from remarks', async ({ page }) => {
    await newAddon(page, '4700', 1);
    const remarks = page.getByTestId('remarks').first();
    const rating = page.getByTestId('rating').first();

    await remarks.fill('(9.5) TEST');
    await remarks.press('Tab');
    await expect(rating).toHaveValue('9.5', { timeout: 10000 });
  });

  test('Autofill stock number', async ({ page }) => {
    await newAddon(page, '4700', 1);
    const engineNum = page.getByTestId('engine-num').first();
    const stock = page.getByTestId('stock-num').first();

    await engineNum.fill('7259');
    await engineNum.fill('7259');

    await expect(engineNum).toHaveValue('7259');
    await engineNum.press('Tab');
    await expect(stock).toHaveValue('INJ7259', { timeout: 10000 });
  });

  test('Autofill stock number with engine number 0', async ({ page }) => {
    await newAddon(page, '4700', 1);
    const engineNum = page.getByTestId('engine-num').first();
    
    await engineNum.fill('0');
    await engineNum.blur();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('stock-num').first()).toHaveValue('UP12616');
  });

  test('Autofill stock number with engine number 1', async ({ page }) => {
    await newAddon(page, '4700', 1);
    const stockNum = page.getByTestId('stock-num').first();
    const engineNum = page.getByTestId('engine-num').first();

    await engineNum.fill('1');
    await engineNum.fill('1');
    await engineNum.blur();
    await expect(stockNum).toHaveValue(formatDateStockNum('INJ', 'A'), { timeout: 10000 });
  });

  test('Get next stock number suffix with engine number 1', async ({ page }) => {
    await newAddon(page, '4700', 1);
    const engineNum = page.getByTestId('engine-num').first();
    const stockNum = page.getByTestId('stock-num').first();

    await engineNum.fill('1');
    await engineNum.fill('1');
    await engineNum.blur();
    await expect(stockNum).toHaveValue(formatDateStockNum('INJ', 'A'));

    await page.getByTestId('duplicate-btn').first().click();
    await engineNum.fill('1');
    await engineNum.fill('1');
    await engineNum.blur();
    await expect(stockNum).toHaveValue(formatDateStockNum('INJ', 'B'));
  });

  test('Send to office addons', async ({ page }) => {
    await newAddon(page, '4700', 1);
    const engineNum = page.getByTestId('engine-num').first();
    const stockNum = page.getByTestId('stock-num').first();

    await engineNum.fill('1');
    await engineNum.fill('1');
    await engineNum.blur();

    const stockNumValue = formatDateStockNum('INJ', 'A');
    await expect(stockNum).toHaveValue(stockNumValue);

    await page.getByTestId('print-btn').first().click();
    await page.waitForLoadState('networkidle');
    await goto(page, '/add-ons/office/part');
    await expect(stockNum).toBeVisible();
    await expect(stockNum).toHaveValue(formatDateStockNum('INJ', 'A'));

    await page.getByTestId('add-to-inventory-btn').first().click();
    await page.waitForLoadState('networkidle');

    await goto(page, '/');
    await altSearch(page, { stockNum: stockNumValue });
    const result = page.getByTestId('stock-num').first();
    await expect(result).toHaveText(stockNumValue);
  });
});
