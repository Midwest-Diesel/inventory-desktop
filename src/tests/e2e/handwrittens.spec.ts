import { formatDate } from '@/scripts/tools/stringUtils';
import { test, expect, Page } from '@playwright/test';
import { altSearch, createHandwritten, goto } from '../utils';
import { resetDb } from '../resetDatabase';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('test');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/handwrittens');
  page.on('dialog', (dialog) => dialog.accept('confirm'));
});

const addHandwrittenItem = async (page: Page, rowIndex: number, desc: string, qty: number, price: number) => {
  await page.getByTestId('tab').first().click();
  await page.getByTestId('add-item-btn').nth(rowIndex).click();
  await page.getByTestId('select-handwritten-dialog').isVisible();
  await page.getByTestId('select-handwritten-row').first().click();
  await page.getByTestId('select-handwritten-desc').fill(desc);
  await page.getByTestId('select-handwritten-qty').fill(qty.toString());
  await page.getByTestId('select-handwritten-price').fill(price.toString());
  await page.getByTestId('select-handwritten-submit-btn').click();
  await page.waitForLoadState('networkidle');
};

const addWarranty = async (page: Page, checkboxIndexes: number[], customWarranty?: string) => {
  await page.waitForSelector('[data-testid="select-handwritten-dialog"] .checkbox-wrapper-4');
  for (const index of checkboxIndexes) {
    await (await page.$$('[data-testid="select-handwritten-dialog"] .checkbox-wrapper-4'))[index].click();
  }
  if (customWarranty) await page.getByTestId('warranty').fill(customWarranty);

  await page.getByTestId('warranty-submit-btn').click();
  await page.getByTestId('save-btn').waitFor();
};


