import api from "../config/axios";

import { parseResDate } from "../tools/stringUtils";


const parseAddOnDataRes = (data: any) => {
  return data.map((d: EngineAddOn) => {
    return { ...d, entryDate: parseResDate(`${d.entryDate}`) };
  });
};

// === GET routes === //

export const getAllEngineAddOns = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/engine-add-ons', auth);
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addEngineAddOn = async (addOn?: EngineAddOn) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/engine-add-ons', addOn, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editEngineAddOn = async (addOn: EngineAddOn) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/engine-add-ons', addOn, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteEngineAddOn = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/engine-add-ons/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
