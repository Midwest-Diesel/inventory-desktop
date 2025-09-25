import api from "../config/axios";

interface NewVendor {
  name: string | null
  vendorAddress: string | null
  vendorState: string | null
  vendorZip: string | null
  vendorPhone: string | null
  vendorFax: string | null
  vendorTerms: string | null
  vendorContact: string | null
}


// === GET routes === //

export const getVendors = async () => {
  try {
    const res = await api.get('/api/vendors');
    return res.data;
  } catch (err) {
    console.error(err);
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

export const addVendor = async (vendor: NewVendor) => {
  try {
    await api.post('/api/vendors', vendor);
  } catch (err) {
    console.error(err);
  }
};
