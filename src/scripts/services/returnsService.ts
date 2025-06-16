import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface ReturnSearchData {
  id: number
}


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

export const getAllReturns = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/returns', auth);
    return parseReturnRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getReturnById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/id/${id}`, auth);
    return parseReturnRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getSomeReturns = async (page: number, limit: number, isShopPanel: boolean): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/limit/${JSON.stringify({ page: (page - 1) * limit, limit, isShopPanel })}`, auth);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getSomeCompletedReturns = async (page: number, limit: number): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/limit/completed/${JSON.stringify({ page: (page - 1) * limit, limit })}`, auth);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchReturns = async (returnData: ReturnSearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/search/${JSON.stringify(returnData)}`, auth);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addReturn = async (returnData: Return) => {
  try {
    const auth = { withCredentials: true };
    const res: any = await api.post('/api/returns', returnData, auth);
    return Number(res.data.id);
  } catch (err) {
    console.error(err);
  }
};

export const addReturnItem = async (returnItem: ReturnItem) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/returns/items', returnItem, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editReturn = async (returnData: Return) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/returns', returnData, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editReturnItem = async (item: ReturnItem) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/returns/item', item, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const issueReturnCredit = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/returns/credit-issued', { id }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteReturn = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/returns/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
