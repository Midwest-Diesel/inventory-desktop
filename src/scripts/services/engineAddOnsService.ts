import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";


const parseAddOnDataRes = (data: any) => {
  return data.map((d: EngineAddOn) => {
    return { ...d, entryDate: parseResDate(`${d.entryDate}`), currentStatus: d.currentStatus ?? 'ToreDown' };
  });
};

// === GET routes === //

export const getAllEngineAddOns = async (): Promise<EngineAddOn[]> => {
  try {
    const res = await api.get('/api/engine-add-ons');
    return parseAddOnDataRes(res.data);
  } catch (error) {
    handleError(error, 'getAllEngineAddOns');
    return [];
  }
};

export const getOfficeEngineAddOns = async (): Promise<EngineAddOn[]> => {
  try {
    const res = await api.get('/api/engine-add-ons/office');
    return parseAddOnDataRes(res.data);
  } catch (error) {
    handleError(error, 'getOfficeEngineAddOns');
    return [];
  }
};

// === POST routes === //

export const addEngineAddOn = async (addOn?: EngineAddOn) => {
  try {
    const res = await api.post('/api/engine-add-ons', addOn);
    return res.data;
  } catch (error) {
    handleError(error, 'addEngineAddOn');
  }
};

// === PUT routes === //

export const editEngineAddOn = async (addOn: EngineAddOn) => {
  try {
    await api.put('/api/engine-add-ons', addOn);
  } catch (error) {
    handleError(error, 'editEngineAddOn');
  }
};

export const editEngineAddOns = async (addOns: EngineAddOn[]) => {
  try {
    await api.put('/api/engine-add-ons/list', { addOns });
  } catch (error) {
    handleError(error, 'editEngineAddOn');
  }
};

export const engineAddOnClearUserEditing = async (userEditing: number) => {
  try {
    await api.put('/api/engine-add-ons/clear-user-editing', { userEditing });
  } catch (error) {
    handleError(error, 'engineAddOnClearUserEditing');
  }
};

// === PATCH routes === //

export const editEngineAddOnPrintStatus = async (id: number, isPrinted: boolean) => {
  try {
    await api.patch('/api/engine-add-ons/is-printed', { id, isPrinted });
  } catch (error) {
    handleError(error, 'editEngineAddOnPrintStatus');
  }
};

export const editEngineAddOnUserEditing = async (id: number, userEditing: number) => {
  try {
    await api.patch('/api/engine-add-ons/user-editing', { id, userEditing });
  } catch (error) {
    handleError(error, 'editEngineAddOnUserEditing');
  }
};

// === DELETE routes === //

export const deleteEngineAddOn = async (id: number) => {
  try {
    await api.delete(`/api/engine-add-ons/${id}`);
  } catch (error) {
    handleError(error, 'deleteEngineAddOn');
  }
};
