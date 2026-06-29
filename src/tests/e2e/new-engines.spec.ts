import { test, expect } from '@playwright/test';
import { resetDb } from '../resetDatabase';
import { createHandwritten, goto } from '../utils';

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
    await page.getByTestId('dropdown-option-ConEquip Parts & Equipment (14196)').click();
    await page.getByTestId('desc').fill('Test Engine');
    await page.getByTestId('price').fill('100');
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    
    await goto(page, '/');
    await page.getByTestId('engine-quotes-btn').click();
    await expect(page.getByTestId('quote-stock-num').first()).toHaveText(stockNum!);
  });
});

test.describe('Handwrittens', () => {
  test('Add engine to handwritten', async ({ page }) => {
    await createHandwritten(page, 'HEAVY DUTY REBUILDERS');
    await goto(page, '/engines/new-engine');
    await page.getByTestId('model-btn').first().click();

    await page.getByTestId('add-to-handwritten-btn').first().click();
    await page.getByTestId('select-handwritten-desc').fill('TEST');
    await page.getByTestId('select-handwritten-qty').fill('1');
    await page.getByTestId('select-handwritten-price').fill('15000');
    await page.getByTestId('select-handwritten-row').first().click();
    await page.getByTestId('select-handwritten-submit-btn').click();
    await page.waitForLoadState('networkidle');

    await goto(page, '/engines/new-engine');
    await page.waitForSelector('.new-engines-list');
    await page.getByTestId('model-btn').first().click();
    await page.waitForSelector('.new-engines-list');
    expect(page.getByTestId('engine-status').first()).toHaveText('HoldSoldRunner');
  });
});
