import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { client, resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addHandwritten, addHandwrittenItemChild, editHandwritten, editHandwrittenTakeoffState, getHandwrittenById, getHandwrittenItemById, searchHandwrittens } from '@/scripts/services/handwrittensService';

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


describe('Handwrittens Integration', () => {
  it('Get handwritten by id', async () => {
    const handwritten = {
      id: 1,
      invoiceId: 92025,
      legacyId: 52085,
      customerId: 5,
      poNum: '136087',
      billToCompany: 'MIDWEST INDUSTRIAL SALES',
      billToAddress: '423 Industry Ave',
      billToAddress2: null,
      billToCity: 'GARDNER',
      billToState: 'IL',
      billToZip: '60424',
      billToCountry: 'United States',
      shipToContact: null,
      billToPhone: null,
      fax: null,
      shipToCompany: 'DEM-CON',
      shipToAddress: '13020 DEM-CON DR',
      shipToAddress2: null,
      shipToCity: 'SHAKOPEE',
      shipToState: 'MN',
      shipToZip: '55379',
      source: 'RC/Direct Contact',
      payment: 'Card on File',
      phone: '(815) 423-5961',
      cell: null,
      customerEngineInfo: 'PART#',
      isBlindShipment: true,
      isNoPriceInvoice: true,
      contactName: 'Jill',
      cardNum: null,
      expDate: null,
      cardZip: null,
      paymentComplete: false,
      invoiceStatus: 'SENT TO ACCOUNTING',
      accountingStatus: 'COMPLETE',
      shippingStatus: null,
      orderNotes: null,
      shippingNotes: null,
      mp: 0,
      cap: 0,
      br: 0,
      fl: 0,
      isCollect: false,
      isThirdParty: true,
      isEndOfDay: false,
      isTaxable: false,
      isSetup: false,
      thirdPartyAccount: '654432',
      email: null,
      cvv: null,
      cardName: null,
      shipViaId: 4,
      salesmanId: 4,
      createdBy: 'JMF',
      createdById: 4,
      soldBy: 'JMF',
      soldById: 4,
      cores: [],
      coreReturns: [],
      customer: { id: 5, company: 'mike', contacts: [] },
      handwrittenItems: [
        {
          HasChildren: false,
          PendingInvoiceItemsID: 139693,
          cost: 0,
          date: null,
          desc: 'UPS Ground',
          dimsQty: 0,
          handwrittenId: 1,
          height: 0,
          id: 1,
          invoiceItemChildren: [],
          isInvoiced: false,
          isQuoteChecked: false,
          isTakeoffDone: false,
          legacyId: 139693,
          length: 0,
          location: null,
          partId: 1,
          partNum: 'FREIGHT',
          qty: 1,
          stockNum: null,
          unitPrice: 0,
          weight: 0,
          width: 0
        }
      ],
      shipVia: {
        id: 4,
        isSkidRateApplied: false,
        name: 'CONWAY',
        type: 'Truck Line'
      },
      trackingNumbers: []
    };
    const res = await getHandwrittenById(1);
    expect(res).toEqual(expect.objectContaining(handwritten));
  });

  it('Search handwrittens', async () => {
    const res = await searchHandwrittens({ billToCompany: 'wesley', limit: 24, offset: 0 });
    expect(res.rows[0]).toEqual(expect.objectContaining({ billToCompany: 'WESLEY INDUSTRIAL' }));
  });

  it('Add handwritten', async () => {
    const newHandwritten = {
      id: 101,
      invoiceId: null,
      legacyId: null,
      customer: {
        id: 1,
        company: "LEAVITT MACHINERY - TUKWILA",
        contacts: []
      },
      customerId: 1,
      handwrittenItems: [],
      createdBy: null,
      createdById: null,
      soldBy: null,
      soldById: null,
      poNum: null,
      salesmanId: null,
      billToAddress: '17300 W VALLEY HWY',
      billToAddress2: null,
      billToCity: 'TUKWILA',
      billToState: 'WA',
      billToZip: '98188',
      billToCountry: null,
      billToCompany: 'LEAVITT MACHINERY - TUKWILA',
      billToPhone: null,
      fax: null,
      email: null,
      contactName: null,
      shipToAddress: '17300 W VALLEY HWY',
      shipToAddress2: null,
      shipToCity: 'TUKWILA',
      shipToState: 'WA',
      shipToZip: '98188',
      shipToCompany: 'LEAVITT MACHINERY - TUKWILA',
      shipToContact: null,
      source: null,
      payment: null,
      paymentComplete: false,
      phone: null,
      cell: null,
      customerEngineInfo: null,
      isBlindShipment: false,
      isNoPriceInvoice: false,
      shipVia: null,
      shipViaId: null,
      cardNum: null,
      expDate: null,
      cvv: null,
      cardZip: null,
      cardName: null,
      orderNotes: null,
      invoiceStatus: 'INVOICE PENDING',
      accountingStatus: null,
      shippingStatus: null,
      cores: [],
      coreReturns: [],
      shippingNotes: null,
      mp: 0,
      br: 0,
      cap: 0,
      fl: 0,
      isCollect: false,
      isThirdParty: false,
      isTaxable: false,
      isSetup: false,
      isEndOfDay: false,
      trackingNumbers: [],
      thirdPartyAccount: null
    };
    await addHandwritten(newHandwritten as any);
    
    const res = await getHandwrittenById(101);
    expect(res).toEqual(expect.objectContaining(newHandwritten));
  });

  it('Edit handwritten', async () => {
    await editHandwritten({ id: 1, billToCompany: 'TEST' } as any);
    const res = await getHandwrittenById(1);
    expect(res).toEqual(expect.objectContaining({ id: 1, billToCompany: 'TEST' }));
  });

  it('Edit takeoff state', async () => {
    await editHandwrittenTakeoffState(1, true);
    const res = await getHandwrittenItemById(1);
    expect(res?.isTakeoffDone).toEqual(true);
  });

  it('Add item child', async () => {
    const child = {
      cost: 100,
      id: 101,
      legacyParentId: null,
      legacyPartId: null,
      parentId: 2,
      partId: 1,
      partNum: '2422411',
      qty: 1,
      stockNum: 'VC3814'
    };
    await addHandwrittenItemChild(2, { cost: 100, partId: 1, qty: 1 });
    const res = await getHandwrittenById(2);
    expect(res?.handwrittenItems[0].invoiceItemChildren[0]).toEqual(expect.objectContaining(child));
  });
});
