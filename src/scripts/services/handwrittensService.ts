import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { filterNullObjValuesArr } from "../tools/utils";
import { getCoresByCustomer, getCoreReturnsByCustomer } from "./coresService";

export interface HandwrittenSearch {
  id?: number
  customerId?: number
  date?: string
  poNum?: string
  billToCompany?: string
  shipToCompany?: string
  source?: string
  payment?: string
  limit: number
  offset: number
}

interface NewHandwrittenItem {
  handwrittenId: number
  date: Date
  desc: string | null
  partNum: string | null
  stockNum: string | null
  unitPrice: number
  qty: number
  cost: number
  location: string | null
  partId: number | null
}

interface NewHandwrittenItemChild {
  partId: number | null
  qty: number
  cost: number
}


export const parseHandwrittenRes = (data: any) => {
  return data.map((handwritten: any) => {
    return {
      ...handwritten,
      date: handwritten.date && parseResDate(handwritten.date),
      handwrittenItems: filterNullObjValuesArr(handwritten.handwrittenItems.filter((item: HandwrittenItem) => item)).map((item: any) => {
        return {
          ...item,
          date: item.date && parseResDate(item.date),
          invoiceItemChildren: item.invoiceItemChildren ? item.invoiceItemChildren : []
        };
      }).sort((a: any, b: any) => a.id - b.id).reverse(),
      coreReturns: handwritten.coreReturns ? handwritten.coreReturns.map((item: any) => {
        return {
          ...item,
          date: item.date && parseResDate(item.date)
        };
      }) : []
    };
  });
};

// === GET routes === //

