import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";


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
  } catch (error) {
    handleError(error, 'getAllAddOns');
    return [];
  }
};

export const getOfficeAddOns = async (): Promise<AddOn[]> => {
  try {
    const res = await api.get('/api/add-ons/office');
    return parseAddOnDataRes(res.data);
  } catch (error) {
    handleError(error, 'getOfficeAddOns');
    return [];
  }
};

export const getAddOnById = async (id: number): Promise<AddOn | null> => {
  try {
    const res = await api.get(`/api/add-ons/id/${id}`);
    return parseAddOnDataRes(res.data)[0];
  } catch (error) {
    handleError(error, 'getAddOnById');
    return null;
  }
};

// === POST routes === //

export const addAddOn = async (addOn?: AddOn): Promise<AddOn | null> => {
  try {
    const res = await api.post('/api/add-ons', addOn);
    return { ...res.data, id: Number(res.data.id) };
  } catch (error) {
    handleError(error, 'addAddOn');
    return null;
  }
};

// === PATCH routes === //

export const editAddOnAltParts = async (id: number, altParts: string) => {
  try {
    await api.patch('/api/add-ons/alt-parts', { id, altParts });
  } catch (error) {
    handleError(error, 'editAddOnAltParts');
  }
};

export const editAddOnPrintStatus = async (id: number, isPrinted: boolean) => {
  try {
    await api.patch('/api/add-ons/is-printed', { id, isPrinted });
  } catch (error) {
    handleError(error, 'editAddOnPrintStatus');
  }
};

export const editAddOnIsPoOpened = async (id: number, isPoOpened: boolean) => {
  try {
    await api.patch('/api/add-ons/po-opened', { id, isPoOpened });
  } catch (error) {
    handleError(error, 'editAddOnIsPoOpened');
  }
};

export const editAddOnUserEditing = async (id: number, userEditing: number) => {
  try {
    await api.patch('/api/add-ons/user-editing', { id, userEditing });
  } catch (error) {
    handleError(error, 'editAddOnUserEditing');
  }
};

// === PUT routes === //

export const editAddOns = async (addOns: AddOn[]) => {
  try {
    await api.put('/api/add-ons/list', { addOns });
  } catch (error) {
    handleError(error, 'editAddOns');
  }
};

export const addOnClearUserEditing = async (userEditing: number) => {
  try {
    await api.put('/api/add-ons/clear-user-editing', { userEditing });
  } catch (error) {
    handleError(error, 'addOnClearUserEditing');
  }
};

// === DELETE routes === //

export const deleteAddOn = async (id: number) => {
  try {
    await api.delete(`/api/add-ons/${id}`);
  } catch (error) {
    handleError(error, 'deleteAddOn');
  }
};
