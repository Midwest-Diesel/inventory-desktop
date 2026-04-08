import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface CustomerSearch {
  name: string
  phone: string
  city: string
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
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSomeCustomers = async (page: number, limit: number): Promise<{ pageCount: number, rows: Customer[] }> => {
  try {
    const res = await api.get(`/api/customers/limit/${JSON.stringify({ page: (page - 1) * limit, limit })}`);
    return { pageCount: res.data.pageCount, rows: parseCustomerRes(res.data.rows) };
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const searchCustomers = async (data: CustomerSearch): Promise<{ pageCount: number, rows: Customer[] }> => {
  try {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries({
          ...data,
          page: (data.page - 1) * data.limit,
          limit: data.limit
        }).map(([a, b]) => [a, String(b)])
      )
    );

    const res = await api.get(`/api/customers/search?${params.toString()}`);
    return { pageCount: res.data.pageCount, rows: parseCustomerRes(res.data.rows) };
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const getCustomerNames = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/customers/names');
    return res.data.map((c: Customer) => c.company);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCustomerEmails = async (customerId: number): Promise<string[]> => {
  try {
    const res = await api.get(`/api/customers/emails/${customerId}`);
    return res.data.map((row: any) => row.email);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCustomersMin = async (): Promise<CustomerMin[]> => {
  try {
    const res = await api.get('/api/customers/min');
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};


export const getCustomerById = async (id: number): Promise<Customer | null> => {
  try {
    const res = await api.get(`/api/customers/id/${id}`);
    return parseCustomerRes(res.data)[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getCustomerByName = async (name: string): Promise<Customer | null> => {
  try {
    const params = new URLSearchParams({ name });
    const res = await api.get(`/api/customers/name?${params}`);
    return parseCustomerRes(res.data)[0] ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getCustomerSalesHistory = async (id: number): Promise<SalesHistory[]> => {
  try {
    const res = await api.get(`/api/customers/sales/${id}`);
    return res.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCustomerTypes = async () => {
  try {
    const res = await api.get(`/api/customers/types/all`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};


// === POST routes === //

export const addCustomer = async (customer: string) => {
  try {
    await api.post('/api/customers', { name: customer });
  } catch (error) {
    console.error(error);
  }
};

export const addCustomerContact = async (customerId: number, name: string): Promise<number | null> => {
  try {
    const res = await api.post('/api/customers/contact', { customerId, name });
    return res.data.id;
  } catch (error) {
    console.error(error);
    return null;
  }
};


// === PUT routes === //

export const editCustomer = async (customer: Customer) => {
  try {
    await api.put('/api/customers', customer);
  } catch (error) {
    console.error(error);
  }
};

export const editContact = async (contact: Contact) => {
  try {
    await api.put('/api/customers/contact', contact);
  } catch (error) {
    console.error(error);
  }
};

export const customerMerge = async (badId: number, goodId: number) => {
  try {
    await api.put('/api/customers/merge', { badId, goodId });
  } catch (error) {
    console.error(error);
  }
};

// === DELETE routes === //

export const deleteCustomer = async (id: number) => {
  try {
    await api.delete(`/api/customers/${id}`);
  } catch (error) {
    console.error(error);
  }
};

export const deleteContact = async (id: number) => {
  try {
    await api.delete(`/api/customers/contact/${id}`);
  } catch (error) {
    console.error(error);
  }
};
