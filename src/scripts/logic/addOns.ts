import { getPartsByStockNum } from "../services/partsService";

export const commonPrefixLength = (a: string, b: string): number => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

export const getAddOnDateCode = (date = new Date()): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(2);
  return `${month}${year}-${day}`;
};

const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
export const getNextStockNumberSuffix = async (stockNum: string, addOns: AddOn[]): Promise<string> => {
  const parts = await getPartsByStockNum(stockNum);
  const filteredAddOns = addOns.filter((a) => a.stockNum?.slice(0, a.stockNum.length - 1) === stockNum);
  const stockNumbers = [...parts.map((p) => p.stockNum), ...filteredAddOns.map((a) => a.stockNum)];
  if (stockNumbers.length === 0) return 'A';

  let latestStockNumIndex = letters.indexOf(stockNumbers[0]!.charAt(stockNumbers[0]!.length - 1));
  for (const num of stockNumbers) {
    const suffix = num!.charAt(num!.length - 1);
    const index = letters.indexOf(suffix);
    if (index > latestStockNumIndex) latestStockNumIndex = index;
  }
  return letters[latestStockNumIndex + 1];
};
