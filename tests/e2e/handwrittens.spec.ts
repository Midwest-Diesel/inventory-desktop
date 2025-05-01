import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
let partNum = '';
let stockNum = '';


test.describe('Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/handwrittens');
    await page.getByTestId('username').fill('bennett');
    await page.getByTestId('login-btn').click();
    await page.waitForSelector('.navbar');
  });

  test('Display handwrittens', async ({ page }) => {
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create blank handwritten', async ({ page }) => {
    const prevId = await page.getByTestId('link').first().textContent() ?? '';
    await page.getByTestId('new-btn').click();
    await page.$('li').then((el) => el?.click());
    await (page.getByTestId('select-customer-dialog')).getByText(' J Lee Trucking').click();
    await page.getByTestId('customer-submit-btn').click();
    await page.waitForTimeout(500);
    await page.reload();

    await expect(page.getByTestId('link').nth(1)).toBeVisible();
    await expect(page.getByTestId('link').nth(1)).toHaveText(prevId);
  });

  test('Edit handwritten', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByTestId('link').first().click();
    await page.getByTestId('po-num').fill('T104B6');
    await page.getByTestId('source').selectOption('Netcom');
    await page.getByTestId('contact').fill('Bill');
    await page.getByTestId('bill-to-company').fill('Rubber Duck Inc');
    await page.getByTestId('bill-to-address').fill('4495 Lake Ave S');
    await page.getByTestId('bill-to-address-2').fill('#425');
    await page.getByTestId('bill-to-city').fill('White Bear Lake');
    await page.getByTestId('bill-to-state').fill('MN');
    await page.getByTestId('bill-to-zip').fill('55110');
    await page.getByTestId('bill-to-phone').fill('(651) 272-3618');
    await page.getByTestId('ship-to-company').fill('Rubber Duck Inc');
    await page.getByTestId('ship-to-address').fill('4495 Lake Ave S');
    await page.getByTestId('ship-to-address-2').fill('#425');
    await page.getByTestId('ship-to-city').fill('White Bear Lake');
    await page.getByTestId('ship-to-state').fill('MN');
    await page.getByTestId('ship-to-zip').fill('55110');
    await page.getByTestId('ship-via').selectOption('UPS Freight');
    await page.getByTestId('attn-to').fill('Bob');
    await page.getByTestId('contact-phone').fill('(488) 371-9460');
    await page.getByTestId('shipping-notes').fill('Test');
    await page.getByTestId('save-btn').click();
    await page.waitForTimeout(100);
    await page.getByTestId('no-changes-btn').click();
    await page.waitForSelector('[data-testid="edit-btn"]');
    await page.waitForTimeout(500);

    expect(await page.getByTestId('po-num').textContent()).toEqual('T104B6');
    expect(await page.getByTestId('source').textContent()).toEqual('Netcom');
    expect(await page.getByTestId('contact').textContent()).toEqual('Bill');
    expect(await page.getByTestId('bill-to-company').textContent()).toEqual('Rubber Duck Inc');
    expect(await page.getByTestId('bill-to-address').textContent()).toEqual('4495 Lake Ave S');
    expect(await page.getByTestId('bill-to-address-2').textContent()).toEqual('#425');
    expect(await page.getByTestId('bill-to-city').textContent()).toEqual('White Bear Lake');
    expect(await page.getByTestId('bill-to-state').textContent()).toEqual('MN');
    expect(await page.getByTestId('bill-to-zip').textContent()).toEqual('55110');
    expect(await page.getByTestId('bill-to-phone').textContent()).toEqual('(651) 272-3618');
    expect(await page.getByTestId('ship-to-company').textContent()).toEqual('Rubber Duck Inc');
    expect(await page.getByTestId('ship-to-address').textContent()).toEqual('4495 Lake Ave S');
    expect(await page.getByTestId('ship-to-address-2').textContent()).toEqual('#425');
    expect(await page.getByTestId('ship-to-city').textContent()).toEqual('White Bear Lake');
    expect(await page.getByTestId('ship-to-state').textContent()).toEqual('MN');
    expect(await page.getByTestId('ship-to-zip').textContent()).toEqual('55110');
    expect(await page.getByTestId('ship-via').textContent()).toEqual('UPS Freight');
    expect(await page.getByTestId('attn-to').textContent()).toEqual('Bob');
    expect(await page.getByTestId('contact-phone').textContent()).toEqual('(488) 371-9460');
    expect(await page.getByTestId('shipping-notes').textContent()).toEqual('Test');
  });
});

