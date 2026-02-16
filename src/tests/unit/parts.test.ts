import { formatRemarksSoldText, removeRemarksSoldText } from '@/scripts/logic/parts';
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

describe('removeRemarksSoldText', () => {
  test('Normal remarks sold input', () => {
    const remarks = '^ SOLD BY JMF 2/16/2026 Jack Fremont ^^(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6';
    const expectedRemarks = '(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6';
    expect(removeRemarksSoldText(remarks)).toEqual(expectedRemarks);
  });

  test('Remarks with no sold text', () => {
    const remarks = '(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6';
    const expectedRemarks = '(8.5) PBBD AND CCPD, SEE PIC - SOME RUST PITTING IN CORNER OF TOP DECK, 6';
    expect(removeRemarksSoldText(remarks)).toEqual(expectedRemarks);
  });

  test('Remarks is null', () => {
    expect(removeRemarksSoldText(null)).toEqual('');
  });

  test('Remarks with multiple sold text lines', () => {
    const remarks = '^ 1 SOLD BY BS 02/12/2026 MIDWEST/NEW PARTS ^^^ 1 SOLD BY TT 2/5/2026 Doug Burdick ^^(10.0) NTO, ELBOW ADAPTER FOR TURBO LINES, LOOKS VERY NICE';
    const expectedRemarks = '(10.0) NTO, ELBOW ADAPTER FOR TURBO LINES, LOOKS VERY NICE';
    expect(removeRemarksSoldText(remarks)).toEqual(expectedRemarks);
  });
});
