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
    return { ...d, id: Number(d.id), shipToZip: Number(d.shipToZip), vendorZip: Number(d.vendorZip), date: parseResDate(`${d.date}`) };
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

export const getPurchaseOrderByPoNum = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/poNum/${id}`, auth);
    return parsePoDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getSomePurchaseOrders = async (page: number, limit: number, showIncomming: boolean) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showIncomming })}`, auth);
    return parsePoDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchPurchaseOrders = async (searchData: SearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/search/${JSON.stringify(searchData)}`, auth);
    return { minItems: res.data.minItems, rows: parsePoDataRes(res.data.rows) };
  } catch (err) {
    console.error(err);
  }
};

export const getPurchaseOrdersCount = async (showIncomming: boolean) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/count/${JSON.stringify({ showIncomming })}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
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
    await api.patch(`/api/po/received/${id}`, { isReceived }, auth);
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
