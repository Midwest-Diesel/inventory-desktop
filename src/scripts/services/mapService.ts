import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseMapData = (res: any) => {
  return res.map((row: any) => {
    return { ...row, date: parseResDate(row.date), customer: row.customer ? {...row.customer, dateContacted: parseResDate(row.customer.dateContacted)} : null };
  });
};

// === GET routes === //

export const getMapLocations = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/map', auth);
    return parseMapData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getMapLocationFromCustomer = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/map/${id}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getMapTopCustomers = async (): Promise<number[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/map/top-customers', auth);
    return res.data.slice(0, 100);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getMapNewLeads = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/map/new-leads', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getBrokenLocations = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/map/broken', auth);
    return parseMapData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getGeoLocation = async (address: string) => {
  try {
    const res = await api.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=${import.meta.env.VITE_PUBLIC_MAPS_API}`);
    return res.data.results;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addMapLocation = async (loc: any) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/map', loc, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const fixMapLocation = async (loc: any) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/map/fix', loc, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editMapLocation = async (loc: any) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/map', loc, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteMapLocation = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/map/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteMapLocationByCustomer = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/map/customer/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
