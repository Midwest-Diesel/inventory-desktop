import api from "../config/axios";



const parseVendorDataRes = (data: any) => {
  return data.map((d: Vendor) => {
    return { ...d, id: Number(d.id) };
  });
};

// === GET routes === //

export const getVendorNames = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/vendors/names', auth);
    return parseVendorDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getVendors = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/vendors', auth);
    return parseVendorDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};
