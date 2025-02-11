import { $, $$, browser, expect } from '@wdio/globals';
import { changeRoute, createPart, login, partSearch } from '../utils';


describe('Part Details', () => {
  describe('PartNum: 123123', () => {
    it('Navigate to page', async () => {
      await login();
      await changeRoute('/');
    });
  
    it('Create new part', async () => {
      await createPart('123123', 'TEST', '4D56');
      await partSearch('123123');
      const table = $('[data-id="part-search-table"]');
      await table.$('a').click();
  
      await browser.pause(500);
      expect(await $('h2').getText()).toEqual('123123');
      expect(await $('[data-id="alt-parts"]').getText()).toEqual('123123');
    });
  
    it('Add alt parts', async () => {
      await $('[data-id="edit-btn"]').click();
      await $('[data-id="add-alts"]').click();
      await browser.sendAlertText('3055280, C15PK');
      await browser.acceptAlert();
      await $('[data-id="stop-editing"]').click();
  
      await browser.pause(600);
      const altParts = $('[data-id="alt-parts"]');
      expect(await altParts.getText()).toEqual('123123, 3070499, 3055280, C15PK');
    });
  
    it('Remove alt parts', async () => {
      await $('[data-id="edit-btn"]').click();
      await $('[data-id="remove-alts"]').click();
      await browser.sendAlertText('123123, C15PK');
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
      await browser.pause(300);
      await partSearch('123123');
      const tableRows = $('[data-id="part-search-table"] tr td');
      expect(tableRows).not.toExist();
    });
  });
  
  // describe('PartNum: 456456', () => {
  //   it('Create new part', async () => {
  //     await changeRoute('/');
  //     await createPart('456456', 'TEST', '4D56');
  //     await partSearch('456456');
  //     const table = $('[data-id="part-search-table"]');
  //     await table.$('a').click();
  
  //     await browser.pause(500);
  //     expect(await $('h2').getText()).toEqual('456456');
  //     expect(await $('[data-id="alt-parts"]').getText()).toEqual('456456');
  //   });
  
  //   it('Add alt parts', async () => {
  //     await $('[data-id="edit-btn"]').click();
  //     await $('[data-id="add-alts"]').click();
  //     await browser.sendAlertText('7W2203, 4545820');
  //     await browser.acceptAlert();
  //     await browser.pause(35000);
  //     await $('[data-id="stop-editing"]').click();

  //     await browser.pause(600);
  //     const altParts = $('[data-id="alt-parts"]');
  //     expect(await altParts.getText()).toEqual('456456, 1105096, 1105097, 0R0832, 0R1158, 0R2097, 0R3674, 4N0267, 4N267, 4W5197, 7N1300, 7W0006, 7W0008, 7W0009, 7W0010, 7W10, 7W2200, 7W2472, 7W6, 9Y3777, OR1158, OR3674, 0R1160, 1W1506, 7C0041, 4W2436, 0R2155, 0R3719, 1W1509, 0R4920, 7W2203, 7W2202, 0R4918, 3813511, 4545820');
  //   });
  
  //   it('Remove alt parts', async () => {
  //     await changeRoute('/');
  //     await partSearch('0R1160');
  //     const table = $('[data-id="part-search-table"]');
  //     await table.$('a').click();
  //     await $('[data-id="edit-btn"]').click();
  //     await $('[data-id="remove-alts"]').click();
  //     await browser.sendAlertText('456456, 4545820, 3813511');
  //     await browser.acceptAlert();
  //     await $('[data-id="stop-editing"]').click();

  //     await browser.pause(300);
  //     const altParts = $('[data-id="alt-parts"]');
  //     expect(await altParts.getText()).toEqual('1105096, 1105097, 0R0832, 0R1158, 0R2097, 0R3674, 4N0267, 4N267, 4W5197, 7N1300, 7W0006, 7W0008, 7W0009, 7W0010, 7W10, 7W2200, 7W2472, 7W6, 9Y3777, OR1158, OR3674, 0R1160, 1W1506, 7C0041, 4W2436, 0R2155, 0R3719, 1W1509, 0R4920, 7W2203, 7W2202, 0R4918');
  

  //     await changeRoute('/');
  //     await partSearch('456456');
  //     const table2 = $('[data-id="part-search-table"]');
  //     await table2.$('a').click();

  //     await browser.pause(300);
  //     const altParts2 = $('[data-id="alt-parts"]');
  //     expect(await altParts2.getText()).toEqual('456456');

  //     await $('[data-id="edit-btn"]').click();
  //     await $('[data-id="remove-alts"]').click();
  //     await browser.sendAlertText('4545820');
  //     await browser.acceptAlert();
  //     await $('[data-id="stop-editing"]').click();

  //     await browser.pause(300);
  //     const altParts3 = $('[data-id="alt-parts"]');
  //     expect(await altParts3.getText()).toEqual('456456');
  //   });

  //   it('Re-add alt parts', async () => {
  //     await changeRoute('/');
  //     await createPart('4545820', 'TEST', '4D56', '3813511');
  //     await partSearch('4545820');
  //     const table = $('[data-id="part-search-table"]');
  //     await table.$('a').click();

  //     await browser.pause(300);
  //     expect(await $('h2').getText()).toEqual('4545820');
  //     expect(await $('[data-id="alt-parts"]').getText()).toEqual('3813511, 4545820');

  //     await $('[data-id="delete-btn"]').click();
  //     await browser.sendAlertText('confirm');
  //     await browser.acceptAlert();
  //   });
  
  //   it('Delete part', async () => {
  //     await changeRoute('/');
  //     await partSearch('456456');
  //     const table = $('[data-id="part-search-table"]');
  //     await table.$('a').click();

  //     await $('[data-id="delete-btn"]').click();
  //     await browser.sendAlertText('confirm');
  //     await browser.acceptAlert();
  //     await partSearch('456456');
  //     const tableRows = $('[data-id="part-search-table"] tr td');
  //     expect(tableRows).not.toExist();
  //   });
  // });
});
