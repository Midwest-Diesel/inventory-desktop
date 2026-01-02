import { formatDate } from '@/scripts/tools/stringUtils';
import { test, expect, Page } from '@playwright/test';
import { altSearch, goto } from '../utils';

test.describe.configure({ mode: 'serial' });
let page: Page;
let partNum = '';
let stockNum = '';
const stockNum2 = 'UP9014';
let qty = 0;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  page.on('dialog', (dialog) => dialog.accept('confirm'));
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/handwrittens');
});


test.describe('Basic Functionality', () => {
  test('Display handwrittens', async () => {
    await page.waitForLoadState('networkidle');
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create handwritten from customer', async () => {
    await goto(page, '/');
    await page.getByTestId('customer-input').fill('ALT');
    await page.getByTestId('customer-search-btn').click();
    await page.getByTestId('customer-row').first().click();
    await page.getByTestId('new-handwritten-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('bill-to-company')).toHaveValue('ALTORFER INDUSTRIES INC.');
    
    await page.getByTestId('tab').first().click();
    await page.getByTestId('add-item-btn').first().click();
    await page.getByTestId('select-handwritten-dialog').isVisible();
    await page.getByTestId('select-handwritten-row').first().click();
    await page.getByTestId('select-handwritten-desc').fill('ROCKER ARM');
    await page.getByTestId('select-handwritten-qty').fill('38');
    await page.getByTestId('select-handwritten-price').fill('80');
    await page.getByTestId('select-handwritten-submit-btn').click();
    await page.waitForTimeout(100);
    await (await page.$$('[data-testid="select-handwritten-dialog"] .checkbox-wrapper-4'))[1].click();
    await page.getByTestId('warranty-submit-btn').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('item-qty').first()).toHaveText('38');
  });

  test('Create blank handwritten', async () => {
    await goto(page, '/handwrittens');
    const prevId = await page.getByTestId('link').first().textContent() ?? '';
    await page.getByTestId('new-btn').click();
    await page.$('li').then((el) => el?.click());
    await (page.getByTestId('select-customer-dialog')).getByText('ALTORFER INDUSTRIES INC.').click();
    await page.getByTestId('customer-submit-btn').click();
    await page.waitForLoadState('networkidle');
    await page.reload();
    await expect(page.getByTestId('link').nth(1)).toBeVisible();
    await expect(page.getByTestId('link').nth(1)).toHaveText(prevId);
  });

  test('Edit handwritten', async () => {
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
    await page.getByTestId('no-changes-btn').click();
    await page.waitForSelector('[data-testid="edit-btn"]');
    await page.waitForLoadState('networkidle');

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
    expect(await page.getByTestId('date').textContent()).toEqual(formatDate(new Date()));
  });
});

test.describe('Handwritten items', () => {
  test('Add handwritten items', async () => {
    await goto(page, '/');
    partNum = await page.getByTestId('part-num-link').nth(1).textContent() ?? '';
    stockNum = await page.getByTestId('stock-num').nth(1).textContent() ?? '';
    qty = Number(await page.getByTestId('qty').nth(1).textContent());
    await page.getByTestId('add-item-btn').nth(1).click();
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

    await page.getByTestId('add-item-btn').nth(3).click();
    await page.getByTestId('select-handwritten-dialog').isVisible();
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
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('item-qty').first()).toHaveText('4');
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('item-delete-btn').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('item-desc').first()).toHaveText('TEST ITEM');
    expect(await page.getByTestId('order-notes').first().textContent()).toEqual('TEST WARRANTY\nCaterpillar warranty is not available on surplus engines and surplus parts.\nRebuilt Injectors come with a 6 month part replacement only warranty through Midwest Diesel, No labor or progressive damage.');
  });
});

test.describe('Cores', () => {
  test('Core charge', async () => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await page.getByTestId('core-charge-btn').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('item-part-num').first()).toHaveText('CORE DEPOSIT');
    await expect(page.getByTestId('item-stock-num').first()).toHaveText(stockNum);
  
    await goto(page, '/cores');
    await expect(page.getByTestId('part-num').first()).toHaveText(partNum);
  });

  test('Core deposit', async () => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await page.getByTestId('core-credit-btn').click();
    await (await page.$$('[data-testid="core-credits-dialog"] .checkbox-wrapper-4'))[0].click();
    await page.getByTestId('core-qty-input').focus();
    await page.keyboard.press('Enter');
    await page.getByTestId('core-credit-submit-btn').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('link').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await expect(page.getByTestId('item-stock-num').first()).toHaveText(stockNum);
    await expect(page.getByTestId('item-qty').first()).toHaveText('-1');
  });
});

