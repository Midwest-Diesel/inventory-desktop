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
};

export const createPart = async (partNum: string, desc: string, stockNum: string) => {
    await $('[data-id="new-part-btn"').click();
    const partNumInput = $('[data-id="part-num"]');
    await partNumInput.waitForExist();
    const descInput = $('[data-id="desc"]');
    const stockNumInput = $('[data-id="stock-num"]');
    await partNumInput.setValue(partNum);
    await descInput.setValue(desc);
    await stockNumInput.setValue(stockNum);
    await $('[data-id="save-btn"]').click();
};
