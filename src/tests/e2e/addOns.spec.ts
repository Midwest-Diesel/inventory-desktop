import { test, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
let page: Page;


test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('http://localhost:3001/add-ons/shop/part');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
});