test.describe('Takeoffs', () => {
  test('Create date code stockNum after takeoff', async () => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').nth(1).click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await expect(page.getByTestId('bill-to-company')).toHaveText('Rubber Duck Inc');
    await page.getByTestId('takeoff-input').fill(stockNum);
    await page.getByTestId('takeoff-input').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('takeoff-qty-input')).toHaveValue('6');
    await page.getByTestId('takeoff-submit-btn').click();
    await page.waitForTimeout(100);

    await goto(page, '/');
    await altSearch(page, { stockNum });
    await expect(page.getByTestId('qty').first()).toHaveText(`${qty - 6}`);
    await altSearch(page, { stockNum: `${stockNum} (${formatDate(new Date())})` });
    await expect(page.getByTestId('qty').first()).toHaveText(`${0}`);
    await expect(page.getByTestId('stock-num').first()).toHaveText(`${stockNum} (${formatDate(new Date())})`);
    await page.getByTestId('part-num-link').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('sold-date')).toHaveText(formatDate(new Date()));
    await expect(page.getByTestId('selling-price')).toHaveText('$100.00');
    await expect(page.getByTestId('sold-to')).toHaveText('Rubber Duck Inc');
    await expect(page.getByTestId('profit-margin')).toHaveText('$99.99');
    await expect(page.getByTestId('profit-percent')).toHaveText('99.99%');
  });

  test('Complete normal takeoff', async () => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').nth(2).click();
    await page.getByTestId('save-btn').click();
    await page.waitForTimeout(100);
    await expect(page.getByTestId('bill-to-company')).toHaveText('ALTORFER INDUSTRIES INC.');
    await page.getByTestId('takeoff-input').fill(stockNum2);
    await page.getByTestId('takeoff-input').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('takeoff-qty-input')).toHaveValue('38');
    await page.getByTestId('takeoff-submit-btn').click();
    await page.waitForTimeout(100);

    await goto(page, '/');
    await altSearch(page, { stockNum: stockNum2 });
    await expect(page.getByTestId('qty').first()).toHaveText('0');
    await expect(page.getByTestId('stock-num').first()).toHaveText(stockNum2);

    await page.getByTestId('part-num-link').first().click();
    await expect(page.getByTestId('qty-sold')).toHaveText('38');
    await expect(page.getByTestId('sold-date')).toHaveText(formatDate(new Date()));
    await expect(page.getByTestId('selling-price')).toHaveText('$80.00');
    await expect(page.getByTestId('sold-to')).toHaveText('ALTORFER INDUSTRIES INC.');
    await expect(page.getByTestId('profit-margin')).toHaveText('$80.00');
    await expect(page.getByTestId('profit-percent')).toHaveText('100%');
  });
});

test.describe('SENT TO ACCOUNTING', () => {
  test('Prompt for promotional materials', async () => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').nth(1).click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('item-cost').nth(1).fill('60');
    await page.getByTestId('sales-status').selectOption('SENT TO ACCOUNTING');
    await page.getByTestId('save-btn').click();

    await page.waitForSelector('[data-testid="promotional-dialog"]');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('mp-input').fill('1');
    await page.getByTestId('cap-input').fill('2');
    await page.getByTestId('br-input').fill('3');
    await page.getByTestId('fl-input').fill('4');
    await page.getByTestId('submit-btn').click();
    await page.getByTestId('shipping-list-submit-btn').click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('no-changes-btn').click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('mp')).toHaveText('1');
    await expect(page.getByTestId('cap')).toHaveText('2');
    await expect(page.getByTestId('br')).toHaveText('3');
    await expect(page.getByTestId('fl')).toHaveText('4');
  });
});

test.describe('Clean up', () => {
  test('Delete handwritten', async () => {
    await goto(page, '/handwrittens');
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

    
    const oldIdLocator2 = page.getByTestId('link').first();
    await expect(oldIdLocator2).toBeVisible();
    const oldId2 = await oldIdLocator2.textContent();
  
    await oldIdLocator2.click();
    await page.waitForSelector('[data-testid="delete-btn"]');
    await page.getByTestId('delete-btn').click();
  
    const newIdLocator2 = page.getByTestId('link').first();
    await expect(newIdLocator2).toBeVisible();
    const newId2= await newIdLocator2.textContent();
    expect(newId2).not.toEqual(oldId2);
  });
});
