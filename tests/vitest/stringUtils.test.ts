import { describe, expect, test } from 'vitest';
import { extractStatusColors, formatCurrency, formatDate, formatPhone, formatTime, parsePhone, parseResDate } from "@/scripts/tools/stringUtils";


describe('Format date', () => {
  test('should return a string with the date formatted', () => {
    const date = new Date(2024, 1, 23);
    const result = formatDate(date);
    expect(result).toBe('02/23/2024');
  });

  test('parseResdate', () => {
    const result = parseResDate('2024-03-08T09:15:24.000Z');
    expect(result).toEqual(new Date('2024-03-08T09:15:24.000Z'));
  });

  test('should format time', () => {
    const parsedDate = parseResDate('2024-06-11T19:24:47.601Z') ?? '';
    const date = new Date(parsedDate);
    const result = formatTime(date);
    expect(result).toBe('2:24 PM');
  });
});

describe('Format currency', () => {
  test('should return a string with the currency formatted', () => {
    const currency = 1000;
    const result = formatCurrency(currency);
    expect(result).toBe('$1,000.00');
  });

  test('should return $0.00 from blank input', () => {
    const currency = null;
    const result = formatCurrency(currency);
    expect(result).toBe('$0.00');
  });
});

describe('Extract status colors', () => {
  test('should return New', () => {
    const text = '(10.0) New, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('new');
  });

  test('should return Rebuilt', () => {
    const text = '(10.0) Rebuilt, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('rebuilt');
  });

  test('should return Recon', () => {
    const text = '(10.0) Recon, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('recon');
  });

  test('should return NTO', () => {
    const text = '(10.0) NTO, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('NTO');
  });

  test('should return Special', () => {
    const text = '(10.0) Special, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('special');
  });

  test('should return Sold', () => {
    const text = '(10.0) Sold, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('sold');
  });

  test('should return Humpy', () => {
    const text = '(10.0) Humpy, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('humpy');
  });

  test('should return Special lower in condition order', () => {
    const text = '(10.0) Special, PERKINS IDLER PULLEY, NTO customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('special');
  });

  test('should return empty string', () => {
    const text = '(10.0) PERKINS IDLER PULLEY customer told us cat alt part number for this is 2610428 Jack';
    const result = extractStatusColors(text);
    expect(result).toBe('');
  });
});

describe('Format phone', () => {
  describe('should return a string with the phone formatted', () => {
    test('1)', () => {
      const phone = '6088463944';
      const result = formatPhone(phone);
      expect(result).toBe('(608) 846-3944');
    });
  
    test('2)', () => {
      const phone = '6088463944';
      const result = formatPhone(phone);
      expect(result).toBe('(608) 846-3944');
    });

    test('3)', () => {
      const phone = '111';
      const result = formatPhone(phone);
      expect(result).toBe('(111)');
    });

    test('4)', () => {
      const phone = '1111';
      const result = formatPhone(phone);
      expect(result).toBe('(111) 1');
    });

    test('5)', () => {
      const phone = '1111111';
      const result = formatPhone(phone);
      expect(result).toBe('(111) 111-1');
    });

    test('6)', () => {
      const phone = '1111112222';
      const result = formatPhone(phone);
      expect(result).toBe('(111) 111-2222');
    });

    test('7)', () => {
      const phone = '41111112222';
      const result = formatPhone(phone);
      expect(result).toBe('+4 (111) 111-2222');
    });

    test('8)', () => {
      const phone = '(111) 11';
      const result = formatPhone(phone);
      expect(result).toBe('(111) 11');
    });

    test('9)', () => {
      const phone = '(111';
      const result = formatPhone(phone);
      expect(result).toBe('(11)');
    });

    test('10)', () => {
      const phone = '+';
      const result = formatPhone(phone);
      expect(result).toBe('+');
    });

    test('11)', () => {
      const phone = '+1';
      const result = formatPhone(phone);
      expect(result).toBe('+1');
    });

    test('12)', () => {
      const phone = '+24 (111) 231-2332';
      const result = formatPhone(phone);
      expect(result).toBe('+2 (111) 231-2332');
    });

    test('13)', () => {
      const phone = '(111) 231-23321';
      const result = formatPhone(phone);
      expect(result).toBe('+1 (111) 231-2332');
    });

    test('14)', () => {
      const phone = '(11';
      const result = formatPhone(phone);
      expect(result).toBe('(1)');
    });

    test('15)', () => {
      const phone = '(1';
      const result = formatPhone(phone);
      expect(result).toBe('');
    });

    test('16)', () => {
      const phone = '+1 (1';
      const result = formatPhone(phone);
      expect(result).toBe('+1');
    });
  });

  test('should return a blank string', () => {
    formatPhone('');
    const phone = '';
    const result = formatPhone(phone);
    expect(result).toBe('');
  });

  test('should reformat the phone number', () => {
    const phone = '+6 (515) 6452-3233';
    const result = formatPhone(phone);
    expect(result).toBe('+6 (515) 645-2323');
  });

  test('should have a max length of 11', () => {
    const phone = '+6 (515) 645-32331';
    const result = formatPhone(phone);
    expect(result).toBe('+6 (515) 645-3233');
  });

  test('should delete unneccesary ()', () => {
    const phone = '()';
    const result = formatPhone(phone);
    expect(result).toBe('');
  });
});

describe('Parse phone', () => {
  describe('should return a string with the phone parsed', () => {
    test('1)', () => {
      const phone = '(608) 846-3944';
      const result = parsePhone(phone);
      expect(result).toBe('6088463944');
    });

    test('2)', () => {
      const phone = '+1 (608) 846-3944';
      const result = parsePhone(phone);
      expect(result).toBe('16088463944');
    });
  });
});
