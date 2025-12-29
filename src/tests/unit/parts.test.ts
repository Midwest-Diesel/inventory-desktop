import { formatRemarksSoldText } from '@/scripts/logic/parts';
import { formatDate } from '@/scripts/tools/stringUtils';
import { describe, expect, test } from 'vitest';


describe('formatRemarksSoldText', () => {
  test('qtySold is greater than 1', () => {
    const remarks = '(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6';
    const expectedRemarks = `^ 4 SOLD BY JMF ${formatDate(new Date())} Jack Fremont ^^${remarks}`;
    expect(formatRemarksSoldText(remarks, 4, 'JMF', 'Jack Fremont')).toEqual(expectedRemarks);
  });

  test('qtySold is 1', () => {
    const remarks = '(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6';
    const expectedRemarks = `^ SOLD BY JMF ${formatDate(new Date())} Jack Fremont ^^${remarks}`;
    expect(formatRemarksSoldText(remarks, null, 'JMF', 'Jack Fremont')).toEqual(expectedRemarks);
  });

  test('remarks is null', () => {
    expect(formatRemarksSoldText(null, 4, 'JMF', 'Jack Fremont')).toEqual('');
  });

  test('part has been sold before', () => {
    const remarks = `^ 1 SOLD BY JMF ${formatDate(new Date())} Jack Fremont ^^(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6`;
    const expectedRemarks = `^ 4 SOLD BY JMF ${formatDate(new Date())} Jack Fremont ^^${remarks}`;
    expect(formatRemarksSoldText(remarks, 4, 'JMF', 'Jack Fremont')).toEqual(expectedRemarks);
  });
});
