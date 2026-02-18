import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/userService';
import { addHandwritten, addHandwrittenItemChild, editHandwritten, editHandwrittenItemTakeoffState, getHandwrittenById, getHandwrittenItemById, getSomeHandwrittens, searchHandwrittens } from '@/scripts/services/handwrittensService';
import { addQtyInOut } from '@/scripts/logic/handwrittens';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'test', password: 'mwdup' });
});


describe('Handwrittens Integration', () => {
  it('Get handwritten by id', async () => {
    const handwritten = {
      id: 1,
      allTakeoffsCompleted: false,
      invoiceId: null,
      legacyId: null,
      customerId: 1,
      date: new Date("2026-02-17T06:00:00.000Z"),
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
      customer: { id: 1, company: 'HEAVY DUTY REBUILDERS', contacts: [] },
      coreReturns: [],
      cores: [],
      createdById: null,
      soldById: null,
      handwrittenItems: [
        {
          id: 3,
          legacyId: null,
          legacyInvoiceId: null,
          handwrittenId: 1,
          date: new Date("2026-02-17T06:00:00.000Z"),
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
          cost: null,
          date: new Date('2026-02-17T06:00:00.000Z'),
          desc: "EMERY AIR FREIGHT",
          dimsQty: 0,
          handwrittenId: 1,
          height: 0,
          id: 2,
          invoiceItemChildren: [],
          isInvoiced: null,
          isQuoteChecked: null,
          isTakeoffDone: false,
          legacyId: null,
          legacyInvoiceId: null,
          length: 0,
          location: null,
          partId: null,
          partNum: null,
          qty: 1,
          stockNum: null,
          unitPrice: 95,
          weight: 0,
          width: 0
        },
        {
          cost: 1060,
          date: new Date('2026-02-17T06:00:00.000Z'),
          desc: "PAID CK # 17495 09/13/96",
          dimsQty: 0,
          handwrittenId: 1,
          height: 0,
          id: 1,
          invoiceItemChildren: [
            {
              cost: 1060,
              id: 1,
              isTakeoffDone: false,
              parentId: 1,
              part: {
                condition: 'Good Used',
                coreFam: null,
                corePrice: 0,
                desc: 'VALVE COVER 3406',
                engineNum: 7259,
                enteredBy: 2000,
                entryDate: '2026-02-17',
                fastTrackStatus: null,
                fleetPrice: 161.87,
                handwrittenId: null,
                id: 1,
                invoiceNum: null,
                legacyId: 771790682,
                listPrice: 179.84,
                location: 'C5G4A',
                manufacturer: 'CATERPILLAR',
                partNum: '7E0333',
                priceLastUpdated: '2020-06-09',
                pricingNotes: null,
                purchasePrice: 0.01,
                purchasedFrom: 'CB1',
                qty: 34,
                qtySold: 0,
                rating: 0,
                reconDate: null,
                remanFleetPrice: 0,
                remanListPrice: 0,
                remarks: 'T/O, NTBBD',
                sellingPrice: null,
                soldTo: null,
                soldToDate: null,
                specialNotes: null,
                stockNum: 'UP9432',
                weightDims: null
              },
              partId: 1,
              partNum: '7E0333',
              qty: 1,
              stockNum: 'UP9432'
            }
          ],
          isInvoiced: null,
          isQuoteChecked: null,
          isTakeoffDone: false,
          legacyId: null,
          legacyInvoiceId: null,
          length: 0,
          location: null,
          partId: null,
          partNum: null,
          qty: 1,
          stockNum: null,
          unitPrice: -595,
          weight: 0,
          width: 0
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
      invoiceId: null,
      legacyId: null,
      customer: {
        id: 2,
        company: "ConEquip Parts & Equipment (14196)"
      },
      customerId: 2,
      handwrittenItems: [],
      createdBy: null,
      soldBy: null,
      poNum: null,
      billToAddress: '1250 WEST LIBERTY AVE',
      billToAddress2: null,
      billToCity: 'OZARK',
      billToState: 'MO',
      billToZip: '65721',
      billToCountry: null,
      billToCompany: 'ConEquip Parts & Equipment (14196)"',
      billToPhone: '8008738783',
      fax: null,
      email: null,
      contactName: null,
      shipToAddress: '1250 WEST LIBERTY AVE',
      shipToAddress2: null,
      shipToCity: 'OZARK',
      shipToState: 'MO',
      shipToZip: '65721',
      shipToCompany: 'ConEquip Parts & Equipment (14196)"',
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
      accountingStatus: 'COMPLETE',
      allTakeoffsCompleted: false,
      shippingStatus: null,
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
      thirdPartyAccount: null
    };
    await addHandwritten(newHandwritten as any);
    
    const res = await getSomeHandwrittens(1, 999);
    expect(res.rows[0]).toMatchObject(newHandwritten);
  });

  it('Edit handwritten', async () => {
    await editHandwritten({ id: 1, billToCompany: 'TEST' } as any);
    const res = await getHandwrittenById(1);
    expect(res).toMatchObject({ id: 1, billToCompany: 'TEST' });
  });

  it('Edit takeoff state', async () => {
    await editHandwrittenItemTakeoffState(1, true);
    const res = await getHandwrittenItemById(1);
    expect(res?.isTakeoffDone).toEqual(true);
  });

  it('Add item child', async () => {
    const child = {
      cost: 1060,
      parentId: 1,
      partId: 1,
      qty: 1,
      stockNum: 'UP9432'
    };
    await addHandwrittenItemChild(1, { cost: 100, partId: 1, qty: 1 });
    const res = await getHandwrittenById(1);
    expect(res?.handwrittenItems[2].invoiceItemChildren[0]).toMatchObject(child);
  });

  it('Add misc line item', async () => {
    await addQtyInOut(1, 'TEST', '123456', 1, 200, false);
    const res = await getHandwrittenById(1);
    const { desc, partNum, qty, unitPrice, stockNum, location } = res?.handwrittenItems[0] as HandwrittenItem;
    expect(desc).toEqual('TEST');
    expect(partNum).toEqual('123456');
    expect(qty).toEqual(1);
    expect(unitPrice).toEqual(200);
    expect(stockNum).toEqual('');
    expect(location).toEqual('');
  });

  it('Add IN/OUT line item', async () => {
    await addQtyInOut(1, 'TEST', '123456', 1, 200, true);
    const res = await getHandwrittenById(1);
    const { desc, partNum, qty, unitPrice, stockNum, location } = res?.handwrittenItems[0] as HandwrittenItem;
    expect(desc).toEqual('TEST');
    expect(partNum).toEqual('123456');
    expect(qty).toEqual(1);
    expect(unitPrice).toEqual(200);
    expect(stockNum).toEqual('IN/OUT');
    expect(location).toEqual('IN/OUT');
  });
});
