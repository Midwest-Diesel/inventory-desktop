import api from "../config/axios";

import { parseResDate } from "../tools/stringUtils";


const parseCustomerRes = (data: any) => {
  return data.map((customer: any) => {
    return {
      ...customer,
      dateContacted: parseResDate(customer.dateContacted),
    };
  });
};

// === GET routes === //

export const getCustomers = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/customers', auth);
    res.data = parseCustomerRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getSomeCustomers = async (page: number, limit: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/limit/${JSON.stringify({ page: (page - 1) * limit, limit: limit })}`, auth);
    res.data = parseCustomerRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getCustomersCount = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/customers/count', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const searchCustomers = async (name: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/search/${name}`, auth);
    res.data = parseCustomerRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getCustomerNames = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/customers/names', auth);
    return res.data.map((c) => c.company);
  } catch (err) {
    console.error(err);
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

export const getCustomerByName = async (name: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/name/${name}`, auth);
    res.data = parseCustomerRes(res.data);
    return res.data[0];
  } catch (err) {
    console.error(err);
  }
};

export const getCustomerSalesHistory = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/customers/sales/${id}`, auth);
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
