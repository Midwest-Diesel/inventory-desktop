import api from "../config/axios"
import { parseResDate } from "../tools/stringUtils"

export interface VendorQuoteSearchData {
  date: Date | null
  vendor: string | null
  partNum: string | null
  condition: VendorQuoteCondition | null
  salesmanId: number | null
}


const parseQuotesRes = (data: any) => {
  return data.map((quote: any) => {
    return {
      ...quote,
      date: parseResDate(quote.date)
    };
  });
};

// === GET routes === //

export const getVendorQuoteById = async (id: number): Promise<VendorQuote | null> => {
  try {
    const res = await api.get(`/api/vendor-quotes/id/${id}`);
    return parseQuotesRes([res.data])[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const searchVendorQuotes = async (data: VendorQuoteSearchData, page: number, limit: number): Promise<{ pageCount: number, rows: VendorQuote[] }> => {
  try {
    const params = { ...data, page: (page - 1) * limit, limit };
    const res = await api.get(`/api/vendor-quotes/search`, { params });
    return { pageCount: res.data.pageCount, rows: parseQuotesRes(res.data.rows)};
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addVendorQuote = async (partNum: string): Promise<number | null> => {
  try {
    const res = await api.post(`/api/vendor-quotes`, { partNum });
    return res.data.id;
  } catch (error) {
    console.error(error);
    alert(`Error in [addVendorQuotes] ${error}`);
    return null;
  }
};


// === PUT routes === //

export const editVendorQuote = async (data: VendorQuote) => {
  try {
    await api.put(`/api/vendor-quotes`, data);
  } catch (error) {
    console.error(error);
    alert(`Error in [editVendorQuote] ${error}`);
  }
};

// === DELETE routes === //

export const deleteVendorQuote = async (id: number) => {
  try {
    await api.delete(`/api/vendor-quotes/${id}`);
  } catch (error) {
    console.error(error);
    alert(`Error in [deleteVendorQuote] ${error}`);
  }
};
