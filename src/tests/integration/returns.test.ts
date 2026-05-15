import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { loginUser } from "@/scripts/services/accountService";
import { addReturn, getReturnById } from "@/scripts/services/returnsService";
import { resetDb } from "../resetDatabase";
import { setApiBaseUrl } from "@/scripts/config/axios";

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'test', password: 'mwdup' });
});

const date = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};


describe('Returns Integration', async () => {
  it('Create return', async () => {
    const returnData = {
      customer: { id: 1 },
      handwrittenId: 1,
      invoiceDate: date(),
      dateReceived: date(),
      creditIssued: date(),
      returnNotes: 'notes',
      returnReason: 'reason',
      returnPaymentTerms: 'terms',
      restockFee: 'None',
      billToCompany: 'McDonalds',
      billToAddress: '3051 82nd Lane NE',
      billToAddress2: null,
      billToCity: 'Blaine',
      billToState: 'MN',
      billToZip: '55448',
      billToContact: 'Matt',
      billToPhone: '(888) 866-3406',
      shipToCompany: null,
      shipToAddress: null,
      shipToAddress2: null,
      shipToCity: null,
      shipToState: null,
      shipToZip: null,
      poNum: '5489',
      payment: null,
      source: null
    } as any;
    const id = await addReturn({ ...returnData, salesmanId: 1 });
    const res = await getReturnById(Number(id));

    expect(res).toMatchObject(returnData);
  });
});