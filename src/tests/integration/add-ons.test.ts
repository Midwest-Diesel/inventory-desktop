import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addAltParts, removeAltParts } from '@/scripts/logic/parts';
import { getAddOnById } from '@/scripts/services/addOnsService';
import { resetDb } from '../resetDatabase';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'bennett', password: 'mwdup' });
});


describe('Add Ons Integration', () => {
  it('Sync addon alt parts when an alt part is added to one of them', async () => {
    await addAltParts('6057481', ['0323237']);
    const res = await getAddOnById(18);
    expect(res?.altParts).toEqual(['6057481', '0323237', '323237', '1W4589', '1336934']);
  });

  it('Sync addon alt parts when an alt part is removed from one of them', async () => {
    await removeAltParts('6057481', ['1W4589']);
    const res = await getAddOnById(18);
    expect(res?.altParts).toEqual(['6057481']);
  });

  it('Sync addon alt parts when many alt parts are removed from one of them', async () => {
    await removeAltParts('6057481', ['0323237', '323237', '1W4589', '1336934']);
    const res = await getAddOnById(18);
    expect(res?.altParts).toEqual(['6057481']);
  });
});
