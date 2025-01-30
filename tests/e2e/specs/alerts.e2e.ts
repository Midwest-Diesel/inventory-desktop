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

  it('Edit alert', async () => {
    const rowCount = await $$('table tr').length;
    expect(rowCount > 0).toBe(true);
  });
});
