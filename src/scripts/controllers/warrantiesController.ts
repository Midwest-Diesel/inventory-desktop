import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface SearchData {
  id: number
  partNum: string
  vendor: string
  status: string
  limit: number
  offset: number
}


const parseWarrantyRes = (data: any) => {  
  return data.map((warrantyData: any) => {
    return {
      ...warrantyData,
      dateCalled: parseResDate(warrantyData.dateCalled),
      date: parseResDate(warrantyData.date),
      invoiceDate: parseResDate(warrantyData.invoiceDate),
      completedDate: parseResDate(warrantyData.completedDate),
    };
  });
};

// === GET routes === //

export const getAllWarranties = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/warranties', auth);
    return parseWarrantyRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getWarrantyById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/id/${id}`, auth);
    return parseWarrantyRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getSomeWarranties = async (page: number, limit: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/limit/${JSON.stringify({ page: (page - 1) * limit, limit })}`, auth);
    return parseWarrantyRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchWarranties = async (search: SearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/search/${JSON.stringify(search)}`, auth);
    return { minItems: res.data.minItems, rows: parseWarrantyRes(res.data.rows)};
  } catch (err) {
    console.error(err);
  }
};

export const getWarrantyCount = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/count`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addWarranty = async (warrantyData: Warranty) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/warranties', warrantyData, auth);
  } catch (err) {
    console.error(err);
  }
};

export const addWarrantyItem = async (warrantyItems: WarrantyItem) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/warranties/item', warrantyItems, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editWarranty = async (warrantyData: Warranty) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/warranties', warrantyData, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editWarrantyItem = async (item: WarrantyItem) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/warranties/item', item, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteWarranty = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/warranties/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteWarrantyItem = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/warranties/item/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
