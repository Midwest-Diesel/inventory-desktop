import { test, expect, Page, Dialog } from '@playwright/test';
import { altSearch, partSearch } from '../utils';

test.describe.configure({ mode: 'serial' });
let page: Page;

const onConfirmDialog = (dialog: Dialog) => dialog.accept('confirm');
const onAddAltPartsDialog = (dialog: Dialog) => dialog.accept('9N3242');
const onRemoveAltPartsDialog = (dialog: Dialog) => dialog.accept('9N3242, 7L0406');

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  page.on('dialog', onConfirmDialog);
  await page.goto('http://localhost:3001');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
});

test.describe('Parts', () => {
  test('Display parts', async () => {
    const tableLength = (await page.$$('[data-testid="part-search-table"] tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Part search', async () => {
    await partSearch(page, { partNum: '7E0333', desc: 'VALVE COVER 3406', stockNum: 'UP9432', location: 'C5G4A', rating: 0.0, serialNum: '79419143', hp: '500', purchFrom: 'CB1', remarks: 'T/O, NTBB\'D' });
    await expect(page.getByTestId('part-num-link').first()).toHaveText('7E0333');
  });

  test('Alt Part search', async () => {
    await altSearch(page, { partNum: '*7E0331', desc: 'VALVE COVER 3406', stockNum: 'UP9432', location: 'C5G4A', rating: 0.0, serialNum: '79419143', hp: '500', purchFrom: 'CB1', remarks: 'T/O, NTBB\'D' });
    await expect(page.getByTestId('part-num-link').first()).toHaveText('7E0333');
  });

  test('Add altPart', async () => {
    page.off('dialog', onConfirmDialog);
    page.on('dialog', onAddAltPartsDialog);
    await altSearch(page, { partNum: '9N3240', desc: null, stockNum: null, location: null, qty: null, rating: null, serialNum: null, hp: null, purchFrom: null, remarks: null });
    await page.getByTestId('part-num-link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('add-alts').click();
    await page.getByTestId('save-btn').click();
    await expect(page.getByTestId('alt-parts')).toHaveText('9N3240, 9N3242, 7L0406');

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await altSearch(page, { partNum: '7L0406' });
    await page.getByTestId('part-num-link').nth(2).click();
    await expect(page.getByTestId('alt-parts')).toHaveText('7L0406, 9N3242, 9N3240');
  });

  test('Remove altPart', async () => {
    page.off('dialog', onAddAltPartsDialog);
    page.on('dialog', onRemoveAltPartsDialog);
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await altSearch(page, { partNum: '9N3240' });
    await page.getByTestId('part-num-link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('edit-btn').click();
    await page.getByTestId('remove-alts').click();
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('alt-parts')).toHaveText('9N3240');

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await altSearch(page, { partNum: '7L0406' });
    await page.getByTestId('part-num-link').first().click();
    await expect(page.getByTestId('alt-parts')).toHaveText('7L0406');
  });
});
