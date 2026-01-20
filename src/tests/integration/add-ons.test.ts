import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addAltParts, removeAltParts } from '@/scripts/logic/parts';
import { getAddOnById, getAllAddOns } from '@/scripts/services/addOnsService';
import { resetDb } from '../resetDatabase';
import { addPart, getPartInfoByPartNum } from '@/scripts/services/partsService';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'bennett', password: 'mwdup' });
});


describe('Add Ons Integration', async () => {
  it('Sync addon alt parts when an alt part is added to one of them', async () => {
    await addAltParts('6057481', ['0323237']);
    const addOns = await getAllAddOns();
    const res = await getAddOnById(addOns[0].id);
    expect(res?.altParts).toEqual(['6057481', '0323237', '323237', '1W4589', '1336934']);
  });

  it('Sync addon alt parts when an alt part is removed from one of them', async () => {
    await removeAltParts('6057481', ['1W4589']);
    const addOns = await getAllAddOns();
    const res = await getAddOnById(addOns[0].id);
    expect(res?.altParts).toEqual(['6057481']);
  });

  it('Sync addon alt parts when many alt parts are removed from one of them', async () => {
    await removeAltParts('6057481', ['0323237', '323237', '1W4589', '1336934']);
    const addOns = await getAllAddOns();
    const res = await getAddOnById(addOns[0].id);
    expect(res?.altParts).toEqual(['6057481']);
  });

  it('Add altPart that doesn\'t exist in inventory', async () => {
    await addAltParts('6057481', ['123456']);
    const altParts = ['6057481', '123456'];
    const addOns = await getAllAddOns();
    const addOn = await getAddOnById(addOns[0].id);
    await addPart({ ...addOn, altParts } as Part, true);
    const res = await getPartInfoByPartNum('6057481');

    expect(res?.altParts).toEqual('6057481, 123456');
  });
});
