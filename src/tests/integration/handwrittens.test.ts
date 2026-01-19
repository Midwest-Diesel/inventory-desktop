import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addHandwritten, addHandwrittenItemChild, editHandwritten, editHandwrittenItemTakeoffState, getHandwrittenById, getHandwrittenItemById, searchHandwrittens } from '@/scripts/services/handwrittensService';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'bennett', password: 'mwdup' });
});


describe('Handwrittens Integration', () => {
  it('Get handwritten by id', async () => {
    const handwritten = {
      id: 1,
      allTakeoffsCompleted: false,
      invoiceId: 11,
      legacyId: null,
      customerId: 681,
      salesmanId: null,
      date: new Date("1996-09-28T05:00:00.000Z"),
      poNum: "8486",
      billToCompany: "HEAVY DUTY REBUILDERS",
      billToAddress: "1250 WEST LIBERTY AVE",
      billToAddress2: null,
      billToCity: "OZARK",
      billToState: "MO",
      billToZip: "65721",
      billToCountry: null,
      shipToContact: null,
      billToPhone: "8008738783",
      fax: null,
      shipToCompany: "HEAVY DUTY REBUILDERS",
      shipToAddress: null,
      shipToAddress2: null,
      shipToCity: null,
      shipToState: null,
      shipToZip: null,
      source: "FAST TRACK/PEED",
      payment: "NET 30",
      phone: null,
      cell: null,
      customerEngineInfo: null,
      isBlindShipment: null,
      isNoPriceInvoice: null,
      contactName: null,
      cardPrinted: null,
      paymentComplete: null,
      invoiceStatus: "SENT TO ACCOUNTING",
      accountingStatus: "COMPLETE",
      shippingStatus: null,
      orderNotes: null,
      shippingNotes: null,
      mp: 0,
      cap: 0,
      br: 0,
      fl: 0,
      isCollect: null,
      isThirdParty: null,
      isEndOfDay: null,
      isTaxable: null,
      isSetup: null,
      thirdPartyAccount: null,
      email: null,
      createdBy: null,
      soldBy: null,
      customer: { id: null, company: null, contacts: [] },
      coreReturns: [],
      cores: [],
      createdById: null,
      soldById: null,
      handwrittenItems: [
        {
          id: 104,
          legacyId: 1,
          legacyInvoiceId: 11,
          handwrittenId: 1,
          date: new Date("1996-08-05T05:00:00.000Z"),
          desc: "4N5534 FLYWHEEL HSNG",
          partNum: null,
          stockNum: null,
          unitPrice: 500,
          qty: 1,
          cost: null,
          location: null,
          partId: null,
          isInvoiced: null,
          isQuoteChecked: null,
          dimsQty: 0,
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          invoiceItemChildren: [],
          isTakeoffDone: false
        },
        {
          id: 103,
          legacyId: 2,
          legacyInvoiceId: 11,
          handwrittenId: 1,
          date: new Date("1996-08-05T05:00:00.000Z"),
          desc: "EMERY AIR FREIGHT",
          partNum: null,
          stockNum: null,
          unitPrice: 95,
          qty: 1,
          cost: null,
          location: null,
          partId: null,
          isInvoiced: null,
          isQuoteChecked: null,
          dimsQty: 0,
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          invoiceItemChildren: [],
          isTakeoffDone: false
        },
        {
          id: 102,
          legacyId: 165,
          legacyInvoiceId: 11,
          handwrittenId: 1,
          date: new Date("1996-08-05T05:00:00.000Z"),
          desc: "PAID CK # 17495 09/13/96",
          partNum: null,
          stockNum: null,
          unitPrice: -595,
          qty: 1,
          cost: null,
          location: null,
          partId: null,
          isInvoiced: null,
          isQuoteChecked: null,
          dimsQty: 0,
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          invoiceItemChildren: [],
          isTakeoffDone: false
        }
      ],
      shipViaId: null,
      shipVia: null,
      trackingNumbers: []
    };
    const res = await getHandwrittenById(1);
    expect(res).toMatchObject(handwritten);
  });

  it('Search handwrittens', async () => {
    const res = await searchHandwrittens({ billToCompany: 'heavy duty', limit: 24, offset: 0 });
    expect(res.rows[0]).toMatchObject({ billToCompany: 'HEAVY DUTY REBUILDERS' });
  });

  it('Add handwritten', async () => {
    const newHandwritten = {
      id: 101,
      invoiceId: null,
      legacyId: null,
      customer: {
        id: 1,
        company: "2 & 92 TRUCK PARTS",
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
      cardPrinted: false,
      orderNotes: null,
      invoiceStatus: 'INVOICE PENDING',
      accountingStatus: null,
      allTakeoffsCompleted: false,
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
    expect(res).toMatchObject(newHandwritten);
  });

  it('Edit handwritten', async () => {
    await editHandwritten({ id: 1, billToCompany: 'TEST' } as any);
    const res = await getHandwrittenById(1);
    expect(res).toMatchObject({ id: 1, billToCompany: 'TEST' });
  });

  it('Edit takeoff state', async () => {
    await editHandwrittenItemTakeoffState(103, true);
    const res = await getHandwrittenItemById(103);
    expect(res?.isTakeoffDone).toEqual(true);
  });

  it('Add item child', async () => {
    const child = {
      cost: 1060,
      id: 101,
      parentId: 101,
      partId: 1,
      qty: 1,
      stockNum: 'JB7308'
    };
    await addHandwrittenItemChild(2, { cost: 100, partId: 1, qty: 1 });
    const res = await getHandwrittenById(2);
    expect(res?.handwrittenItems[0].invoiceItemChildren[0]).toMatchObject(child);
  });

  it('Add misc line item', async () => {
    
  });

  it('Add IN/OUT line item', async () => {

  });
});
