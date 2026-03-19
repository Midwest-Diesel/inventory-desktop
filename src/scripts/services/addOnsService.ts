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
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getOfficeAddOns = async (): Promise<AddOn[]> => {
  try {
    const res = await api.get('/api/add-ons/office');
    return parseAddOnDataRes(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAddOnById = async (id: number): Promise<AddOn | null> => {
  try {
    const res = await api.get(`/api/add-ons/id/${id}`);
    return parseAddOnDataRes(res.data)[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

// === POST routes === //

export const addAddOn = async (addOn?: AddOn): Promise<AddOn | null> => {
  try {
    const res = await api.post('/api/add-ons', addOn);
    return { ...res.data, id: Number(res.data.id) };
  } catch (error) {
    console.error(error);
    alert(`Error in [addAddOn] ${error}`);
    return null;
  }
};

// === PATCH routes === //

export const editAddOnAltParts = async (id: number, altParts: string) => {
  try {
    await api.patch('/api/add-ons/alt-parts', { id, altParts });
  } catch (error) {
    console.error(error);
    alert(`Error in [editAddOnAltParts] ${error}`);
  }
};

export const editAddOnPrintStatus = async (id: number, isPrinted: boolean) => {
  try {
    await api.patch('/api/add-ons/is-printed', { id, isPrinted });
  } catch (error) {
    console.error(error);
    alert(`Error in [editAddOnPrintStatus] ${error}`);
  }
};

export const editAddOnIsPoOpened = async (id: number, isPoOpened: boolean) => {
  try {
    await api.patch('/api/add-ons/po-opened', { id, isPoOpened });
  } catch (error) {
    console.error(error);
    alert(`Error in [editAddOnIsPoOpened] ${error}`);
  }
};

export const editAddOnUserEditing = async (id: number, userEditing: number) => {
  try {
    await api.patch('/api/add-ons/user-editing', { id, userEditing });
  } catch (error) {
    console.error(error);
    alert(`Error in [editAddOnUserEditing] ${error}`);
  }
};

// === PUT routes === //

export const editAddOn = async (addOn: AddOn) => {
  try {
    await api.put('/api/add-ons', addOn);
  } catch (error) {
    alert('Failed to save addOn');
    console.error(error);
    alert(`Error in [editAddOn] ${error}`);
  }
};

export const editAddOns = async (addOns: AddOn[]) => {
  try {
    await api.put('/api/add-ons/list', { addOns });
  } catch (error) {
    alert('Failed to save addOns, try again.');
    console.error(error);
    alert(`Error in [editAddOns] ${error}`);
  }
};

export const addOnClearUserEditing = async (userEditing: number) => {
  try {
    await api.put('/api/add-ons/clear-user-editing', { userEditing });
  } catch (error) {
    console.error(error);
    alert(`Error in [addOnClearUserEditing] ${error}`);
  }
};

// === DELETE routes === //

export const deleteAddOn = async (id: number) => {
  try {
    await api.delete(`/api/add-ons/${id}`);
  } catch (error) {
    console.error(error);
    alert(`Error in [deleteAddOn] ${error}`);
  }
};
