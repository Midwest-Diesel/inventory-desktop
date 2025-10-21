import { test, expect, Dialog, Page } from '@playwright/test';
import { altSearch, goto, partSearch } from '../utils';
import { resetDb } from '../resetDatabase';

const onAddAltPartsDialog = (dialog: Dialog) => dialog.accept('9N3242');
const onRemoveAltPartsDialog = (dialog: Dialog) => dialog.accept('9N3242, 7L0406');

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001');
  await page.getByTestId('username').fill('bennett');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await goto(page, '/');
});


async function addAltPart(page: Page) {
  page.on('dialog', onAddAltPartsDialog);
  await altSearch(page, { partNum: '9N3240', desc: null, stockNum: null, location: null, qty: null, rating: null, serialNum: null, hp: null, purchFrom: null, remarks: null });
  await page.getByTestId('part-num-link').first().click();
  await page.waitForLoadState('networkidle');
  await page.getByTestId('edit-btn').click();
  await page.getByTestId('add-alts').click();
  await page.getByTestId('save-btn').click();
}


test.describe('Parts', () => {
  test('Display parts', async ({ page }) => {
    const tableLength = (await page.$$('[data-testid="part-search-table"] tr')).length;
    expect(tableLength).toBeGreaterThan(0);
  });

  test('Part search', async ({ page }) => {
    await partSearch(page, { partNum: '7E0333', desc: 'VALVE COVER 3406', stockNum: 'UP9432', location: 'C5G4A', rating: 0.0, serialNum: '79419143', hp: '500', purchFrom: 'CB1', remarks: 'T/O, NTBB\'D' });
    await expect(page.getByTestId('part-num-link').first()).toHaveText('7E0333');
  });

  test('Alt Part search', async ({ page }) => {
    await altSearch(page, { partNum: '*7E0331', desc: 'VALVE COVER 3406', stockNum: 'UP9432', location: 'C5G4A', rating: 0.0, serialNum: '79419143', hp: '500', purchFrom: 'CB1', remarks: 'T/O, NTBB\'D' });
    await expect(page.getByTestId('part-num-link').first()).toHaveText('7E0333');
  });

  test('Add altPart', async ({ page }) => {
    await addAltPart(page);
    await expect(page.getByTestId('alt-parts')).toHaveText('9N3240, 9N3242, 7L0406');

    await goto(page, '/');
    await page.waitForLoadState('networkidle');
    await altSearch(page, { partNum: '7L0406' });
    await page.getByTestId('part-num-link').nth(2).click();
    await expect(page.getByTestId('alt-parts')).toHaveText('9N3240, 9N3242, 7L0406');
  });

  test('Remove single altPart', async ({ page }) => {
    await addAltPart(page);
    await goto(page, '/');

    await page.waitForLoadState('networkidle');
    await altSearch(page, { partNum: '9N3240' });
    await page.getByTestId('part-num-link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('edit-btn').click();

    page.off('dialog', onAddAltPartsDialog);
    page.on('dialog', onRemoveAltPartsDialog);
    await page.getByTestId('remove-alts').click();
    await page.getByTestId('save-btn').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('alt-parts')).toHaveText('9N3240');

    await goto(page, '/');
    await page.waitForLoadState('networkidle');
    await altSearch(page, { partNum: '7L0406' });
    await page.getByTestId('part-num-link').first().click();
    await expect(page.getByTestId('alt-parts')).toHaveText('7L0406');
  });
});
