import { $, $$, browser, expect } from '@wdio/globals';
import { changeRoute, login } from '../utils';


describe('Handwrittens', () => {
  it('Navigate to page', async () => {
    await login();
    await changeRoute('/handwrittens');
  });

  it('Display handwrittens', async () => {
    const rowCount = await $$('table tr').length;
    expect(rowCount > 0).toBe(true);
  });

  it('Create blank handwritten', async () => {
    const oldId = await $('table a').getText();
    await $('[data-id="new-btn"]').click();
    await $('li').click();
    const option = $('[data-value=" J Lee Trucking"]');
    await option.click();
    await $('[data-id="customer-submit-btn"]').click();
    await browser.pause(300);

    const link = $('table a');
    expect(oldId).not.toBe(await link.getText());
    await link.click();
  });

  it('Edit handwritten', async () => {
    await $('[data-id="po-num"]').setValue('TEST');
    await $('[data-id="save-btn"]').click();
    await browser.pause(500);
    const poNum = await $('[data-id="po-num"]').getText();
    expect(poNum).toBe('TEST');
  });

  it('Delete handwritten', async () => {
    const oldId = await $('[data-id="id"]').getText();
    await $('[data-id="delete-btn"]').click();
    await browser.sendAlertText('confirm');
    await browser.acceptAlert();
    const id = await $('a').getText();
    expect(id).not.toBe(oldId);
  });
});
