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
    const res = await api.get('/api/map');
    return parseMapData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const getMapLocationFromCustomer = async (id: number) => {
  try {
    const res = await api.get(`/api/map/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getMapTopCustomers = async (): Promise<number[]> => {
  try {
    const res = await api.get('/api/map/top-customers');
    return res.data.slice(0, 100);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getMapNewLeads = async () => {
  try {
    const res = await api.get('/api/map/new-leads');
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getBrokenLocations = async () => {
  try {
    const res = await api.get('/api/map/broken');
    return parseMapData(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getGeoLocation = async (address: string) => {
  try {
    const res = await api.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=${import.meta.env.VITE_PUBLIC_MAPS_API}`);
    return res.data.results;
  } catch (error) {
    console.error(error);
  }
};

// === POST routes === //

export const addMapLocation = async (loc: any) => {
  try {
    await api.post('/api/map', loc);
  } catch (error) {
    console.error(error);
  }
};

// === PATCH routes === //

export const fixMapLocation = async (loc: any) => {
  try {
    await api.patch('/api/map/fix', loc);
  } catch (error) {
    console.error(error);
  }
};

// === PUT routes === //

export const editMapLocation = async (loc: any) => {
  try {
    await api.put('/api/map', loc);
  } catch (error) {
    console.error(error);
  }
};

// === DELETE routes === //

export const deleteMapLocation = async (id: number) => {
  try {
    await api.delete(`/api/map/${id}`);
  } catch (error) {
    console.error(error);
  }
};

export const deleteMapLocationByCustomer = async (id: number) => {
  try {
    await api.delete(`/api/map/customer/${id}`);
  } catch (error) {
    console.error(error);
  }
};
