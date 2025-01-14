import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { isObjectNull } from "../tools/utils";

interface ReturnSearchData {
  id?: number
}


const parseReturnRes = (data: any) => {  
  return data.map((returnData: any) => {
    return {
      ...returnData,
      dateCalled: parseResDate(returnData.dateCalled),
      dateReceived: parseResDate(returnData.dateReceived),
      invoiceDate: parseResDate(returnData.invoiceDate),
      creditIssued: parseResDate(returnData.creditIssued),
      returnItems: isObjectNull(returnData.returnItems[0]) ? [] : returnData.returnItems
    };
  }).sort((a: any, b: any) => b.id - a.id);
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

export const getSomeReturns = async (page: number, limit: number, notReceived?: boolean) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/limit/${JSON.stringify({ page: (page - 1) * limit, limit, notReceived })}`, auth);
    return parseReturnRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getSomeCompletedReturns = async (page: number, limit: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/limit/completed/${JSON.stringify({ page: (page - 1) * limit, limit })}`, auth);
    return parseReturnRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchReturns = async (returnData: ReturnSearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/search/${JSON.stringify(returnData)}`, auth);
    return parseReturnRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getReturnCount = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/returns/count`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addReturn = async (returnData: Return) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/returns', returnData, auth);
  } catch (err) {
    console.error(err);
  }
};

export const addReturnItems = async (returnItems: ReturnItem) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/returns/items', returnItems, auth);
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
