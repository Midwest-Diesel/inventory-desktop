import api from "../config/axios";

export interface VendorSearch {
  name: string
  limit: number
  offset: number
}


// === GET routes === //

export const getVendors = async (): Promise<Vendor[]> => {
  try {
    const res = await api.get('/api/vendors');
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getVendorById = async (id: number): Promise<Vendor | null> => {
  try {
    const res = await api.get(`/api/vendors/id/${id}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const searchVendors = async (search: VendorSearch): Promise<VendorRes> => {
  try {
    const params = new URLSearchParams({ search: JSON.stringify(search) });
    const res = await api.get(`/api/vendors/search?${params.toString()}`);
    return { pageCount: res.data.pageCount, rows: res.data.rows };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getVendorByName = async (name: string): Promise<Vendor | null> => {
  try {
    const res = await api.get(`/api/vendors/name/${name.replace(/\s*\(.*?\)/, '')}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// === POST routes === //

export const addVendor = async (name: string) => {
  try {
    await api.post('/api/vendors', { name });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteVendor = async (id: number) => {
  try {
    await api.delete(`/api/vendors/${id}`);
  } catch (err) {
    console.error(err);
  }
};
