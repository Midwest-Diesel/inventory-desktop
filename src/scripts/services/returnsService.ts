import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseReturnRes = (data: any) => {  
  return data.map((returnData: any) => {
    return {
      ...returnData,
      dateCalled: parseResDate(returnData.dateCalled),
      dateReceived: parseResDate(returnData.dateReceived),
      invoiceDate: parseResDate(returnData.invoiceDate),
      creditIssued: parseResDate(returnData.creditIssued)
    };
  });
};

// === GET routes === //

export const getReturnById = async (id: number): Promise<Return | null> => {
  try {
    const res = await api.get(`/api/returns/id/${id}`);
    return parseReturnRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSomeReturns = async (page: number, limit: number, isShopPanel: boolean): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const res = await api.get(`/api/returns/limit/${JSON.stringify({ page: (page - 1) * limit, limit, isShopPanel })}`);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getSomeCompletedReturns = async (page: number, limit: number): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const res = await api.get(`/api/returns/limit/completed/${JSON.stringify({ page: (page - 1) * limit, limit })}`);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addReturn = async (returnData: Return) => {
  try {
    const res: any = await api.post('/api/returns', returnData);
    return Number(res.data.id);
  } catch (err) {
    console.error(err);
  }
};

export const addReturnItem = async (returnItem: ReturnItem) => {
  try {
    await api.post('/api/returns/items', returnItem);
  } catch (err) {
    console.error(err);
  }
};

export const addReturnItemChild = async (returnItemId: number): Promise<number | null> => {
  try {
    const res = await api.post('/api/returns/item-child', { returnItemId });
    return res.data.id;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// === PUT routes === //

export const editReturn = async (returnData: Return) => {
  try {
    await api.put('/api/returns', returnData);
  } catch (err) {
    console.error(err);
  }
};

export const editReturnItem = async (item: ReturnItem) => {
  try {
    await api.put('/api/returns/item', item);
  } catch (err) {
    console.error(err);
  }
};

export const editReturnItemChild = async (child: ReturnItemChild) => {
  try {
    await api.put('/api/returns/item-child', child);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const issueReturnCredit = async (id: number) => {
  try {
    await api.patch('/api/returns/credit-issued', { id });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteReturn = async (id: number) => {
  try {
    await api.delete(`/api/returns/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deleteReturnItemChild = async (id: number) => {
  try {
    await api.delete(`/api/returns/item-child/${id}`);
  } catch (err) {
    console.error(err);
  }
};
