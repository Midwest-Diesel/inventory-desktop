import { CoreSearch } from "@/components/cores/dialogs/CoreSearchDialog";
import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { deleteHandwrittenItem } from "./handwrittensService";
import { handleError } from "../tools/utils";


const parseCoreDataRes = (data: any) => {
  return data.map((d: any) => {
    return { ...d, date: parseResDate(d.date) };
  });
};

// === GET routes === //

export const getAllCores = async (): Promise<Core[]> => {
  try {
    const res = await api.get('/api/cores');
    return parseCoreDataRes(res.data);
  } catch (error) {
    handleError(error, 'getAllCores');
    return [];
  }
};

export const searchCores = async (params: CoreSearch): Promise<Core[]> => {
  try {
    const res = await api.get(`/api/cores/search`, { params });
    return parseCoreDataRes(res.data);
  } catch (error) {
    handleError(error, 'searchCores');
    return [];
  }
};

export const getCoresByCustomer = async (customerId: number, handwrittenId: number): Promise<Core[]> => {
  try {
    const res = await api.get(`/api/cores/customer/${JSON.stringify({customerId, handwrittenId})}`);
    return parseCoreDataRes(res.data) ?? [];
  } catch (error) {
    handleError(error, 'getCoresByCustomer');
    return [];
  }
};

export const getCoresByHandwrittenItem = async (id: number): Promise<Core[]> => {
  try {
    if (!id) return [];
    const res = await api.get(`/api/cores/handwritten-item/${id}`);
    return parseCoreDataRes(res.data) ?? [];
  } catch (error) {
    handleError(error, 'getCoresByHandwrittenItem');
    return [];
  }
};

// === POST routes === //

export const addCore = async (core: Core) => {
  try {
    await api.post('/api/cores', core);
  } catch (error) {
    handleError(error, 'addCore');
  }
};

// === PATCH routes === //

export const removeQtyFromCore = async (core: Core, qtyRemoved: number) => {
  try {
    await api.patch('/api/cores/qty', { core, qty: core.qty - qtyRemoved });
  } catch (error) {
    handleError(error, 'removeQtyFromCore');
  }
};

export const editCoreCustomer = async (handwrittenId: number, customerId: number | null) => {
  try {
    await api.patch('/api/cores/customer', { handwrittenId, customerId });
  } catch (error) {
    handleError(error, 'editCoreCustomer');
  }
};

export const editCoreCharge = async (coreId: number, charge: number) => {
  try {
    await api.patch('/api/cores/charge', { coreId, charge });
  } catch (error) {
    handleError(error, 'editCoreCharge');
  }
};

// === DELETE routes === //

export const deleteCore = async (id: number, handwrittenItemId?: number) => {
  try {
    await api.delete(`/api/cores/${id}`);
    if (handwrittenItemId) await deleteHandwrittenItem(handwrittenItemId);
  } catch (error) {
    handleError(error, 'deleteCore');
  }
};

export const deleteCoreByItemId = async (id: number) => {
  try {
    await api.delete(`/api/cores/item/${id}`);
  } catch (error) {
    handleError(error, 'deleteCoreByItemId');
  }
};
