import { expect } from '@jest/globals';
import { getSalesByYear } from "@/scripts/tools/search";

describe('Get sales by year', () => {
  it('should return sales by year', () => {
    const sales = [
      { soldToDate: new Date('2022-01-01'), qtySold: 1 },
      { soldToDate: new Date('2022-01-01'), qtySold: 3 },
      { soldToDate: new Date('2023-01-01'), qtySold: 4 },
      { soldToDate: new Date('2023-01-01'), qtySold: 1 },
      { soldToDate: new Date('2024-01-01'), qtySold: 2 },
    ];
    const result = getSalesByYear(sales as Part[]);
    expect(result).toEqual([{ year: 2023, amount: 2 }, { year: 2022, amount: 5 }, { year: 2021, amount: 4 }]);
  });
});
