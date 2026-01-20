import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addCustomer, customerMerge, getCustomerById, getCustomerByName, searchCustomers } from '@/scripts/services/customerService';
import { getHandwrittenById } from '@/scripts/services/handwrittensService';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'bennett', password: 'mwdup' });
});


describe('Customers Integration', () => {
  it('Get customer by id', async () => {
    const customer = {
      id: 1,
      legacyId: 1,
      company: '2 & 92 TRUCK PARTS',
      contact: 'RICK',
      partsManager: null,
      partsManagerEmail: null,
      serviceManager: null,
      serviceManagerEmail: null,
      other: 'JMF',
      phone: '8008244564',
      billToPhone: null,
      fax: '3092929211',
      email: null,
      terms: 'COD',
      billToAddress: '611 158TH ST',
      billToAddress2: null,
      billToCity: 'EAST MOLINE',
      billToState: 'IL',
      billToZip: '61244',
      shipToAddress: '611 158TH ST',
      shipToAddress2: 'RM',
      shipToCity: 'EAST MOLINE',
      shipToState: 'IL',
      shipToZip: '61244',
      comments: null,
      customerType: 'Salvage Yard',
      source: 'WOM',
      country: null,
      isTaxable: false,
      paymentType: null,
      contacts: []
    };
    const res = await getCustomerById(1);
    expect(res).toMatchObject(customer);
  });

  it('Create customer', async () => {
    await addCustomer('JOHN SMITH TEST');
    const res = await getCustomerByName('JOHN SMITH TEST');
    expect(res).toMatchObject({ company: 'JOHN SMITH TEST' });
  });

  it('Search customer', async () => {
    const res = await searchCustomers({ name: '271 tr', phone: '', state: '', zip: '', country: '', customerType: '', page: 1, limit: 25 });
    expect(res.rows[0]).toMatchObject({ company: '271 TRUCK SERVICE' });
  });

  it('Merge customer', async () => {
    await customerMerge(2, 4);
    const badCustomer = await getCustomerById(2);
    const handwritten = await getHandwrittenById(101);
    expect(handwritten?.customer.id).toEqual(4);
    expect(badCustomer).toBeFalsy();
  });
});
