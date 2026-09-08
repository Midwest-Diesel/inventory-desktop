import { ReturnSearch } from "@/components/returns/dialogs/SearchReturnsDialog";
import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";


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
  } catch (error) {
    handleError(error, 'getReturnById');
    return null;
  }
};

export const getSomeReturns = async (page: number, limit: number, isShopPanel: boolean): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const res = await api.get(`/api/returns/limit/${JSON.stringify({ page: (page - 1) * limit, limit, isShopPanel })}`);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (error) {
    handleError(error, 'getSomeReturns');
    return { pageCount: 0, rows: [] };
  }
};

export const getSomeCompletedReturns = async (page: number, limit: number): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const res = await api.get(`/api/returns/limit/completed/${JSON.stringify({ page: (page - 1) * limit, limit })}`);
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (error) {
    handleError(error, 'getSomeCompletedReturns');
    return { pageCount: 0, rows: [] };
  }
};

export const searchReturns = async (search: ReturnSearch, page: number, limit: number): Promise<{ pageCount: number, rows: Return[] }> => {
  try {
    const params = { ...search, offset: (page - 1) * limit, limit };
    const res = await api.get(`/api/returns/search`, { params });
    return { pageCount: res.data.pageCount, rows: parseReturnRes(res.data.rows) };
  } catch (error) {
    handleError(error, 'searchReturns');
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addReturn = async (returnData: Return) => {
  try {
    const res: any = await api.post('/api/returns', returnData);
    return Number(res.data.id);
  } catch (error) {
    handleError(error, 'addReturn');
  }
};

export const addReturnItem = async (returnItem: ReturnItem) => {
  try {
    await api.post('/api/returns/items', returnItem);
  } catch (error) {
    handleError(error, 'addReturnItem');
  }
};

export const addReturnItemChild = async (returnItemId: number): Promise<number | null> => {
  try {
    const res = await api.post('/api/returns/item-child', { returnItemId });
    return res.data.id;
  } catch (error) {
    handleError(error, 'addReturnItemChild');
    return null;
  }
};

// === PUT routes === //

export const editReturn = async (returnData: Return) => {
  try {
    await api.put('/api/returns', returnData);
  } catch (error) {
    handleError(error, 'editReturn');
  }
};

export const editReturnItem = async (item: ReturnItem) => {
  try {
    await api.put('/api/returns/item', item);
  } catch (error) {
    handleError(error, 'editReturnItem');
  }
};

export const editReturnItemChild = async (child: ReturnItemChild) => {
  try {
    await api.put('/api/returns/item-child', child);
  } catch (error) {
    handleError(error, 'editReturnItemChild');
  }
};

// === PATCH routes === //

export const issueReturnCredit = async (id: number) => {
  try {
    await api.patch('/api/returns/credit-issued', { id });
  } catch (error) {
    handleError(error, 'issueReturnCredit');
  }
};

// === DELETE routes === //

export const deleteReturn = async (id: number) => {
  try {
    await api.delete(`/api/returns/${id}`);
  } catch (error) {
    handleError(error, 'deleteReturn');
  }
};

export const deleteReturnItem = async (id: number) => {
  try {
    await api.delete(`/api/returns/item/${id}`);
  } catch (error) {
    handleError(error, 'deleteReturnItem');
  }
};

export const deleteReturnItemChild = async (id: number) => {
  try {
    await api.delete(`/api/returns/item-child/${id}`);
  } catch (error) {
    handleError(error, 'deleteReturnItemChild');
  }
};