test.describe('Basic Functionality', () => {
  test('Display handwrittens', async ({ page }) => {
    await page.waitForSelector('table tr');
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create handwritten from customer', async ({ page }) => {
    await createHandwritten(page, 'ConEquip');
    await expect(page.getByTestId('bill-to-company-input')).toHaveValue('ConEquip Parts & Equipment (14196)');
    
    await addHandwrittenItem(page, 0, 'VALVE COVER', 2, 180);
    await addWarranty(page, [1]);

    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('item-desc').first()).toHaveText('VALVE COVER');
    await expect(page.getByTestId('item-qty').first()).toHaveText('2');
    await expect(page.getByTestId('item-price').first()).toHaveText('$180.00');
  });

  test('Create blank handwritten', async ({ page }) => {
    await goto(page, '/handwrittens');
    const prevId = await page.getByTestId('link').first().textContent() ?? '';
    await page.getByTestId('new-btn').click();
    await page.$('li').then((el) => el?.click());
    await (page.getByTestId('select-customer-dialog')).getByText('ConEquip Parts & Equipment (14196)').click();
    await page.getByTestId('customer-submit-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('link').nth(1)).toBeVisible();
    await expect(page.getByTestId('link').nth(1)).toHaveText(prevId);
  });

  test('Edit handwritten', async ({ page }) => {
    await createHandwritten(page, 'ConEquip');
    await page.getByTestId('save-btn').waitFor();

    await page.getByTestId('po-num-input').fill('T104B6');
    await page.getByTestId('source-input').selectOption('Netcom');
    await page.getByTestId('contact-input').fill('Bill');
    await page.getByTestId('bill-to-company-input').fill('Rubber Duck Inc');
    await page.getByTestId('bill-to-address-input').fill('4495 Lake Ave S');
    await page.getByTestId('bill-to-address-2-input').fill('425');
    await page.getByTestId('bill-to-city-input').fill('White Bear Lake');
    await page.getByTestId('bill-to-state-input').fill('MN');
    await page.getByTestId('bill-to-zip-input').fill('55110');
    await page.getByTestId('bill-to-phone-input').fill('(651) 272-3618');
    await page.getByTestId('ship-to-company-input').fill('Rubber Duck Inc');
    await page.getByTestId('ship-to-address-input').fill('4495 Lake Ave S');
    await page.getByTestId('ship-to-address-2-input').fill('425');
    await page.getByTestId('ship-to-city-input').fill('White Bear Lake');
    await page.getByTestId('ship-to-state-input').fill('MN');
    await page.getByTestId('ship-to-zip-input').fill('55110');
    await page.getByTestId('ship-via-input').selectOption('UPS Ground');
    await page.getByTestId('attn-to-input').fill('Bob');
    await page.getByTestId('contact-phone-input').fill('(488) 371-9460');
    await page.getByTestId('shipping-notes-input').fill('Test');

    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await page.getByTestId('po-num').waitFor();

    expect(await page.getByTestId('po-num').textContent()).toEqual('T104B6');
    expect(await page.getByTestId('source').textContent()).toEqual('Netcom');
    expect(await page.getByTestId('contact').textContent()).toEqual('Bill');
    expect(await page.getByTestId('bill-to-company').textContent()).toEqual('Rubber Duck Inc');
    expect(await page.getByTestId('bill-to-address').textContent()).toEqual('4495 Lake Ave S');
    expect(await page.getByTestId('bill-to-address-2').textContent()).toEqual('425');
    expect(await page.getByTestId('bill-to-city').textContent()).toEqual('White Bear Lake');
    expect(await page.getByTestId('bill-to-state').textContent()).toEqual('MN');
    expect(await page.getByTestId('bill-to-zip').textContent()).toEqual('55110');
    expect(await page.getByTestId('bill-to-phone').textContent()).toEqual('(651) 272-3618');
    expect(await page.getByTestId('ship-to-company').textContent()).toEqual('Rubber Duck Inc');
    expect(await page.getByTestId('ship-to-address').textContent()).toEqual('4495 Lake Ave S');
    expect(await page.getByTestId('ship-to-address-2').textContent()).toEqual('425');
    expect(await page.getByTestId('ship-to-city').textContent()).toEqual('White Bear Lake');
    expect(await page.getByTestId('ship-to-state').textContent()).toEqual('MN');
    expect(await page.getByTestId('ship-to-zip').textContent()).toEqual('55110');
    expect(await page.getByTestId('ship-via').textContent()).toEqual('UPS Ground');
    expect(await page.getByTestId('attn-to').textContent()).toEqual('Bob');
    expect(await page.getByTestId('contact-phone').textContent()).toEqual('(488) 371-9460');
    expect(await page.getByTestId('shipping-notes').textContent()).toEqual('Test');
    expect(await page.getByTestId('date').textContent()).toEqual(formatDate(new Date()));
  });
});

test.describe('Handwritten items', () => {
  test('Add handwritten items', async ({ page }) => {
    await createHandwritten(page, 'ConEquip');
    await page.getByTestId('save-btn').waitFor();

    await addHandwrittenItem(page, 1, 'THERM HSNG', 6, 100);
    await addWarranty(page, [0, 2], 'TEST WARRANTY');

    await page.getByTestId('tab').first().click();
    await addHandwrittenItem(page, 2, 'DELETE THIS', 1, 80);
    await addWarranty(page, [1], 'TEST WARRANTY');

    await page.getByTestId('item-qty-input').first().fill('4');
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('item-qty').first()).toHaveText('4');
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('item-delete-btn').first().click();
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('item-desc').first()).toHaveText('THERM HSNG');
    await expect(page.getByTestId('item-qty').first()).toHaveText('6');
    await expect(page.getByTestId('item-price').first()).toHaveText('$100.00');
    expect(await page.getByTestId('order-notes').first().textContent()).toEqual('TEST WARRANTY\nCaterpillar warranty is not available on surplus engines and surplus parts.\nRebuilt Injectors come with a 6 month part replacement only warranty through Midwest Diesel, No labor or progressive damage.');
  });
});

