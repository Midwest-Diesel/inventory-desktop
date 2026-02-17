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
  await loginUser({ username: 'test', password: 'mwdup' });
});


describe('Customers Integration', () => {
  it('Get customer by id', async () => {
    const customer = {
      id: 1,
      legacyId: null,
      company: 'HEAVY DUTY REBUILDERS',
      contact: 'BURK DAY',
      partsManager: null,
      partsManagerEmail: null,
      serviceManager: null,
      serviceManagerEmail: null,
      other: null,
      phone: '(800) 873-8783',
      billToPhone: null,
      fax: '(417) 581-9808',
      email: null,
      terms: 'NET 30',
      billToAddress: '1250 WEST LIBERTY AVE',
      billToAddress2: null,
      billToCity: 'OZARK',
      billToState: 'MO',
      billToZip: '65721',
      shipToAddress: '1250 WEST LIBERTY AVE',
      shipToAddress2: null,
      shipToCity: 'OZARK',
      shipToState: 'MO',
      shipToZip: '65721',
      comments: '6050 N Cabinet Drive',
      customerType: 'Vendor',
      source: 'RC',
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
    const res = await searchCustomers({ name: 'duty', phone: '', city: '', state: '', zip: '', country: '', customerType: '', page: 1, limit: 25 });
    expect(res.rows[0]).toMatchObject({ company: 'HEAVY DUTY REBUILDERS' });
  });

  it('Merge customer', async () => {
    await customerMerge(2, 1);
    const badCustomer = await getCustomerById(2);
    const handwritten = await getHandwrittenById(2);
    expect(handwritten?.customer.id).toEqual(1);
    expect(badCustomer).toBeFalsy();
  });
});
