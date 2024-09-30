import api from "../config/axios";

import { parseResDate } from "../tools/stringUtils";


const parseAddOnDataRes = (data: any) => {
  return data.map((d: AddOn) => {
    return { ...d, entryDate: parseResDate(`${d.entryDate}`) };
  });
};

// === GET routes === //

export const getAllAddOns = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/add-ons', auth);
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
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
