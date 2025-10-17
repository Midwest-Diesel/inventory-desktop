import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { client, resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addCustomer, customerMerge, getCustomerById, getCustomers, searchCustomers } from '@/scripts/services/customerService';
import { getHandwrittenById } from '@/scripts/services/handwrittensService';

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


describe('Customers Integration', () => {
  it('Get customer by id', async () => {
    const customer = {
      id: 1,
      legacyId: 223128,
      CustomerID: 223128,
      company: 'LEAVITT MACHINERY - TUKWILA',
      contact: 'ZOEY',
      contacts: [],
      partsManager: null,
      partsManagerEmail: null,
      serviceManager: null,
      serviceManagerEmail: null,
      other: 'JS',
      phone: '(866) 906-1816',
      billToPhone: null,
      fax: null,
      email: 'ZCMCKAY@LEAVITT.CA',
      terms: null,
      billToAddress: '17300 W VALLEY HWY',
      billToAddress2: null,
      billToCity: 'TUKWILA',
      billToState: 'WA',
      billToZip: '98188',
      shipToAddress: '17300 W VALLEY HWY',
      shipToAddress2: null,
      shipToCity: 'TUKWILA',
      shipToState: 'WA',
      shipToZip: '98188',
      comments: null,
      customerType: 'Misc',
      source: 'MT Web - SH',
      country: null,
      isTaxable: false
    };
    const res = await getCustomerById(1);
    expect(res).toEqual(expect.objectContaining(customer));
  });

  it('Create customer', async () => {
    await addCustomer('JOHN SMITH');
  
    const res = await getCustomers();
    const customer = res[res.length - 1];
    expect(customer).toEqual(expect.objectContaining({ company: 'JOHN SMITH' }));
  });

  it('Search customer', async () => {
    const res = await searchCustomers({ name: 'conequip', phone: '', state: '', zip: '', country: '', customerType: '', page: 1, limit: 25 });
    expect(res.rows[0]).toEqual(expect.objectContaining({ company: 'ConEquip Parts & Equipment (14196)' }));
  });

  it('Merge customer', async () => {
    await customerMerge(5, 4);
    const badCustomer = await getCustomerById(5);
    const handwritten = await getHandwrittenById(1);
    expect(handwritten?.customer.id).toEqual(4);
    expect(badCustomer).toBeFalsy();
  });
});
