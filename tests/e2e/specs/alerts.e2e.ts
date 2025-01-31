import { $, $$, browser, expect } from '@wdio/globals';
import { changeRoute, login } from '../utils';


describe('Alerts', () => {
  it('Navigate to page', async () => {
    await login();
    await changeRoute('/alerts');
  });

  it('Display alerts', async () => {
    const rowCount = await $$('table tr').length;
    expect(rowCount > 0).toBe(true);
  });

  it('Create new alert', async () => {
    const newBtn = $('[data-id="new-alert-btn"]');
    await newBtn.click();
    const typeInput = $('[data-id="alert-type-input"]');
    const partNumInput = $('[data-id="part-num-input"]');
    const noteInput = $('[data-id="note-input"]');
    const saveBtn = $('[data-id="save"]');
    await typeInput.setValue('HUDDLE UP!!!');
    await partNumInput.setValue('123123');
    await noteInput.setValue('Test');
    await saveBtn.click();

    const type = await $('[data-id="type"]').getText();
    const partNum = await $('[data-id="part-num"]').getText();
    const note = await $('[data-id="note"]').getText();
    expect(type).toEqual('HUDDLE UP!!!');
    expect(partNum).toEqual('123123');
    expect(note).toEqual('Test');
  });

  it('Edit alert', async () => {
    const editBtn = $$('table tr [data-id="edit-btn"]')[0];
    await editBtn.click();
    const typeInput = $('[data-id="alert-type-edit-input"]');
    const partNumInput = $('[data-id="part-num-edit-input"]');
    const noteInput = $('[data-id="note-edit-input"]');
    const saveBtn = $('[data-id="edit-save-btn"]');
    await typeInput.setValue('ALERT!!!');
    await partNumInput.setValue('3491522');
    await noteInput.setValue('Potato');
    await saveBtn.click();

    const type = await $('[data-id="type"]').getText();
    const partNum = await $('[data-id="part-num"]').getText();
    const note = await $('[data-id="note"]').getText();
    expect(type).toEqual('ALERT!!!');
    expect(partNum).toEqual('3491522');
    expect(note).toEqual('Potato');
  });

  it('Delete alert', async () => {
    const typeTop = await $('[data-id="type"]').getText();
    const partNumTop = await $('[data-id="part-num"]').getText();
    const noteTop = await $('[data-id="note"]').getText();
    const deleteBtn = $$('table tr [data-id="delete-btn"]')[0];
    await deleteBtn.click();

    const type = await $('[data-id="type"]').getText();
    const partNum = await $('[data-id="part-num"]').getText();
    const note = await $('[data-id="note"]').getText();
    expect(JSON.stringify({typeTop, partNumTop, noteTop}) !== '' && JSON.stringify({type, partNum, note}) !== '').toEqual(true);
    expect(JSON.stringify({typeTop, partNumTop, noteTop})).not.toEqual(JSON.stringify({type, partNum, note}));
  });
});
