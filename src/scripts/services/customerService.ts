import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface CustomerSearch {
  name: string
  phone: string
  state: string
  zip: string
  country: string
  customerType: string
  page: number
  limit: number
}


const parseCustomerRes = (data: any[]) => {
  return data.map((customer: any) => {
    return {
      ...customer,
      dateContacted: customer.dateContacted && parseResDate(customer.dateContacted)
    };
  });
};

// === GET routes === //

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const res = await api.get('/api/customers');
    return parseCustomerRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSomeCustomers = async (page: number, limit: number): Promise<{ pageCount: number, rows: Customer[] }> => {
  try {
    const res = await api.get(`/api/customers/limit/${JSON.stringify({ page: (page - 1) * limit, limit })}`);
    return { pageCount: res.data.pageCount, rows: parseCustomerRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchCustomers = async (data: CustomerSearch): Promise<{ pageCount: number, rows: Customer[] }> => {
  try {
    const res = await api.get(`/api/customers/search/${JSON.stringify({ ...data, page: (data.page - 1) * data.limit, limit: data.limit })}`);
    return { pageCount: res.data.pageCount, rows: parseCustomerRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getCustomerNames = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/customers/names');
    return res.data.map((c: Customer) => c.company);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCustomersMin = async (): Promise<CustomerMin[]> => {
  try {
    const res = await api.get('/api/customers/min');
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};


export const getCustomerById = async (id: number) => {
  try {
    const res = await api.get(`/api/customers/${id}`);
    return parseCustomerRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getCustomerByName = async (name: string): Promise<Customer | null> => {
  try {
    const res = await api.get(`/api/customers/name/${name}`);
    return parseCustomerRes(res.data)[0] ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getCustomerSalesHistory = async (id: number): Promise<SalesHistory[]> => {
  try {
    const res = await api.get(`/api/customers/sales/${id}`);
    return res.data ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCustomerTypes = async () => {
  try {
    const res = await api.get(`/api/customers/types/all`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};


// === POST routes === //

export const addCustomer = async (customer: string) => {
  try {
    await api.post('/api/customers', { name: customer });
  } catch (err) {
    console.error(err);
  }
};

export const addCustomerContact = async (customerId: number, name: string) => {
  try {
    await api.post('/api/customers/contact', { customerId, name });
  } catch (err) {
    console.error(err);
  }
};


// === PUT routes === //

export const editCustomer = async (customer: Customer) => {
  try {
    await api.put('/api/customers', customer);
  } catch (err) {
    console.error(err);
  }
};

export const editContact = async (contact: Contact) => {
  try {
    await api.put('/api/customers/contact', contact);
  } catch (err) {
    console.error(err);
  }
};

export const customerMerge = async (badId: number, goodId: number) => {
  try {
    await api.put('/api/customers/merge', { badId, goodId });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteCustomer = async (id: number) => {
  try {
    await api.delete(`/api/customers/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deleteContact = async (id: number) => {
  try {
    await api.delete(`/api/customers/contact/${id}`);
  } catch (err) {
    console.error(err);
  }
};
