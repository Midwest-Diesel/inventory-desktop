import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
let page: Page;


test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('http://localhost:3001/engines/new-engine');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await page.getByTestId('model-btn').first().click();
});

test.describe('Quotes', () => {
  test('Create engine quote', async () => {
    await page.getByTestId('quote-btn').first().click();
    const stockNum = await page.getByTestId('stock-num-link').first().textContent();
    expect(stockNum).not.toBeNull();
    await page.getByTestId('customer-select').selectOption('ALTORFER INDUSTRIES INC.');
    await page.getByTestId('desc').fill('Test Engine');
    await page.getByTestId('price').fill('100');
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await page.goto('http://localhost:3001');
    await page.getByTestId('engine-quotes-btn').click();
    await expect(page.getByTestId('quote-stock-num').first()).toHaveText(stockNum!);
  });
});
