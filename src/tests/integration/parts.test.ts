import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addPart, getPartInfoByPartNum, getPartsByStockNum } from '@/scripts/services/partsService';
import { addAltParts, removeAltParts } from '@/scripts/logic/parts';
import { resetDb } from '../resetDatabase';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'bennett', password: 'mwdup' });
});


describe('Parts Integration', () => {
  it('Add single alt part', async () => {
    await addAltParts('2251283', ['3949674']);
    const part1 = await getPartInfoByPartNum('2251283');
    const part2 = await getPartInfoByPartNum('3949674');

    expect(part1?.altParts).toEqual('2251283, 3949674, 20R4880');
    expect(part2?.altParts).toEqual('2251283, 3949674, 20R4880');
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
    await removeAltParts('10R3264', ['2447715', '2530615', '3740750', '20R2284', '10R3264R', '6180750', '6470750']);
    const part1 = await getPartInfoByPartNum('10R3264');
    const part2 = await getPartInfoByPartNum('2447715');
    const part3 = await getPartInfoByPartNum('2530615');
    const part4 = await getPartInfoByPartNum('3740750');
    const part5 = await getPartInfoByPartNum('20R2284');
    const part6 = await getPartInfoByPartNum('10R3264R');
    const part7 = await getPartInfoByPartNum('6180750');
    const part8 = await getPartInfoByPartNum('6470750');

    expect(part1?.altParts).toEqual('10R3264, 20R2284R');
    expect(part2?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750');
    expect(part3?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750');
    expect(part4?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750');
    expect(part5?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284R, 10R3264R, 6180750, 6470750, 20R2284');
    expect(part6?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750');
    expect(part7?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750');
    expect(part8?.altParts).toEqual('2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750');
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
    expect(partsInfo?.altParts).toEqual('RE548546, RE538863, 1231231232123');
  });

  it('Create a new part that exists in partsInfo', async () => {
    const part = {
      partNum: '2251283',
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
      altParts: ['RE548546', '2251283']
    } as any;
    await addPart(part, true);

    const partsInfo = await getPartInfoByPartNum('2251283');
    expect(partsInfo?.altParts).toEqual('2251283, RE548546');
    const newParts = await getPartsByStockNum('TEST123456');
    expect(newParts[0].desc).toEqual('TEST PART');
  });
});
