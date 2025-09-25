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
    const res = await api.get('/api/add-ons');
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getOfficeAddOns = async (): Promise<AddOn[]> => {
  try {
    const res = await api.get('/api/add-ons/office');
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getAddOnById = async (id: number): Promise<AddOn | null> => {
  try {
    const res = await api.get(`/api/add-ons/id/${id}`);
    return parseAddOnDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

// === POST routes === //

export const addAddOn = async (addOn?: AddOn) => {
  try {
    await api.post('/api/add-ons', addOn);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editAddOnAltParts = async (id: number, altParts: string) => {
  try {
    await api.patch('/api/add-ons/alt-parts', { id, altParts });
  } catch (err) {
    console.error(err);
  }
};

export const editAddOnPrintStatus = async (id: number, isPrinted: boolean) => {
  try {
    await api.patch('/api/add-ons/is-printed', { id, isPrinted });
  } catch (err) {
    console.error(err);
  }
};

export const editAddOnIsPoOpened = async (id: number, isPoOpened: boolean) => {
  try {
    await api.patch('/api/add-ons/po-opened', { id, isPoOpened });
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editAddOn = async (addOn: AddOn) => {
  try {
    await api.put('/api/add-ons', addOn);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteAddOn = async (id: number) => {
  try {
    await api.delete(`/api/add-ons/${id}`);
  } catch (err) {
    console.error(err);
  }
};
