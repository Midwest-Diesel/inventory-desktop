import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
let page: Page;


test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('http://localhost:3000/alerts');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
});

test.describe('Basic Functionality', () => {
  test('Display alerts', async () => {
    const tableLength = (await page.$$('table tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Create new alert', async () => {
    await page.getByTestId('new-alert-btn').click();
    await page.getByTestId('alert-type-input').fill('HUDDLE UP!!!');
    await page.getByTestId('part-num-input').fill('123123');
    await page.getByTestId('note-input').fill('Test');
    await page.getByTestId('save').click();

    await expect(page.getByTestId('type').first()).toHaveText('HUDDLE UP!!!');
    await expect(page.getByTestId('part-num').first()).toHaveText('123123');
    await expect(page.getByTestId('note').first()).toHaveText('Test');
  });

  test('Edit alert', async () => {
    await page.getByTestId('edit-btn').first().click();
    await page.getByTestId('alert-type-edit-input').fill('ALERT!!!');
    await page.getByTestId('part-num-edit-input').fill('3491522');
    await page.getByTestId('note-edit-input').fill('Potato');
    await page.getByTestId('edit-save-btn').click();

    await expect(page.getByTestId('type').first()).toHaveText('ALERT!!!');
    await expect(page.getByTestId('part-num').first()).toHaveText('3491522');
    await expect(page.getByTestId('note').first()).toHaveText('Potato');
  });

  test('Delete alert', async () => {
    page.on('dialog', (dialog) => dialog.accept('confirm'));
    await page.getByTestId('delete-btn').first().click();
    await expect(page.getByTestId('part-num').first()).not.toHaveText('3491522');
    await expect(page.getByTestId('note').first()).not.toHaveText('Potato');
  });
});