test.describe('Cores', () => {
  test('Core charge', async ({ page }) => {
    await createHandwritten(page, 'ConEquip');
    await goto(page, '/');
    await altSearch(page, { stockNum: 'UP9432' });
    await addHandwrittenItem(page, 0, 'VALVE COVER', 6, 100);

    await page.getByTestId('core-charge-btn').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('item-part-num').first()).toHaveText('CORE DEPOSIT');
    await expect(page.getByTestId('item-stock-num').first()).toHaveText('UP9432');
  
    await goto(page, '/cores');
    await expect(page.getByTestId('part-num').first()).toHaveText('7E0333');
  });

  test('Core deposit', async ({ page }) => {
    await page.getByTestId('link').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await page.getByTestId('core-credit-btn').click();
    await (await page.$$('[data-testid="core-credits-dialog"] .checkbox-wrapper-4'))[0].click();
    await page.getByTestId('core-qty-input').focus();
    await page.keyboard.press('Enter');
    await page.getByTestId('core-credit-submit-btn').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('link').nth(2).click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await expect(page.getByTestId('item-stock-num').first()).toHaveText(stockNum);
    await expect(page.getByTestId('item-qty').first()).toHaveText('-1');
  });
});

test.describe('Takeoffs', () => {
  test('Create date code stockNum after takeoff', async ({ page }) => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').first().click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('no-changes-btn').click();
    await expect(page.getByTestId('bill-to-company')).toHaveText('Rubber Duck Inc');
    await page.getByTestId('takeoff-input').fill(stockNum);
    await page.getByTestId('takeoff-input').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('takeoff-qty-input')).toHaveValue('6');
    await page.getByTestId('takeoff-qty-input').fill('5');
    await page.getByTestId('takeoff-submit-btn').click();
    await page.waitForTimeout(100);

    await goto(page, '/');
    await altSearch(page, { stockNum });
    await expect(page.getByTestId('qty').first()).toHaveText(`${qty - 5}`);
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

  test('Complete normal takeoff', async ({ page }) => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').nth(1).click();
    await page.getByTestId('save-btn').click();
    await page.waitForTimeout(100);
    await expect(page.getByTestId('bill-to-company')).toHaveText('ConEquip Parts & Equipment (14196)');
    await page.getByTestId('takeoff-input').fill('TH609-23C');
    await page.getByTestId('takeoff-input').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('takeoff-qty-input')).toHaveValue('38');
    await page.getByTestId('takeoff-qty-input').fill('34');
    await page.getByTestId('takeoff-submit-btn').click();
    await page.waitForTimeout(100);

    await goto(page, '/');
    await altSearch(page, { stockNum: 'TH609-23C' });
    await expect(page.getByTestId('qty').first()).toHaveText('0');
    await expect(page.getByTestId('stock-num').first()).toHaveText('TH609-23C');

    await page.getByTestId('part-num-link').first().click();
    await expect(page.getByTestId('qty-sold')).toHaveText('34');
    await expect(page.getByTestId('sold-date')).toHaveText(formatDate(new Date()));
    await expect(page.getByTestId('selling-price')).toHaveText('$80.00');
    await expect(page.getByTestId('sold-to')).toHaveText('ConEquip Parts & Equipment (14196)');
    await expect(page.getByTestId('profit-margin')).toHaveText('$80.00');
    await expect(page.getByTestId('profit-percent')).toHaveText('100%');
  });

  test('Complete engine takeoff', async ({ page }) => {
    await goto(page, '/handwrittens');
    await page.getByTestId('handwritten-row').nth(3).click();
    await page.getByTestId('takeoff-input').fill('7342');
    await page.getByTestId('takeoff-input').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.getByTestId('takeoff-submit-btn').click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('status')).toHaveText('Current Status: Sold');
  });
});

test.describe('SENT TO ACCOUNTING', () => {
  test('Prompt for promotional materials', async ({ page }) => {
    await goto(page, '/handwrittens');
    await page.getByTestId('link').nth(1).click();
    await page.waitForLoadState('networkidle');
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

    await expect(page.getByTestId('mp')).toHaveText('1');
    await expect(page.getByTestId('cap')).toHaveText('2');
    await expect(page.getByTestId('br')).toHaveText('3');
    await expect(page.getByTestId('fl')).toHaveText('4');
  });
});

test.describe('Clean up', () => {
  test('Delete handwritten', async ({ page }) => {
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
