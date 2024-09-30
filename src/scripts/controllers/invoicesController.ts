import api from "../config/axios";

import { parseResDate } from "../tools/stringUtils";

interface InvoiceSearchData {
  id?: number
  date?: Date
  poNum?: string
}


const parseInvoiceRes = (data: any) => {
  return data.map((invoice: any) => {
    return {
      ...invoice,
      date: parseResDate(invoice.date),
      invoiceItems: invoice.invoiceItems.map((item: any) => {
        return {
          ...item,
          entryDate: parseResDate(item.entryDate)
        };
      })};
  });
};

// === GET routes === //

export const getAllInvoices = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/invoices', auth);
    return parseInvoiceRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getInvoiceById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/invoices/id/${id}`, auth);
    return parseInvoiceRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getSomeInvoices = async (page: number, limit: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/invoices/limit/${JSON.stringify({ page: (page - 1) * limit, limit: limit })}`, auth);
    return await parseInvoiceRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchInvoices = async (invoice: InvoiceSearchData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/invoices/search/${JSON.stringify(invoice)}`, auth);
    return await parseInvoiceRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getInvoicesByDate = async (date: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/invoices/date/${JSON.stringify(date)}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getInvoiceCount = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/invoices/count', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addInvoice = async (invoice: Invoice) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/invoices', invoice, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editInvoice = async (invoice: Invoice) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/invoices', invoice, auth);
  } catch (err) {
    console.error(err);
  }
};
