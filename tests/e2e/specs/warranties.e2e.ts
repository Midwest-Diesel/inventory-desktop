import { $, $$, browser, expect } from '@wdio/globals';
import { changeRoute, login } from '../utils';


describe('Warranties', () => {
  it('Navigate to page', async () => {
    await login();
    await changeRoute('/warranties');
  });

  it('Display warranties', async () => {
    await browser.pause(300);
    const rowCount = await $$('table tr').length;
    expect(rowCount > 0).toBe(true);
    await $('[data-id="warranty-link"]').click();
    expect($('h1')).toExist();
  });
});
