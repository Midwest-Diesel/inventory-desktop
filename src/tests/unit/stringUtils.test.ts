import { describe, expect, test } from 'vitest';
import { formatCurrency, formatDate, formatPhone, formatTime, parsePhone, parseResDate, toAbsolutePath } from "@/scripts/tools/stringUtils";
import { extractStatusColors } from '@/scripts/logic/partSearch';


describe('Format date', () => {
  test('should return a string with the date formatted', () => {
    const date = new Date(2024, 1, 23);
    const result = formatDate(date);
    expect(result).toEqual('02/23/2024');
  });

  test('parseResdate', () => {
    const result = parseResDate('2024-03-08T09:15:24.000Z');
    expect(result).toEqual(new Date('2024-03-08T09:15:24.000Z'));
  });

  test('should format time', () => {
    const parsedDate = parseResDate('2026-01-02T07:31:32.000Z') ?? '';
    const date = new Date(parsedDate);
    const result = formatTime(date);
    expect(result).toEqual('1:31 AM');
  });
});

describe('Format currency', () => {
  test('should return a string with the currency formatted', () => {
    const currency = 1000;
    const result = formatCurrency(currency);
    expect(result).toEqual('$1,000.00');
  });

  test('should return $0.00 from blank input', () => {
    const currency = null;
    const result = formatCurrency(currency);
    expect(result).toEqual('$0.00');
  });
});

describe('Extract status colors', () => {
  test('should return New', () => {
    const part = {remarks: '(10.0) New, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('new');
  });

  test('should return Rebuilt', () => {
    const part = {remarks: '(10.0) Rebuilt, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('rebuilt');
  });

  test('should return Recon', () => {
    const part = {remarks: '(10.0) Recon, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('recon');
  });

  test('should return NTO', () => {
    const part = {remarks: '(10.0) NTO, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('NTO');
  });

  test('should return Special', () => {
    const part = {remarks: '(10.0) Special, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('special');
  });

  test('should return Sold', () => {
    const part = {remarks: '(10.0) Sold, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('sold');
  });

  test('should return Humpy', () => {
    const part = {remarks: '(10.0) Humpy, PERKINS IDLER PULLEY, LOOKS VERY NICE customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('humpy');
  });

  test('should return Special lower in condition order', () => {
    const part = {remarks: '(10.0) Special, PERKINS IDLER PULLEY, NTO customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('special');
  });

  test('should return empty string', () => {
    const part = {remarks: '(10.0) PERKINS IDLER PULLEY customer told us cat alt part number for this is 2610428 Jack'} as Part;
    const result = extractStatusColors(part);
    expect(result).toEqual('');
  });
});

describe('Format phone', () => {
  describe('should return a string with the phone formatted', () => {
    test('1)', () => {
      const phone = '6088463944';
      const result = formatPhone(phone);
      expect(result).toEqual('(608) 846-3944');
    });
  
    test('2)', () => {
      const phone = '6088463944';
      const result = formatPhone(phone);
      expect(result).toEqual('(608) 846-3944');
    });

    test('3)', () => {
      const phone = '111';
      const result = formatPhone(phone);
      expect(result).toEqual('(111)');
    });

    test('4)', () => {
      const phone = '1111';
      const result = formatPhone(phone);
      expect(result).toEqual('(111) 1');
    });

    test('5)', () => {
      const phone = '1111111';
      const result = formatPhone(phone);
      expect(result).toEqual('(111) 111-1');
    });

    test('6)', () => {
      const phone = '1111112222';
      const result = formatPhone(phone);
      expect(result).toEqual('(111) 111-2222');
    });

    test('7)', () => {
      const phone = '41111112222';
      const result = formatPhone(phone);
      expect(result).toEqual('+4 (111) 111-2222');
    });

    test('8)', () => {
      const phone = '(111) 11';
      const result = formatPhone(phone);
      expect(result).toEqual('(111) 11');
    });

    test('9)', () => {
      const phone = '(111';
      const result = formatPhone(phone);
      expect(result).toEqual('(11)');
    });

    test('10)', () => {
      const phone = '+';
      const result = formatPhone(phone);
      expect(result).toEqual('+');
    });

    test('11)', () => {
      const phone = '+1';
      const result = formatPhone(phone);
      expect(result).toEqual('+1');
    });

    test('12)', () => {
      const phone = '+24 (111) 231-2332';
      const result = formatPhone(phone);
      expect(result).toEqual('+2 (111) 231-2332');
    });

    test('13)', () => {
      const phone = '(111) 231-23321';
      const result = formatPhone(phone);
      expect(result).toEqual('+1 (111) 231-2332');
    });

    test('14)', () => {
      const phone = '(11';
      const result = formatPhone(phone);
      expect(result).toEqual('(1)');
    });

    test('15)', () => {
      const phone = '(1';
      const result = formatPhone(phone);
      expect(result).toEqual('');
    });

    test('16)', () => {
      const phone = '+1 (1';
      const result = formatPhone(phone);
      expect(result).toEqual('+1');
    });
  });

  test('should return a blank string', () => {
    formatPhone('');
    const phone = '';
    const result = formatPhone(phone);
    expect(result).toEqual('');
  });

  test('should reformat the phone number', () => {
    const phone = '+6 (515) 6452-3233';
    const result = formatPhone(phone);
    expect(result).toEqual('+6 (515) 645-2323');
  });

  test('should have a max length of 11', () => {
    const phone = '+6 (515) 645-32331';
    const result = formatPhone(phone);
    expect(result).toEqual('+6 (515) 645-3233');
  });

  test('should delete unneccesary ()', () => {
    const phone = '()';
    const result = formatPhone(phone);
    expect(result).toEqual('');
  });
});

describe('Parse phone', () => {
  describe('should return a string with the phone parsed', () => {
    test('1)', () => {
      const phone = '(608) 846-3944';
      const result = parsePhone(phone);
      expect(result).toEqual('6088463944');
    });

    test('2)', () => {
      const phone = '+1 (608) 846-3944';
      const result = parsePhone(phone);
      expect(result).toEqual('16088463944');
    });
  });
});

describe('To Abosolute Path', () => {
  test('Should add / in front of path', () => {
    expect(toAbsolutePath('handwrittens')).toEqual('/handwrittens');
  });

  test('Should leave path unchanged', () => {
    expect(toAbsolutePath('/cores')).toEqual('/cores');
  });
});
