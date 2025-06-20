import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
let page: Page;


test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('http://localhost:3001/engines/new-engine');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
});

test.describe('Quotes', () => {
  test('Create engine quote', async () => {
    await page.getByTestId('quote-btn').first().click();
    const stockNum = await page.getByTestId('stock-num-link').first().textContent();
    await page.waitForTimeout(100);
    expect(stockNum).not.toBeNull();
    await page.waitForSelector('[data-testid="customer-select"]');
    await page.getByTestId('customer-select').selectOption('5 STAR PARTS');
    await page.getByTestId('desc').fill('C-7 Engine');
    await page.getByTestId('price').fill('100');
    await page.getByTestId('save-btn').click();
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('engine-quotes-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('quote-stock-num').first()).toHaveText(stockNum ?? '');
  });
});
