import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";

interface NewMapLocation {
  name: string
  customerId: number
  address: string
  lat: number
  lng: number
}

interface EditMapLocation {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  type: string
  notes: string
}


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
    handleError(error, 'getMapLocations');
  }
};

export const getMapLocationFromCustomer = async (id: number): Promise<MapLocation | null> => {
  try {
    const res = await api.get(`/api/map/${id}`);
    return res.data;
  } catch (error) {
    handleError(error, 'getMapLocationFromCustomer');
    return null;
  }
};

export const getMapTopCustomers = async (): Promise<number[]> => {
  try {
    const res = await api.get('/api/map/top-customers');
    return res.data.slice(0, 100);
  } catch (error) {
    handleError(error, 'getMapTopCustomers');
    return [];
  }
};

export const getMapNewLeads = async () => {
  try {
    const res = await api.get('/api/map/new-leads');
    return res.data;
  } catch (error) {
    handleError(error, 'getMapNewLeads');
  }
};

export const getBrokenLocations = async (): Promise<MapLocation[]> => {
  try {
    const res = await api.get('/api/map/broken');
    return parseMapData(res.data);
  } catch (error) {
    handleError(error, 'getBrokenLocations');
    return [];
  }
};

export const getGeoLocation = async (address: string | null): Promise<GeoLocation | null> => {
  try {
    if (!address) return null;
    const key = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_KEY;
    const params = { address, key };
    const res = await api.get('/api/map/geo-location', { params });
    return res.data.results[0];
  } catch (error) {
    handleError(error, 'getGeoLocation');
    return null;
  }
};

// === POST routes === //

export const addMapLocation = async (location: NewMapLocation) => {
  try {
    await api.post('/api/map', location);
  } catch (error) {
    handleError(error, 'addMapLocation');
  }
};

// === PATCH routes === //

export const fixMapLocation = async (location: { id: number, address: string, lat: number, lng: number }) => {
  try {
    await api.patch('/api/map/fix', location);
  } catch (error) {
    handleError(error, 'fixMapLocation');
  }
};

// === PUT routes === //

export const editMapLocation = async (location: EditMapLocation) => {
  try {
    await api.put('/api/map', location);
  } catch (error) {
    handleError(error, 'editMapLocation');
  }
};

// === DELETE routes === //

export const deleteMapLocation = async (id: number) => {
  try {
    await api.delete(`/api/map/${id}`);
  } catch (error) {
    handleError(error, 'deleteMapLocation');
  }
};

export const deleteMapLocationByCustomer = async (id: number) => {
  try {
    await api.delete(`/api/map/customer/${id}`);
  } catch (error) {
    handleError(error, 'deleteMapLocationByCustomer');
  }
};
