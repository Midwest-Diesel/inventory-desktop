import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { addMapLocation, getGeoLocation } from "./mapService";

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


const parseCustomerRes = async (data: any[]) => {
  return await Promise.all(
    data.map(async (customer: any) => {
      const tags: Tag[] = await handleCustomerTags(customer);

      return {
        ...customer,
        dateContacted: customer.dateContacted && parseResDate(customer.dateContacted),
        tags
      };
    })
  );
};

const handleCustomerTags = async (customer: Customer) => {
  const tags: Tag[] = [];
  if (customer.customerType) {
    tags.push({ id: 100, type: 'customer-type', name: customer.customerType });
  }

  const rank = await getCustomerSalesRank(customer.id);
  if (rank) {
    tags.push({ id: 101, type: 'rank', name: `Value: ${rank.value} / Qty: ${rank.amount}` });
  }
  return [...customer.tags, ...tags];
};

// === GET routes === //

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const res = await api.get('/api/customers');
    return await res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSomeCustomers = async (page: number, limit: number): Promise<{ pageCount: number, rows: Customer[] }> => {
  try {
    const res = await api.get(`/api/customers/limit/${JSON.stringify({ page: (page - 1) * limit, limit })}`);
    return { pageCount: res.data.pageCount, rows: await parseCustomerRes(res.data.rows) };
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
    return { pageCount: res.data.pageCount, rows: await parseCustomerRes(res.data.rows) };
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
    return (await parseCustomerRes(res.data))[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getCustomerByName = async (name: string): Promise<Customer | null> => {
  try {
    const params = new URLSearchParams({ name });
    const res = await api.get(`/api/customers/name?${params}`);
    return (await parseCustomerRes(res.data))[0] ?? null;
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

export const getCustomerSalesRank = async (id: number): Promise<{ amount: number, value: number } | null> => {
  try {
    const res = await api.get(`/api/customers/sales-rank/${id}`);
    if (!res.data) return null;
    
    return { amount: Number(res.data.amount), value: Number(res.data.value) };
  } catch (error) {
    console.error(error);
    return null;
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

export const addCustomer = async (customer: string): Promise<number | null> => {
  try {
    const res = await api.post('/api/customers', { name: customer });
    const id = Number(res.data.id);
    if (id === 0) return null;

    const newCustomer = await getCustomerById(id);
    if (!newCustomer) return null;

    const address = [newCustomer.billToAddress, newCustomer.billToCity, newCustomer.billToState, newCustomer.billToZip].filter(Boolean).join(', ');
    const geoLocation = await getGeoLocation(address);
    if (!geoLocation) return null;
    const mapLocation = {
      name: newCustomer.company ?? '',
      customerId: newCustomer.id,
      address: geoLocation.formattedAddress,
      lat: geoLocation.geometry.location.lat,
      lng: geoLocation.geometry.location.lng
    };
    await addMapLocation(mapLocation);

    return id;
  } catch (error) {
    console.error(error);
    return null;
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

// === PATCH routes === //

export const editCustomerLastPrintedLabel = async (id: number, lastPrintedLabel: Date) => {
  try {
    await api.patch('/api/customers/last-printed-label', { id, lastPrintedLabel });
  } catch (error) {
    console.error(error);
    alert(`Error in [editCustomerLastPrintedLabel] ${error}`);
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
