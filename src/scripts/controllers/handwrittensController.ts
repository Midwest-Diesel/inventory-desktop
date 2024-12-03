import api from "../config/axios";

import { parseResDate } from "../tools/stringUtils";
import { filterNullObjValuesArr } from "../tools/utils";
import { getCoresByCustomer, getCoreReturnsByCustomer } from "./coresController";

interface HandwrittenSearchData {
  id?: number
  customer?: string
  date?: Date
  poNum?: string
}

export interface AltShip {
  id?: number
  handwrittenId: number
  shipToAddress: string
  shipToAddress2: string
  shipToCity: string
  shipToState: string
  shipToZip: string
  shipToContact: string
  shipToCompany: string
}


export const parseHandwrittenRes = (data: any) => {
  return data.map((invoice: any) => {
    return {
      ...invoice,
      date: invoice.date && parseResDate(invoice.date),
      handwrittenItems: filterNullObjValuesArr(invoice.handwrittenItems.filter((item) => item)).map((item: any) => {
        return {
          ...item,
          date: item.date && parseResDate(item.date),
          invoiceItemChildren: item.invoiceItemChildren ? item.invoiceItemChildren : []
        };
      }).sort((a: any, b: any) => a.id - b.id).reverse(),
      coreReturns: invoice.coreReturns ? invoice.coreReturns.map((item: any) => {
        return {
          ...item,
          date: item.date && parseResDate(item.date),
        };
      }) : [],
    };
  });
};

// === GET routes === //

export const getAllHandwrittens = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/handwrittens', auth);
    return parseHandwrittenRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getHandwrittenById = async (id: number) => {
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
  }
};

export const getSomeHandwrittens = async (page: number, limit: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/limit/${JSON.stringify({ page: (page - 1) * limit, limit: limit })}`, auth);
    return await parseHandwrittenRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchHandwrittens = async (invoice: HandwrittenSearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/search/${JSON.stringify(invoice)}`, auth);
    return await parseHandwrittenRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getHandwrittensByDate = async (date: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/date/${JSON.stringify(date)}`, auth);
    return parseHandwrittenRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getHandwrittenCount = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/handwrittens/count', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAltShipByHandwritten = async (handwrittenId: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/alt-ship/${handwrittenId}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getFreightCarrierFromShipVia = async (name: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/handwrittens/freight-carrier/${name}`, auth);
    return res.data.type;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addHandwritten = async (invoice: Handwritten) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/handwrittens', invoice, auth);
    return (res as any).data.id;
  } catch (err) {
    console.error(err);
  }
};

export const addHandwrittenItem = async (item: HandwrittenItem) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/handwrittens/item', item, auth);
  } catch (err) {
    console.error(err);
  }
};

export const addBlankHandwritten = async (data: { date: Date, userId: number, customerId: number }) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/handwrittens/blank', data, auth);
    return (res as any).data.id;
  } catch (err) {
    console.error(err);
  }
};

export const addAltShipAddress = async (altShip: AltShip) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/handwrittens/alt-ship', altShip, auth);
  } catch (err) {
    console.error(err);
  }
};

export const addHandwrittenItemChild = async (handwrittenId: number, item: HandwrittenItemChild) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/handwrittens/child', { handwrittenId, item }, auth);
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

export const editHandwrittenItems = async (item: HandwrittenItem) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/handwrittens/items', item, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editHandwrittenOrderNotes = async (id: number, orderNotes: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await getHandwrittenById(id);
    const existingNotes = res.orderNotes ? res.orderNotes : '';
    const newOrderNotes = orderNotes
      .split('\n')
      .filter((note) => !existingNotes.toLowerCase().includes(note.toLowerCase()))
      .join('\n');

    if (newOrderNotes) {
      await api.put('/api/handwrittens/order-notes', { id, orderNotes: `${newOrderNotes}\n` }, auth);
    }
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

export const deleteAltShipAddress = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/handwrittens/alt-ship/${id}`, auth);
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

