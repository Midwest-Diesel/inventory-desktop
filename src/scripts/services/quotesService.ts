import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface QuoteSearchData {
  id?: number
  date?: string
  salesmanId?: number
  source?: string
  customer?: string
  contact?: string
  phone?: string
  state?: string
  partNum?: string
  desc?: string
  stockNum?: string
  sale?: string
  limit: number
  page: number
}

interface NewQuote {
  date: Date
  source: string
  customerId: number
  contact: string
  phone: string
  state: string
  partNum: string
  desc: string
  stockNum: string
  price: number
  notes: string
  salesmanId: number
  rating: number
  email: string
  partId: number
}


const parseQuotesRes = (data: any) => {
  return data.map((quote: any) => {
    return { ...quote, id: Number(quote.id), date: parseResDate(quote.date), piggybackQuotes: quote.piggybackQuotes ? quote.piggybackQuotes : [] };
  });
};

// === GET routes === //

export const getSomeQuotes = async (page: number, limit: number, partNum: string, customerId: number, isEngineQuote = false): Promise<{ pageCount: number, rows: Quote[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/limit/${JSON.stringify({ page: (page - 1) * limit, limit, partNum, customerId, isEngineQuote })}`, auth);
    res.data = { pageCount: res.data.pageCount, rows: parseQuotesRes(res.data.rows)};
    return res.data;
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getQuotesByCustomer = async (id: number | null): Promise<any> => {
  try {
    if (!id) return { rows: [], pageCount: [] };
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/customer/${id}`, auth);
    return {
      rows: parseQuotesRes(res.data.rows) ?? [],
      pageCount: res.data.pageCount ?? []
    };
  } catch (err) {
    console.error(err);
  }
};

export const getSomeUnsoldQuotesByPartNum = async (page: number, limit: number, partNum: string, customerId: number, includeAlts: boolean): Promise<{ pageCount: number, rows: Quote[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/unsold-quotes/part-num/${JSON.stringify({ page: (page - 1) * limit, limit, partNum, customerId, includeAlts })}`, auth);
    return {
      pageCount: res.data.pageCount,
      rows: res.data.rows.map((row: any) => {
        return { ...row, date: parseResDate(row.date) };
      })
    };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchQuotes = async (quote: QuoteSearchData, customerId: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/search/${encodeURIComponent(JSON.stringify({ ...quote, customerId }))}`, auth);
    res.data = { pageCount: res.data.pageCount, rows: parseQuotesRes(res.data.rows)};
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getQuotesByEngineModel = async (model: string): Promise<EngineQuote[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/engine/${model}`, auth);
    res.data = parseQuotesRes(res.data);
    return res.data.reverse();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addQuote = async (quote: NewQuote) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/quotes', { quote }, auth);
    return res.data.id;
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editQuote = async (quote: Quote) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/quotes', quote, auth);
  } catch (err) {
    console.error(err);
  }
};

export const toggleQuoteSold = async (quote: Quote) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/quotes/toggle', quote, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const piggybackQuote = async (parentId: number, piggybackId: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/quotes', { parentId, piggybackId }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const toggleAddToEmail = async (id: number, value: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/quotes/add-to-email', { id, value }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteQuote = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/quotes/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
