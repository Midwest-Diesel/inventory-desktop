import { describe, expect, test } from 'vitest';
import { formatCCNumber, formatCurrency, formatDate, formatPhone, formatTime, parsePhone, parseResDate, parseWeightDims, toAbsolutePath } from "@/scripts/tools/stringUtils";
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

describe('Format CCNumber', () => {
  test('Should parse number with correct length', () => {
    expect(formatCCNumber('4141414141415555')).toEqual('XXXXXXXXXXXX5555');
  });

  test('Should parse number with incorrect length', () => {
    expect(formatCCNumber('414141415555')).toEqual('XXXXXXXXXXXX5555');
  });
});

describe('parseWeightDims', () => {
  test('Normal weight dims', () => {
    expect(parseWeightDims('FEDEX INTL 12 - 32x36x5')).toEqual([{ qty: 1, type: 'Small Pack', lbs: 12, length: 32, width: 36, height: 5 }]);
    expect(parseWeightDims('FEDEX INTL  12 - 32 x 36 x 5')).toEqual([{ qty: 1, type: 'Small Pack', lbs: 12, length: 32, width: 36, height: 5 }]);
    expect(parseWeightDims('12 -  32x36x5')).toEqual([{ qty: 1, type: 'Small Pack', lbs: 12, length: 32, width: 36, height: 5 }]);
    expect(parseWeightDims(' FEDEX INTL 12-32x36x5 ')).toEqual([{ qty: 1, type: 'Small Pack', lbs: 12, length: 32, width: 36, height: 5 }]);
    expect(parseWeightDims('Small Pack: 8lbs - L: 1, W: 2, H: 3')).toEqual([{ qty: 1, type: 'Small Pack', lbs: 8, length: 1, width: 2, height: 3 }]);
    expect(parseWeightDims('LTL: 8lbs - L: 1, W: 2, H: 3')).toEqual([{ qty: 1, type: 'LTL', lbs: 8, length: 1, width: 2, height: 3 }]);
    expect(parseWeightDims('GRD: 12LBS 12x10x6')).toEqual([{ qty: 1, type: 'Small Pack', lbs: 12, length: 12, width: 10, height: 6 }]);
  });

  test('Weight dims with qty', () => {
    expect(parseWeightDims('(QTY 1) 12LBS 16x12x6, (QTY 6) 63LBS 14x14x12')).toEqual([
      { qty: 1, type: 'Small Pack', lbs: 12, length: 16, width: 12, height: 6 },
      { qty: 6, type: 'Small Pack', lbs: 63, length: 14, width: 14, height: 12 }
    ]);
    expect(parseWeightDims(' (QTY 1) 12LBS 16x12x6,   (QTY 6) 63LBS 14x14x12 ')).toEqual([
      { qty: 1, type: 'Small Pack', lbs: 12, length: 16, width: 12, height: 6 },
      { qty: 6, type: 'Small Pack', lbs: 63, length: 14, width: 14, height: 12 }
    ]);
    expect(parseWeightDims('(qty 1) 12LBS 16x12x6,(qty 6) 63LbS 14x14x12')).toEqual([
      { qty: 1, type: 'Small Pack', lbs: 12, length: 16, width: 12, height: 6 },
      { qty: 6, type: 'Small Pack', lbs: 63, length: 14, width: 14, height: 12 }
    ]);
    expect(parseWeightDims('(QTY 1) Small Pack: 0lbs - L: 0, W: 0, H: 0\n(QTY 2) LTL: 4lbs - L: 5, W: 16, H: 7')).toEqual([
      { qty: 1, type: 'Small Pack', lbs: 0, length: 0, width: 0, height: 0 },
      { qty: 2, type: 'LTL', lbs: 4, length: 5, width: 16, height: 7 }
    ]);
  });

  test('Parse formated strings', () => {
    expect(parseWeightDims('(QTY 2) Small Pack: 12lbs - L: 16, W: 12, H: 6\n(QTY 6) Small Pack: 63lbs - L: 16, W: 14, H: 12')).toEqual([
      { qty: 2, type: 'Small Pack', lbs: 12, length: 16, width: 12, height: 6 },
      { qty: 6, type: 'Small Pack', lbs: 63, length: 16, width: 14, height: 12 }
    ]);
  });
});
