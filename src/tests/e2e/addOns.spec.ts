import { test, expect, Page } from '@playwright/test';
import { altSearch } from '../utils';

test.describe.configure({ mode: 'serial' });
let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('http://localhost:3001/add-ons/shop/part');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  page.on('dialog', (dialog) => dialog.accept());
});


test.describe('Create addon and add to inventory', () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(2);

  test('Create new add on', async () => {
    await page.getByTestId('new-part-btn').click();
    await page.reload();
    await page.getByTestId('qty').first().fill('1');
    await page.getByTestId('save-btn').click();
    await page.reload();
    await expect(page.getByTestId('qty').first()).toHaveValue('1');
  });

  test('Autofill part number', async () => {
    await page.getByTestId('part-num').first().fill('4563');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('part-num').first()).toHaveValue('4563509');
    await expect(page.getByTestId('desc').first()).toHaveValue('INJECTOR C9');
  });

  test('Autofill stock number', async () => {
    await page.getByTestId('engine-num').first().fill('5168');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue('IGP5168');
  });

  test('Autofill stock number with engine number 0', async () => {
    await page.getByTestId('engine-num').first().fill('0');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue('UP20912');
  });

  test('Autofill stock number with engine number 1', async () => {
    await page.getByTestId('engine-num').first().fill('1');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue(`IGP${month}${year}-${date.getDate()}A`);
  });

  test('Get next stock number suffix with engine number 1', async () => {
    await page.getByTestId('duplicate-btn').first().click();
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.getByTestId('engine-num').first().fill('1');
    await page.keyboard.down('Tab');
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('stock-num').first()).toHaveValue(`IGP${month}${year}-${date.getDate()}B`);
  });

  test('Send to office addons', async () => {
    await page.getByTestId('print-btn').first().click();
    await page.waitForLoadState('networkidle');
    await page.goto('http://localhost:3001/add-ons/office/part');
    await expect(page.getByTestId('stock-num').first()).toHaveValue(`IGP${month}${year}-${date.getDate()}B`);
  });

  test('Add to inventory', async () => {
    await page.getByTestId('add-to-inventory-btn').first().click();
    await page.waitForLoadState('networkidle');
    await page.goto('http://localhost:3001');

    const stockNum = `IGP${month}${year}-${date.getDate()}B`;
    await altSearch(page, { stockNum });
    await expect(page.getByTestId('stock-num').first()).toHaveText(stockNum);
  });
});


