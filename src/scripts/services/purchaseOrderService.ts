import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface POSearch {
  poNum: number
  purchasedFrom: string
  purchasedFor: string
  isItemReceived: string
  orderedBy: string
  limit: number
  offset: number
  showIncomming: boolean
}


const parsePoDataRes = (data: any) => {
  return data.map((d: PO) => {
    return {
      ...d,
      id: Number(d.id),
      date: parseResDate(`${d.date}`),
      poReceivedItems: d.poReceivedItems.filter((item) => item)
    };
  });
};

// === GET routes === //

export const getPurchaseOrderById = async (id: number) => {
  try {
    const res = await api.get(`/api/po/${id}`);
    return parsePoDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getPurchaseOrderByPoNum = async (poNum: string | null): Promise<PO | null> => {
  try {
    const res = await api.get(`/api/po/poNum/${poNum}`);
    return parsePoDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSomePurchaseOrders = async (page: number, limit: number, showIncomming: boolean): Promise<{ pageCount: number, rows: PO[] }> => {
  try {
    const res = await api.get(`/api/po/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showIncomming })}`);
    return { pageCount: res.data.pageCount, rows: parsePoDataRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchPurchaseOrders = async (searchData: POSearch): Promise<{ pageCount: number, rows: PO[] }> => {
  try {
    const res = await api.get(`/api/po/search/${JSON.stringify(searchData)}`);
    return { pageCount: res.data.pageCount, rows: parsePoDataRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addBlankPurchaseOrder = async (poNum: number) => {
  try {
    await api.post('/api/po', { poNum });
  } catch (err) {
    console.error(err);
  }
};

export const addPurchaseOrderItem = async (newItem: POItem) => {
  try {
    const res = await api.post('/api/po/item', newItem);
    return res.data.id;
  } catch (err) {
    console.error(err);
  }
};

export const addPurchaseOrderReceivedItem = async (newItem: POReceivedItem) => {
  try {
    await api.post('/api/po/received-item', newItem);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editPurchaseOrder = async (po: PO) => {
  try {
    await api.put('/api/po', po);
  } catch (err) {
    console.error(err);
  }
};

export const editPurchaseOrderItem = async (item: POItem) => {
  try {
    await api.put('/api/po/item', item);
  } catch (err) {
    console.error(err);
  }
};

export const editPurchaseOrderReceivedItem = async (item: POReceivedItem) => {
  try {
    await api.put('/api/po/received-item', item);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const togglePurchaseOrderReceived = async (id: number, isReceived: boolean) => {
  try {
    await api.patch(`/api/po/received`, { id, isReceived });
  } catch (err) {
    console.error(err);
  }
};

export const togglePurchaseOrderItemReceived = async (id: number, isReceived: boolean) => {
  try {
    await api.patch(`/api/po/received/item/${id}`, { isReceived });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deletePurchaseOrder = async (id: number) => {
  try {
    await api.delete(`/api/po/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deletePurchaseOrderItem = async (id: number) => {
  try {
    await api.delete(`/api/po/item/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deletePurchaseOrderReceivedItem = async (id: number) => {
  try {
    await api.delete(`/api/po/received-item/${id}`);
  } catch (err) {
    console.error(err);
  }
};
