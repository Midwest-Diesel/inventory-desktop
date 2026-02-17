import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addBlankPurchaseOrder, getSomePurchaseOrders } from '@/scripts/services/purchaseOrderService';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'test', password: 'mwdup' });
});


describe('Purchase Orders Integration', () => {
  it('New PO', async () => {
    const oldRes = await getSomePurchaseOrders(1, 999, false);
    await addBlankPurchaseOrder();
    const newRes = await getSomePurchaseOrders(1, 999, false);
    expect(newRes.rows.length).toEqual(oldRes.rows.length + 1);
  });
});
