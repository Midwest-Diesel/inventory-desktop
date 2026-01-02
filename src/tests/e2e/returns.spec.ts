import { test, expect, Page } from '@playwright/test';
import { resetDb } from '../resetDatabase';
import { goto } from '../utils';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/returns');
});


async function createReturn(page: Page) {
  page.on('dialog', (dialog) => dialog.accept('confirm'));
  await goto(page, '/handwrittens/9');
  await page.getByTestId('new-return-btn').click();
  await page.waitForLoadState('networkidle');
  await (await page.$$('[data-testid="new-return-dialog"] .checkbox-wrapper-4'))[0].click();
  await page.getByTestId('submit-btn').click();
  await page.waitForLoadState('networkidle');
}


test.describe('Basic Functionality', () => {
  test('Display returns', async ({ page }) => {
    await page.waitForSelector('table tr');
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create new return from handwritten', async ({ page }) => {
    await createReturn(page);
    await expect(page.getByTestId('handwritten-link').first()).toHaveText('9');
  });

  test("Can edit return", async ({ page }) => {
    await createReturn(page);
    await page.getByTestId('return-link').first().click();
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('po-input').fill('123');
    await page.getByTestId('save-btn').click();
    expect(await page.getByTestId('po').textContent()).toEqual('123');
  });

  test('Delete return', async ({ page }) => {
    await createReturn(page);
    await page.getByTestId('return-link').first().click();
    await page.getByTestId('delete-btn').click();
    await page.waitForLoadState('networkidle');
    await goto(page, '/returns');
    await expect(page.getByTestId('handwritten-link').first()).not.toHaveText('9');
  });
});

test.describe('Return Credits', () => {
  test('Issue credit', async ({ page }) => {
    await goto(page, '/returns');
    await createReturn(page);
    await page.getByTestId('return-link').first().click();
    await page.getByTestId('credit-issued-btn').click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('stop-edit-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('item-qty').first()).toHaveText('-1');
    await expect(page.getByTestId('item-desc').first()).toHaveText('RETURNED PART: G/U ROTARY SOLENOID');
  });
});
