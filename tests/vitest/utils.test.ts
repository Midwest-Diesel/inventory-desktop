import { describe, expect, test } from 'vitest';
import { arrayOfObjectsMatch, filterNullObjValuesArr, generateClasses, getRatingFromRemarks, isObjectNull, parseClasses } from "@/scripts/tools/utils";


describe('Generate classes', () => {
  test('should return a string with the class name and the variants', () => {
    const className = '';
    const variantList = ['primary', 'secondary'];
    const result = generateClasses(className, variantList, 'button');
    expect(result).toBe('button button--primary button--secondary');
  });
});

describe('Parse classes', () => {
  test('should return an object with the classes', () => {
    const classes = 'button button--primary button--secondary';
    const result = parseClasses(classes);
    expect(result).toEqual({ className: 'button button--primary button--secondary' });
  });

  test('should return an empty object', () => {
    const classes = '';
    const result = parseClasses(classes);
    expect(result).toEqual({});
  });
});

describe('IsObjectNull', () => {
  test('should return true', () => {
    const obj = { a: '', b: null };
    const result = isObjectNull(obj);
    expect(result).toBe(true);
  });

  describe('should return false', () => {
    test('1)', () => {
      const obj = { a: 'test', b: null };
      const result = isObjectNull(obj);
      expect(result).toBe(false);
    });

    test('2)', () => {
      const obj = { a: 0 };
      const result = isObjectNull(obj);
      expect(result).toBe(false);
    });
  });
});

describe('filterNullObjValuesArr', () => {
  test('should return empty array', () => {
    const arr = [{ a: '', b: null }, { a: '', b: null }];
    const result = filterNullObjValuesArr(arr);
    expect(result).toEqual([]);
  });

  test('should return one element', () => {
    const arr = [{ a: 'test', b: null }, { a: '', b: null }];
    const result = filterNullObjValuesArr(arr);
    expect(result).toEqual([{ a: 'test', b: null }]);
  });
});

describe('getRatingFromString', () => {
  test('should return rating from decimal', () => {
    const rating1 = getRatingFromRemarks('(8.0) T/O LOOKS OK W/ CAM # 9Y0266 W/ TIMING ADVANCE');
    expect(rating1).toEqual('8.0');
    const rating2 = getRatingFromRemarks('(8.0)T/O LOOKS OK W/ CAM # 9Y0266 W/ TIMING ADVANCE');
    expect(rating2).toEqual('8.0');
  });

  test('should return 0.0', () => {
    const rating = getRatingFromRemarks('FUEL PUMP CORE, RACK BAR STUCK, HSNG #7W3906, CAM #7W3103');
    expect(rating).toEqual('0.0');
  });

  test('should return 0.0 when not at start', () => {
    const rating1 = getRatingFromRemarks('FUEL PUMP CORE, (6.5) RACK BAR STUCK, HSNG #7W3906, CAM #7W3103');
    expect(rating1).toEqual('0.0');
    const rating2 = getRatingFromRemarks('FUEL PUMP CORE, RACK BAR STUCK, HSNG #7W3906, (6.5)CAM #7W3103');
    expect(rating2).toEqual('0.0');
  });

  test('should return rating from integer', () => {
    const rating1 = getRatingFromRemarks('(10) NTO, ECM MOUNTING BRACKET, YELLOW, LOOKS VERY NICE');
    expect(rating1).toEqual('10.0');
    const rating2 = getRatingFromRemarks('(10)NTO, ECM MOUNTING BRACKET, YELLOW, LOOKS VERY NICE');
    expect(rating2).toEqual('10.0');
  });
});

describe('arrayOfObjectsMatch', () => {
  test('Arrays are matching', () => {
    const arr1 = [{ id: 1, name: 'John', color: 'blue' }];
    const arr2 = [{ color: 'blue', id: 1, name: 'John' }];
    expect(arrayOfObjectsMatch(arr1, arr2)).toEqual(true);
  });

  test('Arrays don\'t match', () => {
    const arr1 = [{ id: 1, name: 'John', color: 'green' }];
    const arr2 = [{ color: 'blue', id: 2, name: 'John' }];
    expect(arrayOfObjectsMatch(arr1, arr2)).toEqual(false);
  });

  test('Arrays have different sizes', () => {
    const arr1 = [{ id: 1, name: 'John', color: 'blue', rank: 5 }];
    const arr2 = [{ color: 'blue', id: 1, name: 'John' }];
    expect(arrayOfObjectsMatch(arr1, arr2)).toEqual(false);
  });

  test('Handle null values', () => {
    const arr1 = [{ id: 1, name: 'John', color: null }];
    const arr2 = [{ color: 'blue', id: 1, name: 'John' }];
    expect(arrayOfObjectsMatch(arr1, arr2)).toEqual(false);
  });
});
