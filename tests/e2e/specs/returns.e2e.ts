import { $, $$, browser, expect } from '@wdio/globals';
import { changeRoute, login } from '../utils';
import { formatDate } from '@/scripts/tools/stringUtils';


describe('Returns', () => {
  it('Navigate to page', async () => {
    await login();
    await changeRoute('/returns');
  });

  it('Display returns', async () => {
    const rowCount = await $$('table tr').length;
    expect(rowCount > 0).toBe(true);
  });

  it('Can create new return from handwritten', async () => {
    await changeRoute('/handwrittens/9');
    await $('[data-id="new-return-btn"]').click();
    await $('[data-id="new-return-dialog"] .cbx').click();
    await $('[data-id="new-return-dialog"] [data-id="submit-btn"]').click();
    const handwrittenId = await $('[data-id="handwritten-link"]').getText();
    expect(handwrittenId).toBe('9');
  });

  it("Can edit return", async () => {
    await $('[data-id="return-link"]').click();
    await $('[data-id="edit-btn"]').click();
    await $('input').setValue('123');
    await $('[data-id="save-btn"]').click();
    const poNum = await $('[data-id="po-num"]').getText();
    expect(poNum).toBe('123');
  });

  it('Can issue credit', async () => {
    await $('[data-id="credit-issued-btn"]').click();
    const date = await $('[data-id="credit-issued"]').getText();
    expect(date).toBe(formatDate(new Date()));
  });

  it('Can delete return', async () => {
    await $('[data-id="delete-btn"]').click();
    await browser.sendAlertText('confirm');
    await browser.acceptAlert();
    const handwrittenId = await $('[data-id="handwritten-link"]').getText();
    expect(handwrittenId).not.toBe('9');
  });
});
