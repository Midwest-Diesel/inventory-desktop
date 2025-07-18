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
      warrantyItems: warrantyData.warrantyItems.map((item: any) => {
        return {
          ...item,
          returnedVendorDate: parseResDate(item.returnedVendorDate)
        };
      })
    };
  });
};

// === GET routes === //

export const getWarrantyById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/id/${id}`, auth);
    return parseWarrantyRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getSomeWarranties = async (page: number, limit: number): Promise<{ pageCount: number, rows: Warranty[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/limit/${JSON.stringify({ page: (page - 1) * limit, limit })}`, auth);
    return { pageCount: res.data.pageCount, rows: parseWarrantyRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchWarranties = async (search: SearchData): Promise<{ pageCount: number, rows: Warranty[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/warranties/search/${JSON.stringify(search)}`, auth);
    return { pageCount: res.data.pageCount, rows: parseWarrantyRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
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

// === PATCH routes === //

export const editWarrantyCompleted = async (id: number, completed: boolean, date: Date | null) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/warranties/completed', { id, completed, date }, auth);
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
