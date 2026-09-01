import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

export interface QuoteSearchData {
  id?: number | null
  date?: Date | null
  salesmanId?: number | null
  source?: string
  customer?: string
  contact?: string
  phone?: string
  state?: string
  partNum?: string
  desc?: string
  stockNum?: string
  sale?: '' | 'TRUE' | 'FALSE'
  limit: number
  page: number
}

export interface EngineQuoteSearchData {
  model: string
  limit: number
  page: number
}

interface NewQuote {
  date: Date
  source: string | null
  customerId: number | null
  contact: string | null
  phone: string | null
  state: string | null
  partNum: string | null
  desc: string | null
  stockNum: string | null
  price: number | null
  notes: string | null
  salesmanId: number
  rating: number | null
  email: string | null
  partId: number | null
}


const parseQuotesRes = (data: any) => {
  return data.map((quote: any) => {
    return {
      ...quote,
      id: Number(quote.id),
      date: parseResDate(quote.date),
      piggybackQuotes: quote.piggybackQuotes ? quote.piggybackQuotes.map((q: any) => ({ ...q, date: parseResDate(q.date) })) : []
    };
  });
};

// === GET routes === //

export const getSomeQuotes = async (page: number, limit: number, partNum: string, customerId: number, isEngineQuote = false): Promise<{ pageCount: number, rows: Quote[] }> => {
  try {
    const res = await api.get(`/api/quotes/limit/${JSON.stringify({ page: (page - 1) * limit, limit, partNum, customerId, isEngineQuote })}`);
    return { pageCount: res.data.pageCount, rows: parseQuotesRes(res.data.rows)};
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const getQuotesByCustomer = async (id: number | null): Promise<any> => {
  try {
    if (!id) return { rows: [], pageCount: [] };
    const res = await api.get(`/api/quotes/customer/${id}`);
    return {
      rows: parseQuotesRes(res.data.rows) ?? [],
      pageCount: res.data.pageCount ?? []
    };
  } catch (error) {
    console.error(error);
  }
};

export const getYesterdaysQuotesBySalesman = async (id: number): Promise<Quote[]> => {
  try {
    const res = await api.get(`/api/quotes/salesman-yesterday/${id}`);
    return parseQuotesRes(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getLastWeeksQuotesBySalesman = async (id: number): Promise<Quote[]> => {
  try {
    const res = await api.get(`/api/quotes/salesman-last-week/${id}`);
    return parseQuotesRes(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getQuotesBySalesmanDateRange = async (id: number, startDate: Date, endDate: Date): Promise<Quote[]> => {
  try {
    const params = { startDate, endDate };
    const res = await api.get(`/api/quotes/salesman-date-range/${id}`, { params });
    return parseQuotesRes(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSomeUnsoldQuotesByPartNum = async (page: number, limit: number, partNum: string, customerId: number, includeAlts: boolean): Promise<{ pageCount: number, rows: Quote[] }> => {
  try {
    const res = await api.get(`/api/quotes/unsold-quotes/part-num/${JSON.stringify({ page: (page - 1) * limit, limit, partNum, customerId, includeAlts })}`);
    return {
      pageCount: res.data.pageCount,
      rows: res.data.rows.map((row: any) => {
        return { ...row, date: parseResDate(row.date) };
      })
    };
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const searchQuotes = async (quote: QuoteSearchData, customerId: number): Promise<{ pageCount: number, rows: Quote[] }> => {
  try {
    const res = await api.get(`/api/quotes/search/${encodeURIComponent(JSON.stringify({ ...quote, customerId }))}`);
    return { pageCount: res.data.pageCount, rows: parseQuotesRes(res.data.rows)};
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const searchEngineQuotes = async (data: EngineQuoteSearchData): Promise<{ pageCount: number, rows: EngineQuote[] }> => {
  try {
    const res = await api.get(`/api/quotes/search-engines/${encodeURIComponent(JSON.stringify(data))}`);
    return { pageCount: res.data.pageCount, rows: parseQuotesRes(res.data.rows)};
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

// === POST routes === //

export const addQuote = async (quote: NewQuote): Promise<number | null> => {
  try {
    const res = await api.post('/api/quotes', { quote });
    return res.data.id;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// === PUT routes === //

export const editQuote = async (quote: Quote) => {
  try {
    await api.put('/api/quotes', quote);
  } catch (error) {
    console.error(error);
  }
};

// === PATCH routes === //

export const toggleQuoteSold = async (id: number, sale: boolean) => {
  try {
    await api.patch('/api/quotes/toggle', { id, sale });
  } catch (error) {
    console.error(error);
  }
};

export const piggybackQuote = async (parentId: number, piggybackId: number) => {
  try {
    await api.patch('/api/quotes', { parentId, piggybackId });
  } catch (error) {
    console.error(error);
  }
};

export const toggleAddToEmail = async (id: number, value: boolean) => {
  try {
    await api.patch('/api/quotes/add-to-email', { id, value });
  } catch (error) {
    console.error(error);
  }
};

// === DELETE routes === //

export const deleteQuote = async (id: number) => {
  try {
    await api.delete(`/api/quotes/${id}`);
  } catch (error) {
    console.error(error);
  }
};
