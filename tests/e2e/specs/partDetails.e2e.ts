import { $, $$, browser, expect } from '@wdio/globals';
import { changeRoute, login, partSearch } from '../utils';


describe('Part Details', () => {
  it('Navigate to page', async () => {
    await login();
    await changeRoute('/');
  });

  it('Create new part', async () => {
    await $('[data-id="new-part-btn"').click();
    const partNumInput = $('[data-id="part-num"]');
    await partNumInput.waitForExist();
    const descInput = $('[data-id="desc"]');
    const stockNumInput = $('[data-id="stock-num"]');
    await partNumInput.setValue('123123');
    await descInput.setValue('TEST');
    await stockNumInput.setValue('1D234');
    await $('[data-id="save-btn"]').click();
    
    await partSearch('123123');
    const table = $('[data-id="part-search-table"]');
    await table.$('a').click();
    await browser.pause(300);
    expect(await $('h2').getText()).toEqual('123123');
    expect(await $('[data-id="alt-parts"]').getText()).toEqual('123123');
  });

  it('Add alt parts', async () => {
    await $('[data-id="edit-btn"]').click();
    await $('[data-id="add-alts"]').click();
    await browser.sendAlertText('123, 456');
    await browser.acceptAlert();
    await $('[data-id="stop-editing"]').click();

    await browser.pause(300);
    const altParts = $('[data-id="alt-parts"]');
    expect(await altParts.getText()).toEqual('123123, 123, 456');
  });

  it('Remove alt parts', async () => {
    await $('[data-id="edit-btn"]').click();
    await $('[data-id="remove-alts"]').click();
    await browser.sendAlertText('123, 456');
    await browser.acceptAlert();
    await $('[data-id="stop-editing"]').click();

    await browser.pause(300);
    const altParts = $('[data-id="alt-parts"]');
    expect(await altParts.getText()).toEqual('123123');
  });

  it('Delete part', async () => {
    await $('[data-id="delete-btn"]').click();
    await browser.sendAlertText('confirm');
    await browser.acceptAlert();
    await partSearch('123123');
    const tableRows = $('[data-id="part-search-table"] tr td');
    expect(tableRows).not.toExist();
  });
});
