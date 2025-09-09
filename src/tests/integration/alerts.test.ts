import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { client, resetDb } from '../resetDatabase';
import { addAlert, getAlerts } from '@/scripts/services/alertsService';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';

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


describe('Alerts Integration', () => {
  it('Fetch alerts', async () => {
    const res = await getAlerts();
    const alert = {
      addedBy: 'TT',
      date: new Date('2021-04-13T05:00:00.000Z'),
      id: 805,
      note: '3406E/C15 Gear - Lots of matches!  6I4578 Is for older 5ek, uses a 6I3621 stubshaft, 1304701 uses a 1302979 or 1515966 subshaft',
      partNum: '1304701',
      salesmanId: 8,
      type: 'ALERT!!!',
    };
    expect(res[0]).toEqual(alert);
  });
  
  it('Create alert', async () => {
    const newAlert = {
      date: new Date('2025-09-08T05:00:00.000Z'),
      salesmanId: 1,
      partNum: '123123',
      type: 'HUDDLE UP!!!',
      note: null
    };
    await addAlert(newAlert);

    const alert = {
      type: 'HUDDLE UP!!!',
      partNum: '123123',
      date: new Date('2025-09-08T05:00:00.000Z'),
      addedBy: 'BS',
      salesmanId: 1,
      note: null
    };
    const res = await getAlerts();
    expect(res[0]).toEqual(expect.objectContaining(alert));
  });
});
