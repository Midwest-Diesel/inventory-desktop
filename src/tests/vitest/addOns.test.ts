import { getAddOnDateCode, getNextStockNumberSuffix } from '@/scripts/logic/addOns';
import { describe, expect, test, vi, afterEach } from 'vitest';
import * as partsModule from '@/scripts/services/partsService';

vi.mock('@/scripts/services/partsService');


describe('getAddOnDateCode', () => {
  test('Should give formated date for value passed in', () => {
    const date = getAddOnDateCode(new Date(2025, 7, 6));
    expect(date).toEqual('825-6');
  });
});

describe('getNextStockNumberSuffix', () => {
  const addOns: any[] = [{ stockNum: 'aBCASCasDa' }, { stockNum: 'TESTING825-7A' }];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Get next letter in sequence', async () => {
    vi.spyOn(partsModule, 'getPartsByStockNum').mockResolvedValue([
      { stockNum: 'TU505-10A' },
      { stockNum: 'TU505-10B' },
    ] as any);
    const letter = await getNextStockNumberSuffix('TU505-10', addOns);
    expect(letter).toEqual('C');
  });

  test('Get first letter for start of sequence', async () => {
    vi.spyOn(partsModule, 'getPartsByStockNum').mockResolvedValue([]);
    const letter = await getNextStockNumberSuffix('TESTNUMBER123', addOns);
    expect(letter).toEqual('A');
  });

  test('Get next letter when stockNum only exists in addons', async () => {
    vi.spyOn(partsModule, 'getPartsByStockNum').mockResolvedValue([]);
    const letter = await getNextStockNumberSuffix('TESTING825-7', addOns);
    expect(letter).toEqual('B');
  });
});
