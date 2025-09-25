import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseAddOnDataRes = (data: any) => {
  return data.map((d: EngineAddOn) => {
    return { ...d, entryDate: parseResDate(`${d.entryDate}`), currentStatus: data.currentStatus ?? 'ToreDown' };
  });
};

// === GET routes === //

export const getAllEngineAddOns = async (): Promise<EngineAddOn[]> => {
  try {
    const res = await api.get('/api/engine-add-ons');
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getOfficeEngineAddOns = async (): Promise<EngineAddOn[]> => {
  try {
    const res = await api.get('/api/engine-add-ons/office');
    return parseAddOnDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addEngineAddOn = async (addOn?: EngineAddOn) => {
  try {
    await api.post('/api/engine-add-ons', addOn);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editEngineAddOn = async (addOn: EngineAddOn) => {
  try {
    await api.put('/api/engine-add-ons', addOn);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editEngineAddOnPrintStatus = async (id: number, isPrinted: boolean) => {
  try {
    await api.patch('/api/engine-add-ons/is-printed', { id, isPrinted });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteEngineAddOn = async (id: number) => {
  try {
    await api.delete(`/api/engine-add-ons/${id}`);
  } catch (err) {
    console.error(err);
  }
};
