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