export const getHandwrittenById = async (id: number): Promise<Handwritten | null> => {
  try {
    const res = await api.get(`/api/handwrittens/id/${id}`);
    const cores = await getCoresByCustomer(res.data[0].customer.id, id);
    res.data[0].cores = cores;
    const coreReturns = await getCoreReturnsByCustomer(res.data[0].customer.id);
    res.data[0].coreReturns = coreReturns;
    return parseHandwrittenRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getHandwrittenItemById = async (id: number): Promise<HandwrittenItem | null> => {
  try {
    const res = await api.get(`/api/handwrittens/item/id/${id}`);
    return { ...res.data, date: parseResDate(res.data.date) };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSomeHandwrittens = async (page: number, limit: number, onlyShowRecent = false): Promise<{ pageCount: number, rows: Handwritten[] }> => {
  try {
    const res = await api.get(`/api/handwrittens/limit/${JSON.stringify({ page: (page - 1) * limit, limit, onlyShowRecent })}`);
    return { pageCount: res.data.pageCount, rows: await parseHandwrittenRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchHandwrittens = async (handwritten: HandwrittenSearch): Promise<{ pageCount: number, rows: Handwritten[] }> => {
  try {
    const res = await api.get(`/api/handwrittens/search/${JSON.stringify(handwritten)}`);
    return { pageCount: res.data.pageCount, rows: await parseHandwrittenRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchSelectHandwrittensDialogData = async (handwritten: HandwrittenSearch): Promise<{ pageCount: number, rows: SelectHandwrittenDialogResult[] }> => {
  try {
    const res = await api.get(`/api/handwrittens/select-handwritten/${JSON.stringify(handwritten)}`);
    const rows = res.data.rows.map((row: SelectHandwrittenDialogResult) => ({ ...row, date: parseResDate(row.date as any) }));
    return { pageCount: res.data.pageCount, rows };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getSomeHandwrittensByStatus = async (page: number, limit: number, status: string): Promise<{ pageCount: number, rows: Handwritten[] }> => {
  try {
    const res = await api.get(`/api/handwrittens/status/${JSON.stringify({ page: (page - 1) * limit, limit, status })}`);
    const parsedData = res.data.rows.map((row: any) => {
      return { ...row, date: parseResDate(row.date) };
    });
    return { pageCount: res.data.pageCount, rows: parsedData };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getCustomerHandwrittenItems = async (billToCompany: string): Promise<CustomerHandwrittenItem[]> => {
  try {
    const res = await api.get(`/api/handwrittens/item/customer/${billToCompany}`);
    return res.data.map((item: any) => ({ ...item, date: parseResDate(item.date) }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSomeUnsoldItems = async (page: number, limit: number, salesmanId: number): Promise<{ pageCount: number, rows: SalesEndOfDayItem[] }> => {
  try {
    const res = await api.get(`/api/handwrittens/unsold-items/${JSON.stringify({ page: (page - 1) * limit, limit, salesmanId })}`);
    return {
      pageCount: res.data.pageCount,
      rows: res.data.rows.map((item: any) => {
        return { ...item, date: parseResDate(item.date) };
      })
    };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getEndOfDayHandwrittens = async () => {
  try {
    const res = await api.get(`/api/handwrittens/end-of-day`);
    return parseHandwrittenRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getYeserdaySales = async (): Promise<number> => {
  try {
    const res = await api.get(`/api/handwrittens/yesterday-sales`);
    return Number(res.data.sum);
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getYeserdayCOGS = async (): Promise<number> => {
  try {
    const res = await api.get(`/api/handwrittens/yesterday-cogs`);
    return Number(res.data.sum);
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getHandwrittenEmails = async (customerId: number): Promise<string[]> => {
  try {
    const res = await api.get(`/api/handwrittens/emails/${customerId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

const checkForCustomerAlert = (customer: Customer | null) => {
  if (!customer) return;
  if (customer.comments?.split(' ').some((c: string) => c.trim().toLowerCase().includes('residential'))) {
    alert('Customer has residential address');
  } else if (customer.comments?.split(' ').some((c: string) => c.trim().toLowerCase().includes('remote'))) {
    alert('Customer has remote address');
  }
};

export const addHandwritten = async (handwritten: Handwritten): Promise<number | null> => {
  try {
    const res = await api.post('/api/handwrittens', handwritten);
    // Add TAX line item if customer is taxable
    if (handwritten.customer.isTaxable) {
      const item = {
        handwrittenId: Number(res.data.id),
        date: new Date(),
        desc: 'TAX',
        partNum: 'TAX',
        stockNum: '',
        unitPrice: 0,
        qty: 1,
        cost: 0,
        location: '',
        partId: null,
        invoiceItemChildren: []
      } as any;
      await addHandwrittenItem(item);
    }

    checkForCustomerAlert(handwritten.customer);
    return Number(res.data.id);
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addHandwrittenItem = async (item: NewHandwrittenItem): Promise<number | null> => {
  try {
    const res = await api.post('/api/handwrittens/item', item);
    return Number(res.data.id);
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addHandwrittenItemChild = async (parentId: number, item: NewHandwrittenItemChild) => {
  try {
    await api.post('/api/handwrittens/child', { parentId, item });
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editHandwrittenPaymentType = async (id: number, payment: string) => {
  try {
    await api.patch('/api/handwrittens/payment', { id, payment });
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenTakeoffState = async (id: number, isTakeoffDone: boolean) => {
  try {
    await api.patch('/api/handwrittens/takeoff', { id, isTakeoffDone });
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenTaxable = async (id: number, value: boolean) => {
  try {
    await api.patch('/api/handwrittens/taxable', { id, value });
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenPromotionals = async (id: number, mp: number, cap: number, br: number, fl: number) => {
  try {
    await api.patch('/api/handwrittens/promotionals', { id, mp, cap, br, fl });
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editHandwritten = async (handwritten: Handwritten) => {
  try {
    await api.put('/api/handwrittens', handwritten);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenItem = async (item: HandwrittenItem) => {
  try {
    await api.put('/api/handwrittens/items', item);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenItemChild = async (item: HandwrittenItemChild) => {
  try {
    await api.put('/api/handwrittens/items/child', item);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenOrderNotes = async (id: number, orderNotes: string) => {
  try {
    await api.put('/api/handwrittens/order-notes', { id, orderNotes });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteHandwritten = async (id: number) => {
  try {
    await api.delete(`/api/handwrittens/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deleteHandwrittenItem = async (id: number) => {
  try {
    await api.delete(`/api/handwrittens/item/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deleteHandwrittenItemChild = async (id: number) => {
  try {
    await api.delete(`/api/handwrittens/item-child/${id}`);
  } catch (err) {
    console.error(err);
  }
};

