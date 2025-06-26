import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseAddOnDataRes = (data: any) => {
  return data.map((d: AddOn) => {
    return { ...d, entryDate: parseResDate(`${d.entryDate}`), altParts: d.altParts || [] };
  });
};

// === GET routes === //

export const getAllAddOns = async (): Promise<AddOn[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/add-ons', auth);
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getOfficeAddOns = async (): Promise<AddOn[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/add-ons/office', auth);
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getAddOnById = async (id: number): Promise<AddOn | null> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/add-ons/id/${id}`, auth);
    return parseAddOnDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

// === POST routes === //

export const addAddOn = async (addOn?: AddOn) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/add-ons', addOn, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editAddOnAltParts = async (id: number, altParts: string) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/add-ons/alt-parts', { id, altParts }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editAddOnPrintStatus = async (id: number, isPrinted: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/add-ons/is-printed', { id, isPrinted }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editAddOnIsPoOpened = async (id: number, isPoOpened: boolean) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/add-ons/po-opened', { id, isPoOpened }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editAddOn = async (addOn: AddOn) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/add-ons', addOn, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteAddOn = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/add-ons/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
