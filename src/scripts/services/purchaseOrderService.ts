import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface SearchData {
  poNum: number
  purchasedFrom: string
  purchasedFor: string
  isItemReceived: string
  orderedBy: string
  limit: number
  offset: number
}


const parsePoDataRes = (data: any) => {
  return data.map((d: PO) => {
    return {
      ...d,
      id: Number(d.id),
      shipToZip: Number(d.shipToZip),
      vendorZip: Number(d.vendorZip),
      date: parseResDate(`${d.date}`),
      poReceivedItems: d.poReceivedItems.filter((item) => item)
    };
  });
};

// === GET routes === //

export const getPurchaseOrderById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/${id}`, auth);
    return parsePoDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getPurchaseOrderByPoNum = async (poNum: string | null): Promise<PO | null> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/poNum/${poNum}`, auth);
    return parsePoDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSomePurchaseOrders = async (page: number, limit: number, showIncomming: boolean): Promise<{ pageCount: number, rows: PO[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showIncomming })}`, auth);
    return { pageCount: res.data.pageCount, rows: parsePoDataRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchPurchaseOrders = async (searchData: SearchData): Promise<{ pageCount: number, rows: PO[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/search/${JSON.stringify(searchData)}`, auth);
    return { pageCount: res.data.pageCount, rows: parsePoDataRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addBlankPurchaseOrder = async (poNum: number) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/po', { poNum }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const addPurchaseOrderItem = async (newItem: POItem) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/po/item', newItem, auth);
    return res.data.id;
  } catch (err) {
    console.error(err);
  }
};

export const addPurchaseOrderReceivedItem = async (newItem: POReceivedItem) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/po/received-item', newItem, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editPurchaseOrder = async (po: PO) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/po', po, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editPurchaseOrderItem = async (po: POItem) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/po/item', po, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const togglePurchaseOrderReceived = async (id: number, isReceived: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch(`/api/po/received`, { id, isReceived }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const togglePurchaseOrderItemReceived = async (id: number, isReceived: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch(`/api/po/received/item/${id}`, { isReceived }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deletePurchaseOrder = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/po/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deletePurchaseOrderItem = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/po/item/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
