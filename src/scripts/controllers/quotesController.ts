import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface QuoteSearchData {
  partNum?: string;
  desc?: string;
  stockNum?: string;
}


const parseQuotesRes = (data: any) => {
  return data.map((quote: any) => {
    return { ...quote, id: Number(quote.id), date: parseResDate(quote.date), piggybackQuotes: quote.piggybackQuotes ? quote.piggybackQuotes : [] };
  });
};

// === GET routes === //

export const getSomeQuotes = async (page: number, limit: number, partNum: string, customerId: number, isEngineQuote = false) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/limit/${JSON.stringify({ page: (page - 1) * limit, limit, partNum, customerId, isEngineQuote })}`, auth);
    return parseQuotesRes(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const getSomeQuotesByPartNum = async (page: number, limit: number, partNum: string, engineQuote = false) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/limit/part-num/${JSON.stringify({ page: (page - 1) * limit, limit, partNum, engineQuote })}`, auth);
    return parseQuotesRes(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const getQuotesCount = async (partNum: string, customerId: number, isEngineQuote = false) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/count/${JSON.stringify({ isEngineQuote, partNum, customerId })}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const getQuotesCountByPartNum = async (isEngineQuote = false, partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/count/part-num/${JSON.stringify({ isEngineQuote, partNum })}`, auth);
    return parseQuotesRes(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const searchQuotes = async (quote: QuoteSearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/search/${JSON.stringify(quote)}`, auth);
    res.data = parseQuotesRes(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const getQuotesByEngine = async (model: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/quotes/engine/${model}`, auth);
    res.data = parseQuotesRes(res.data);
    return res.data.reverse();
  } catch (err) {
    console.log(err);
  }
};

// === POST routes === //

export const addQuote = async (quote: Quote, salesmanId: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.post('/api/quotes', { ...quote, salesmanId }, auth);
    return res.data.id;
  } catch (err) {
    console.log(err);
  }
};

// === PUT routes === //

export const editQuote = async (quote: Quote) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/quotes', quote, auth);
  } catch (err) {
    console.log(err);
  }
};

export const toggleQuoteSold = async (quote: Quote) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/quotes/toggle', quote, auth);
  } catch (err) {
    console.log(err);
  }
};

// === PATCH routes === //

export const piggybackQuote = async (parentId: number, piggybackId: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/quotes', { parentId, piggybackId }, auth);
  } catch (err) {
    console.log(err);
  }
};

// === DELETE routes === //

export const deleteQuote = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/quotes/${id}`, auth);
  } catch (err) {
    console.log(err);
  }
};
