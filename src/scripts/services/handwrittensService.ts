import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { filterNullObjValuesArr } from "../tools/utils";
import { getCoresByCustomer, getCoreReturnsByCustomer } from "./coresService";

interface HandwrittenSearchData {
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
          date: item.date && parseResDate(item.date),
        };
      }) : [],
    };
  });
};

// === GET routes === //

export const getHandwrittenById = async (id: number): Promise<Handwritten | null> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/id/${id}`, auth);
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
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/item/id/${id}`, auth);
    return { ...res.data, date: parseResDate(res.data.date) };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSomeHandwrittens = async (page: number, limit: number, onlyShowRecent = false): Promise<{ pageCount: number, rows: Handwritten[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/limit/${JSON.stringify({ page: (page - 1) * limit, limit, onlyShowRecent })}`, auth);
    return { pageCount: res.data.pageCount, rows: await parseHandwrittenRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchHandwrittens = async (handwritten: HandwrittenSearchData): Promise<{ pageCount: number, rows: Handwritten[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/search/${JSON.stringify(handwritten)}`, auth);
    return { pageCount: res.data.pageCount, rows: await parseHandwrittenRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchSelectHandwrittensDialogData = async (handwritten: HandwrittenSearchData): Promise<{ pageCount: number, rows: SelectHandwrittenDialogResult[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/select-handwritten/${JSON.stringify(handwritten)}`, auth);
    const rows = res.data.rows.map((row: SelectHandwrittenDialogResult) => ({ ...row, date: parseResDate(row.date as any) }));
    return { pageCount: res.data.pageCount, rows };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getSomeHandwrittensByStatus = async (page: number, limit: number, status: string): Promise<{ pageCount: number, rows: Handwritten[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/status/${JSON.stringify({ page: (page - 1) * limit, limit, status })}`, auth);
    const parsedData = res.data.rows.map((row: any) => {
      return { ...row, date: parseResDate(row.date) };
    });
    return { pageCount: res.data.pageCount, rows: parsedData };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getSomeUnsoldItems = async (page: number, limit: number, salesmanId: number): Promise<{ pageCount: number, rows: SalesEndOfDayItem[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/unsold-items/${JSON.stringify({ page: (page - 1) * limit, limit, salesmanId })}`, auth);
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
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/end-of-day`, auth);
    return parseHandwrittenRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getYeserdaySales = async (): Promise<number> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/yesterday-sales`, auth);
    return Number(res.data.sum);
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getYeserdayCOGS = async (): Promise<number> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/yesterday-cogs`, auth);
    return Number(res.data.sum);
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getHandwrittenEmails = async (customerId: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/emails/${customerId}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
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

export const addHandwritten = async (handwritten: Handwritten) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/handwrittens', handwritten, auth);
    checkForCustomerAlert(handwritten.customer);
    return (res as any).data.id;
  } catch (err) {
    console.error(err);
  }
};

export const addHandwrittenItem = async (item: NewHandwrittenItem) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/handwrittens/item', item, auth);
    return (res as any).data.id;
  } catch (err) {
    console.error(err);
  }
};

export const addHandwrittenItemChild = async (parentId: number, item: NewHandwrittenItemChild) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/handwrittens/child', { parentId, item }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editHandwrittenPaymentType = async (id: number, payment: string) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/handwrittens/payment', { id, payment }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenTakeoffState = async (id: number, isTakeoffDone: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/handwrittens/takeoff', { id, isTakeoffDone }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenTaxable = async (id: number, value: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/handwrittens/taxable', { id, value }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenPromotionals = async (id: number, mp: number, cap: number, br: number, fl: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/handwrittens/promotionals', { id, mp, cap, br, fl }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editHandwritten = async (invoice: Handwritten) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/handwrittens', invoice, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenItem = async (item: HandwrittenItem) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/handwrittens/items', item, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenItemChild = async (item: HandwrittenItemChild) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/handwrittens/items/child', item, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenOrderNotes = async (id: number, orderNotes: string) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/handwrittens/order-notes', { id, orderNotes }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteHandwritten = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/handwrittens/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteHandwrittenItem = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/handwrittens/item/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteHandwrittenItemChild = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/handwrittens/item-child/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

