import { Page } from '@playwright/test';

interface SearchData {
  partNum?: string | null
  stockNum?: string | null
  desc?: string | null
  location?: string | null
  qty?: number | null
  remarks?: string | null
  rating?: number | null
  purchFrom?: string | null
  serialNum?: string | null
  hp?: string | null
}


export const partSearch = async (page: Page, search: SearchData) => {
  await page.getByTestId('part-search-btn').click();
  const { partNum, stockNum, desc, location, qty, remarks, rating, purchFrom, serialNum, hp } = search;
  if (partNum) await page.getByTestId('part-search-part-num').fill(partNum);
  if (stockNum) await page.getByTestId('part-search-stock-num').fill(stockNum);
  if (desc) await page.getByTestId('part-search-desc').fill(desc);
  if (location) await page.getByTestId('part-search-location').fill(location);
  if (qty) await page.getByTestId('part-search-qty').fill(qty.toString());
  if (remarks) await page.getByTestId('part-search-remarks').fill(remarks);
  if (rating) await page.getByTestId('part-search-rating').fill(rating.toString());
  if (purchFrom) await page.getByTestId('part-search-purch-from').fill(purchFrom);
  if (serialNum) await page.getByTestId('part-search-serial-num').fill(serialNum);
  if (hp) await page.getByTestId('part-search-hp').fill(hp);
  await page.getByTestId('part-search-submit-btn').click();
  await page.waitForSelector('.part-search');
  await page.waitForTimeout(2000);
};

export const altSearch = async (page: Page, search: SearchData) => {
  await page.getByTestId('alt-search-btn').click();
  const { partNum, stockNum, desc, location, qty, remarks, rating, purchFrom, serialNum, hp } = search;
  await page.getByTestId('alt-search-part-num').fill(partNum ?? '');
  await page.getByTestId('alt-search-stock-num').fill(stockNum ?? '');
  await page.getByTestId('alt-search-desc').fill(desc ?? '');
  await page.getByTestId('alt-search-location').fill(location ?? '');
  await page.getByTestId('alt-search-qty').fill(qty?.toString() ?? '');
  await page.getByTestId('alt-search-remarks').fill(remarks ?? '');
  await page.getByTestId('alt-search-rating').fill(rating?.toString() ?? '');
  await page.getByTestId('alt-search-purch-from').fill(purchFrom ?? '');
  await page.getByTestId('alt-search-serial-num').fill(serialNum ?? '');
  await page.getByTestId('alt-search-hp').fill(hp ?? '');
  await page.getByTestId('alt-search-submit-btn').click();
  await page.waitForSelector('.part-search');
  await page.waitForTimeout(2000);
};
