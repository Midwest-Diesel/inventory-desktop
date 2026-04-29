import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/accountService';
import { addBlankPurchaseOrder, addPurchaseOrderItem, getPurchaseOrderById, getSomePurchaseOrders } from '@/scripts/services/purchaseOrderService';

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

  it('Add PO items', async () => {
    const newItem = {
      purchaseOrderId: 1,
      poNum: 123456,
      desc: 'MISC',
      qty: 1,
      unitPrice: 100,
      isReceived: false
    } as any;
    await addPurchaseOrderItem(newItem);
    const res = await getPurchaseOrderById(1);
    expect(res?.poItems[0]).toMatchObject(newItem);
  });
});
