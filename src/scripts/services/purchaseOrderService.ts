import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";


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

export const getPurchaseOrderById = async (id: number): Promise<PO | null> => {
  try {
    const res = await api.get(`/api/po/${id}`);
    return parsePoDataRes(res.data)[0];
  } catch (error) {
    handleError(error, 'getPurchaseOrderById');
    return null;
  }
};

export const getPurchaseOrderByPoNum = async (poNum: string | null): Promise<PO | null> => {
  try {
    const res = await api.get(`/api/po/poNum/${poNum}`);
    return parsePoDataRes(res.data)[0];
  } catch (error) {
    handleError(error, 'getPurchaseOrderByPoNum');
    return null;
  }
};

export const getSomePurchaseOrders = async (page: number, limit: number, showIncoming: boolean): Promise<{ pageCount: number, rows: PO[] }> => {
  try {
    const res = await api.get(`/api/po/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showIncoming })}`);
    return { pageCount: res.data.pageCount, rows: parsePoDataRes(res.data.rows) };
  } catch (error) {
    handleError(error, 'getSomePurchaseOrders');
    return { pageCount: 0, rows: [] };
  }
};

export const searchPurchaseOrders = async (searchData: POSearch): Promise<{ pageCount: number, rows: PO[] }> => {
  try {
    const res = await api.get(`/api/po/search/${JSON.stringify(searchData)}`);
    return { pageCount: res.data.pageCount, rows: parsePoDataRes(res.data.rows) };
  } catch (error) {
    handleError(error, 'searchPurchaseOrders');
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addBlankPurchaseOrder = async () => {
  try {
    await api.post('/api/po');
  } catch (error) {
    handleError(error, 'addBlankPurchaseOrder');
  }
};

export const addPurchaseOrderItem = async (newItem: POItem) => {
  try {
    const res = await api.post('/api/po/item', newItem);
    return res.data.id;
  } catch (error) {
    handleError(error, 'addPurchaseOrderItem');
  }
};

export const addPurchaseOrderReceivedItem = async (newItem: POReceivedItem) => {
  try {
    await api.post('/api/po/received-item', newItem);
  } catch (error) {
    handleError(error, 'addPurchaseOrderReceivedItem');
  }
};

// === PUT routes === //

export const editPurchaseOrder = async (po: PO) => {
  try {
    await api.put('/api/po', po);
  } catch (error) {
    handleError(error, 'editPurchaseOrder');
  }
};

export const editPurchaseOrderItem = async (item: POItem) => {
  try {
    await api.put('/api/po/item', item);
  } catch (error) {
    handleError(error, 'editPurchaseOrderItem');
  }
};

export const editPurchaseOrderReceivedItem = async (item: POReceivedItem) => {
  try {
    await api.put('/api/po/received-item', item);
  } catch (error) {
    handleError(error, 'editPurchaseOrderReceivedItem');
  }
};

// === PATCH routes === //

export const togglePurchaseOrderReceived = async (id: number, isReceived: boolean) => {
  try {
    await api.patch(`/api/po/received`, { id, isReceived });
  } catch (error) {
    handleError(error, 'togglePurchaseOrderReceived');
  }
};

export const togglePurchaseOrderItemReceived = async (id: number, isReceived: boolean) => {
  try {
    await api.patch(`/api/po/received/item/${id}`, { isReceived });
  } catch (error) {
    handleError(error, 'togglePurchaseOrderItemReceived');
  }
};

// === DELETE routes === //

export const deletePurchaseOrder = async (id: number) => {
  try {
    await api.delete(`/api/po/${id}`);
  } catch (error) {
    handleError(error, 'deletePurchaseOrder');
  }
};

export const deletePurchaseOrderItem = async (id: number) => {
  try {
    await api.delete(`/api/po/item/${id}`);
  } catch (error) {
    handleError(error, 'deletePurchaseOrderItem');
  }
};

export const deletePurchaseOrderReceivedItem = async (id: number) => {
  try {
    await api.delete(`/api/po/received-item/${id}`);
  } catch (error) {
    handleError(error, 'deletePurchaseOrderReceivedItem');
  }
};
