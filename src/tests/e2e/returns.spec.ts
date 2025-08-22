import { formatDate } from '@/scripts/tools/stringUtils';
import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  page.on('dialog', (dialog) => dialog.accept('confirm'));
  await page.goto('http://localhost:3001/returns');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
});


test.describe('Basic Functionality', () => {
  test('Display returns', async () => {
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create new return from handwritten', async () => {
    await page.goto('http://localhost:3001/handwrittens/9');
    await page.getByTestId('new-return-btn').click();
    await (await page.$$('[data-testid="new-return-dialog"] .checkbox-wrapper-4'))[0].click();
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('handwritten-link').first()).toHaveText('9');
  });

  test("Can edit return", async () => {
    await page.getByTestId('return-link').first().click();
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('po-input').fill('123');
    await page.getByTestId('save-btn').click();
    expect(await page.getByTestId('po').textContent()).toEqual('123');
  });
});

test.describe('Handle Returns', () => {
  test('Issue credit', async () => {
    await page.goto('http://localhost:3001/returns');
    await page.getByTestId('return-link').first().click();
    await page.getByTestId('credit-issued-btn').click();
    await expect(page.getByTestId('credit-issued')).toHaveText(formatDate(new Date()));
  });
});

test.describe('Clean Up', () => {
  test('Delete return', async () => {
    await page.goto('http://localhost:3001/returns');
    await page.getByTestId('return-link').first().click();
    await page.getByTestId('delete-btn').click();
    await page.goto('http://localhost:3001/returns');
    await expect(page.getByTestId('handwritten-link').first()).not.toHaveText('9');
  });
});
