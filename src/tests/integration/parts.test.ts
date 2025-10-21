import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { client, resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addPart, getPartInfoByPartNum, getPartsByStockNum } from '@/scripts/services/partsService';
import { addAltParts, removeAltParts } from '@/scripts/logic/parts';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'bennett', password: 'mwdup' });
});

afterAll(async () => {
  await client.end();
});


describe('Parts Integration', () => {
  it('Add single alt part', async () => {
    await addAltParts('2251283', ['3949674']);
    const part1 = await getPartInfoByPartNum('2251283');
    const part2 = await getPartInfoByPartNum('3949674');

    expect(part1?.altParts).toEqual('2251283, 20R4880, 3949674');
    expect(part2?.altParts).toEqual('2251283, 20R4880, 3949674');
  });

  it('Add single alt part with multiple alt parts', async () => {
    await addAltParts('R23525567', ['7L0406']);
    const part1 = await getPartInfoByPartNum('R23525567');
    const part2 = await getPartInfoByPartNum('7L0406');
    const part3 = await getPartInfoByPartNum('9N3242');

    expect(part1?.altParts).toEqual('E23525567, R23525567, 7L0406, 9N3242');
    expect(part2?.altParts).toEqual('E23525567, R23525567, 7L0406, 9N3242');
    expect(part3?.altParts).toEqual('E23525567, R23525567, 7L0406, 9N3242');
  });

  it('Add multiple alt parts', async () => {
    await addAltParts('R23525567', ['7L0406', '9N3242']);
    const part1 = await getPartInfoByPartNum('R23525567');
    const part2 = await getPartInfoByPartNum('7L0406');
    const part3 = await getPartInfoByPartNum('9N3242');

    expect(part1?.altParts).toEqual('E23525567, R23525567, 7L0406, 9N3242');
    expect(part2?.altParts).toEqual('E23525567, R23525567, 7L0406, 9N3242');
    expect(part3?.altParts).toEqual('E23525567, R23525567, 7L0406, 9N3242');
  });

  it('Remove single alt part', async () => {
    await removeAltParts('11R1251', ['5865303']);
    const part1 = await getPartInfoByPartNum('11R1251');
    const part2 = await getPartInfoByPartNum('5441832');
    const part3 = await getPartInfoByPartNum('5865303');
    
    expect(part1?.altParts).toEqual('11R1251, 5441832');
    expect(part2?.altParts).toEqual('11R1251, 5441832');
    expect(part3?.altParts).toEqual('5865303');
  });

  it('Remove multiple alt parts', async () => {
    await removeAltParts('11R1251', ['5441832', '5865303']);
    const part1 = await getPartInfoByPartNum('11R1251');
    const part2 = await getPartInfoByPartNum('5441832');
    const part3 = await getPartInfoByPartNum('5865303');
    
    expect(part1?.altParts).toEqual('11R1251');
    expect(part2?.altParts).toEqual('5441832');
    expect(part3?.altParts).toEqual('5865303');
  });

  it('Remove many alt parts', async () => {
    await removeAltParts('1873875C98', ['1873875C97', '1873875C96', '1873875C95', '1873875C94', '1873875C93']);
    const part1 = await getPartInfoByPartNum('1873875C98');
    const part2 = await getPartInfoByPartNum('1873875C97');
    const part3 = await getPartInfoByPartNum('1873875C96');
    const part4 = await getPartInfoByPartNum('1873875C95');
    const part5 = await getPartInfoByPartNum('1873875C94');
    const part6 = await getPartInfoByPartNum('1873875C93');
    const part7 = await getPartInfoByPartNum('1873875C92');
    const part8 = await getPartInfoByPartNum('1873875C99');
    const part9 = await getPartInfoByPartNum('1873875C91');
    
    expect(part1?.altParts).toEqual('1873875C98, 1873875C92, 1873875C91, 1873875C99');
    expect(part2?.altParts).toEqual('1873875C97');
    expect(part3?.altParts).toEqual('1873875C96');
    expect(part4?.altParts).toEqual('1873875C95');
    expect(part5?.altParts).toEqual('1873875C94');
    expect(part6?.altParts).toEqual('1873875C93');
    expect(part7?.altParts).toEqual('1873875C98, 1873875C92, 1873875C91, 1873875C99');
    expect(part8?.altParts).toEqual('1873875C98, 1873875C92, 1873875C91, 1873875C99');
    expect(part9?.altParts).toEqual('1873875C98, 1873875C92, 1873875C91, 1873875C99');
  });

  it('Try to remove own partNum from alt parts', async () => {
    await removeAltParts('11R1251', ['11R1251', '5441832', '5865303']);
    const part1 = await getPartInfoByPartNum('11R1251');
    const part2 = await getPartInfoByPartNum('5441832');
    const part3 = await getPartInfoByPartNum('5865303');
    
    expect(part1?.altParts).toEqual('11R1251');
    expect(part2?.altParts).toEqual('5441832');
    expect(part3?.altParts).toEqual('5865303');
  });

  it('Create a new part', async () => {
    const part = {
      partNum: '1231231232123',
      manufacturer: '',
      desc: 'TEST PART',
      location: '123',
      remarks: '(10.0) TEST',
      entryDate: new Date(),
      qty: 1,
      stockNum: 'TEST123456',
      purchasePrice: 100,
      listPrice: 0,
      remanListPrice: 0,
      fleetPrice: 0,
      remanFleetPrice: 0,
      corePrice: 0,
      qtySold: 0,
      sellingPrice: 0,
      purchasedFrom: '',
      condition: 'NEW',
      rating: 10,
      handwrittenId: null,
      engineNum: 0,
      altParts: ['1231231232123']
    } as any;
    await addPart(part, false);

    const partsInfo = await getPartInfoByPartNum('1231231232123');
    expect(partsInfo?.altParts).toEqual('1231231232123');
  });

  it('Create a new part with alt parts', async () => {
    const part = {
      partNum: '1231231232123',
      manufacturer: '',
      desc: 'TEST PART',
      location: '123',
      remarks: '(10.0) TEST',
      entryDate: new Date(),
      qty: 1,
      stockNum: 'TEST123456',
      purchasePrice: 100,
      listPrice: 0,
      remanListPrice: 0,
      fleetPrice: 0,
      remanFleetPrice: 0,
      corePrice: 0,
      qtySold: 0,
      sellingPrice: 0,
      purchasedFrom: '',
      condition: 'NEW',
      rating: 10,
      handwrittenId: null,
      engineNum: 0,
      altParts: ['RE548546', 'RE538863']
    } as any;
    await addPart(part, false);

    const partsInfo = await getPartInfoByPartNum('1231231232123');
    expect(partsInfo?.altParts).toEqual('1231231232123, RE548546, RE538863');
  });

  it('Create a new part that exists in partsInfo', async () => {
    const part = {
      partNum: 'RE538863',
      manufacturer: '',
      desc: 'TEST PART',
      location: '123',
      remarks: '(10.0) TEST',
      entryDate: new Date(),
      qty: 1,
      stockNum: 'TEST123456',
      purchasePrice: 100,
      listPrice: 0,
      remanListPrice: 0,
      fleetPrice: 0,
      remanFleetPrice: 0,
      corePrice: 0,
      qtySold: 0,
      sellingPrice: 0,
      purchasedFrom: '',
      condition: 'NEW',
      rating: 10,
      handwrittenId: null,
      engineNum: 0,
      altParts: ['RE548546', 'RE538863']
    } as any;
    await addPart(part, true);

    const partsInfo = await getPartInfoByPartNum('RE538863');
    expect(partsInfo?.altParts).toEqual('RE538863, RE548546');
    const newParts = await getPartsByStockNum('TEST123456');
    expect(newParts[0].desc).toEqual('TEST PART');
  });
});