test.describe('Handwritten items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/handwrittens');
    await page.getByTestId('username').fill('bennett');
    await page.getByTestId('login-btn').click();
    await page.waitForSelector('.navbar');
  });

  test('Add handwritten items', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('http://localhost:3000');
    partNum = await page.getByTestId('part-num-link').first().textContent() ?? '';
    stockNum = await page.getByTestId('stock-num').first().textContent() ?? '';
    await page.getByTestId('add-item-btn').first().click();
    await page.getByTestId('select-handwritten-dialog').isVisible();
    await page.getByTestId('select-handwritten-row').first().click();
    await page.getByTestId('select-handwritten-desc').fill('TEST ITEM');
    await page.getByTestId('select-handwritten-qty').fill('6');
    await page.getByTestId('select-handwritten-price').fill('100');
    await page.getByTestId('select-handwritten-submit-btn').click();
    await page.getByTestId('warranty').fill('TEST WARRANTY');
    await (await page.$$('[data-testid="select-handwritten-dialog"] .checkbox-wrapper-4'))[0].click();
    await (await page.$$('[data-testid="select-handwritten-dialog"] .checkbox-wrapper-4'))[2].click();
    await page.getByTestId('warranty-submit-btn').click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('tab').first().click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-item-btn').nth(1).click();
    await page.getByTestId('select-handwritten-dialog').isVisible();
    await page.getByTestId('select-handwritten-row').first().click();
    await page.getByTestId('select-handwritten-desc').fill('DELETE THIS');
    await page.getByTestId('select-handwritten-qty').fill('2');
    await page.getByTestId('select-handwritten-price').fill('80');
    await page.getByTestId('select-handwritten-submit-btn').click();
    await page.getByTestId('warranty').fill('TEST WARRANTY');
    await (await page.$$('[data-testid="select-handwritten-dialog"] .checkbox-wrapper-4'))[1].click();
    await page.getByTestId('warranty-submit-btn').click();
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('item-qty').first().fill('4');
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();

    await expect(page.getByTestId('item-qty').first()).toHaveText('4');
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('item-delete-btn').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await expect(page.getByTestId('item-desc').first()).toHaveText('TEST ITEM');
    expect(await page.getByTestId('order-notes').first().textContent()).toEqual('TEST WARRANTY\nNo CAT Warranty\nInjector warranty');
  });

  test('Core charge', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByTestId('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await page.getByTestId('core-charge-btn').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('item-part-num').first()).toHaveText('CORE DEPOSIT');
    await expect(page.getByTestId('item-stock-num').first()).toHaveText(stockNum);

    await page.goto('http://localhost:3000/cores');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('part-num').first()).toHaveText(partNum);
  });
});

test.describe('Clean up', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/handwrittens');
    await page.getByTestId('username').fill('bennett');
    await page.getByTestId('login-btn').click();
    await page.waitForSelector('.navbar');
  });

  test('Delete handwritten', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept('confirm'));
    const oldIdLocator = page.getByTestId('link').first();
    await expect(oldIdLocator).toBeVisible();
    const oldId = await oldIdLocator.textContent();
  
    await oldIdLocator.click();
    await page.waitForSelector('[data-testid="save-btn"]');
    await page.getByTestId('stop-edit-btn').click();
    await page.getByTestId('delete-btn').click();
  
    const newIdLocator = page.getByTestId('link').first();
    await expect(newIdLocator).toBeVisible();
    const newId = await newIdLocator.textContent();
    expect(newId).not.toEqual(oldId);
  });
});
