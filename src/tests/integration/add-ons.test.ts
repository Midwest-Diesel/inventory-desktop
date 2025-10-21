import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { client, resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addAltParts, removeAltParts } from '@/scripts/logic/parts';
import { getAddOnById } from '@/scripts/services/addOnsService';

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


describe('Add Ons Integration', () => {
  it('Sync addon alt parts when an alt part is added to one of them', async () => {
    await addAltParts('11R1251', ['5865303', '5441832']);
    const res = await getAddOnById(1);
    expect(res?.altParts).toEqual(['11R1251', '5865303', '5441832']);
  });

  it('Sync addon alt parts when an alt part is removed from one of them', async () => {
    await removeAltParts('11R1251', ['5441832']);
    const res = await getAddOnById(2);
    expect(res?.altParts).toEqual(['11R1251', '5865303']);
  });

  it('Sync addon alt parts when many alt parts are removed from one of them', async () => {
    await removeAltParts('1873875C98', ['1873875C97', '1873875C96', '1873875C95', '1873875C94', '1873875C93']);
    const res = await getAddOnById(3);
    expect(res?.altParts).toEqual(['1873875C98', '1873875C92', '1873875C99', '1873875C91']);
  });
});
