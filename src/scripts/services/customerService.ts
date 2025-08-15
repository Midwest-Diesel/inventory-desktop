import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseCustomerRes = (data: any[]) => {
  return data.map((customer: any) => {
    return {
      ...customer,
      dateContacted: customer.dateContacted && parseResDate(customer.dateContacted),
    };
  });
};

// === GET routes === //

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/customers', auth);
    return parseCustomerRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSomeCustomers = async (page: number, limit: number): Promise<{ pageCount: number, rows: Customer[] }> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/limit/${JSON.stringify({ page: (page - 1) * limit, limit: limit })}`, auth);
    return { pageCount: res.data.pageCount, rows: parseCustomerRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchCustomers = async (data: { name: string, phone: string, state: string, zip: string, country: string, customerType: string }): Promise<Customer[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/search/${JSON.stringify(data)}`, auth);
    return parseCustomerRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCustomerNames = async (): Promise<string[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/customers/names', auth);
    return res.data.map((c: Customer) => c.company);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCustomersMin = async (): Promise<CustomerMin[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/customers/min', auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};


export const getCustomerById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/${id}`, auth);
    res.data = parseCustomerRes(res.data);
    return res.data[0];
  } catch (err) {
    console.error(err);
  }
};

export const getCustomerByName = async (name: string): Promise<Customer | null> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/name/${name}`, auth);
    res.data = parseCustomerRes(res.data);
    return res.data[0] ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getCustomerSalesHistory = async (id: number): Promise<SalesHistory[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/sales/${id}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCustomerTypes = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/types/all`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};


// === POST routes === //

export const addCustomer = async (customer: string) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/customers', { name: customer }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const addCustomerContact = async (customerId: number, name: string) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/customers/contact', { customerId, name }, auth);
  } catch (err) {
    console.error(err);
  }
};


// === PUT routes === //

export const editCustomer = async (customer: Customer) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/customers', customer, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editContact = async (contact: Contact) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/customers/contact', contact, auth);
  } catch (err) {
    console.error(err);
  }
};

export const customerMerge = async (badId: number, goodId: number) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/customers/merge', { badId, goodId }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteCustomer = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/customers/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteContact = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/customers/contact/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
