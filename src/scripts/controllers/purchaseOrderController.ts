import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


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
    console.log(err);
  }
};

export const getSomePurchaseOrders = async (page: number, limit: number, showIncomming: boolean) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showIncomming })}`, auth);
    return parsePoDataRes(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const getPurchaseOrdersCount = async (showIncomming: boolean) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/po/count/${JSON.stringify({ showIncomming })}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// === POST routes === //

export const addBlankPurchaseOrder = async () => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/po', {}, auth);
  } catch (err) {
    console.log(err);
  }
};

export const addPurchaseOrderItem = async (newItem: POItem) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/po/item', newItem, auth);
  } catch (err) {
    console.log(err);
  }
};

// === PUT routes === //

export const editPurchaseOrder = async (po: PO) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/po', po, auth);
  } catch (err) {
    console.log(err);
  }
};

export const editPurchaseOrderItem = async (po: POItem) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/po/item', po, auth);
  } catch (err) {
    console.log(err);
  }
};

// === PATCH routes === //

export const togglePurchaseOrderReceived = async (id: number, isReceived: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch(`/api/po/received/${id}`, { isReceived }, auth);
  } catch (err) {
    console.log(err);
  }
};


// === DELETE routes === //

export const deletePurchaseOrder = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/po/${id}`, auth);
  } catch (err) {
    console.log(err);
  }
};

export const deletePurchaseOrderItem = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/po/item/${id}`, auth);
  } catch (err) {
    console.log(err);
  }
};
