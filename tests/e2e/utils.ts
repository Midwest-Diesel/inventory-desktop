import { $, browser } from '@wdio/globals';

export const login = async () => {
  await browser.url('/');
  const usernameInput = browser.$('[data-id="username"]');
  await usernameInput.setValue('bennett');
  await $('[data-id="login-btn"]').click();
  await browser.pause(100);
};

export const changeRoute = async (url: string) => {
  await browser.url(url);
  await $('.navbar').waitForExist();
};

export const partSearch = async (partNum: string) => {
  await $('[data-id="part-search-btn"]').click();
  await $('#part-search-input').waitForClickable();
  await $('#part-search-input').setValue(partNum);
  await $('[data-id="part-search-submit"]').click();
  await browser.pause(300);
};

export const createPart = async (partNum: string, desc: string, stockNum: string, altParts?: string) => {
    await $('[data-id="new-part-btn"').click();
    const partNumInput = $('[data-id="part-num"]');
    await partNumInput.waitForExist();
    const descInput = $('[data-id="desc"]');
    const stockNumInput = $('[data-id="stock-num"]');
    const altPartsInput = $('[data-id="alt-parts"]');
    await partNumInput.setValue(partNum);
    await descInput.setValue(desc);
    await stockNumInput.setValue(stockNum);
    if (altParts) await altPartsInput.setValue(altParts);
    await $('[data-id="save-btn"]').click();
};
