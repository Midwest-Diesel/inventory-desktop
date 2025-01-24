import { expect } from '@jest/globals';
import { filterNullObjValuesArr, generateClasses, getRatingFromRemarks, isObjectNull, parseClasses } from "@/scripts/tools/utils";


describe('Generate classes', () => {
  it('should return a string with the class name and the variants', () => {
    const className = '';
    const variantList = ['primary', 'secondary'];
    const result = generateClasses(className, variantList, 'button');
    expect(result).toBe('button button--primary button--secondary');
  });
});

describe('Parse classes', () => {
  it('should return an object with the classes', () => {
    const classes = 'button button--primary button--secondary';
    const result = parseClasses(classes);
    expect(result).toEqual({ className: 'button button--primary button--secondary' });
  });

  it('should return an empty object', () => {
    const classes = '';
    const result = parseClasses(classes);
    expect(result).toEqual({});
  });
});

describe('IsObjectNull', () => {
  it('should return true', () => {
    const obj = { a: '', b: null };
    const result = isObjectNull(obj);
    expect(result).toBe(true);
  });

  describe('should return false', () => {
    it ('1)', () => {
      const obj = { a: 'test', b: null };
      const result = isObjectNull(obj);
      expect(result).toBe(false);
    });

    it ('2)', () => {
      const obj = { a: 0 };
      const result = isObjectNull(obj);
      expect(result).toBe(false);
    });
  });
});

describe('filterNullObjValuesArr', () => {
  it('should return empty array', () => {
    const arr = [{ a: '', b: null }, { a: '', b: null }];
    const result = filterNullObjValuesArr(arr);
    expect(result).toEqual([]);
  });

  it('should return one element', () => {
    const arr = [{ a: 'test', b: null }, { a: '', b: null }];
    const result = filterNullObjValuesArr(arr);
    expect(result).toEqual([{ a: 'test', b: null }]);
  });
});

describe('getRatingFromString', () => {
  it ('should return rating from decimal', () => {
    const rating1 = getRatingFromRemarks('(8.0) T/O LOOKS OK W/ CAM # 9Y0266 W/ TIMING ADVANCE');
    expect(rating1).toEqual('8.0');
    const rating2 = getRatingFromRemarks('(8.0)T/O LOOKS OK W/ CAM # 9Y0266 W/ TIMING ADVANCE');
    expect(rating2).toEqual('8.0');
  });

  it ('should return 0.0', () => {
    const rating = getRatingFromRemarks('FUEL PUMP CORE, RACK BAR STUCK, HSNG #7W3906, CAM #7W3103');
    expect(rating).toEqual('0.0');
  });

  it ('should return 0.0 when not at start', () => {
    const rating1 = getRatingFromRemarks('FUEL PUMP CORE, (6.5) RACK BAR STUCK, HSNG #7W3906, CAM #7W3103');
    expect(rating1).toEqual('0.0');
    const rating2 = getRatingFromRemarks('FUEL PUMP CORE, RACK BAR STUCK, HSNG #7W3906, (6.5)CAM #7W3103');
    expect(rating2).toEqual('0.0');
  });

  it ('should return rating from integer', () => {
    const rating1 = getRatingFromRemarks('(10) NTO, ECM MOUNTING BRACKET, YELLOW, LOOKS VERY NICE');
    expect(rating1).toEqual('10.0');
    const rating2 = getRatingFromRemarks('(10)NTO, ECM MOUNTING BRACKET, YELLOW, LOOKS VERY NICE');
    expect(rating2).toEqual('10.0');
  });
});
