import { CoreSearch } from "@/components/Dialogs/CoreSearchDialog";
import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { deleteHandwrittenItem } from "./handwrittensService";


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
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const searchCores = async (search: CoreSearch): Promise<Core[]> => {
  try {
    const res = await api.get(`/api/cores/search?s=${encodeURI(JSON.stringify(search))}`);
    return parseCoreDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCoresByCustomer = async (customerId: number, handwrittenId: number): Promise<Core[]> => {
  try {
    const res = await api.get(`/api/cores/customer/${JSON.stringify({customerId, handwrittenId})}`);
    return parseCoreDataRes(res.data) ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCoreReturnsByCustomer = async (id: number): Promise<Core[]> => {
  try {
    if (!id) return [];
    const res = await api.get(`/api/cores/return/customer/${id}`);
    return parseCoreDataRes(res.data) ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCoresByHandwrittenItem = async (id: number): Promise<Core[]> => {
  try {
    if (!id) return [];
    const res = await api.get(`/api/cores/handwritten-item/${id}`);
    return parseCoreDataRes(res.data) ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addCore = async (core: Core) => {
  try {
    await api.post('/api/cores', core);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const removeQtyFromCore = async (core: Core, qtyRemoved: number) => {
  try {
    await api.patch('/api/cores/qty', { core, qty: core.qty - qtyRemoved });
  } catch (err) {
    console.error(err);
  }
};

export const editCoreCustomer = async (handwrittenId: number, customerId: number | null) => {
  try {
    await api.patch('/api/cores/customer', { handwrittenId, customerId });
  } catch (err) {
    console.error(err);
  }
};

export const editCoreCharge = async (coreId: number, charge: number) => {
  try {
    await api.patch('/api/cores/charge', { coreId, charge });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteCore = async (id: number, handwrittenItemId?: number) => {
  try {
    await api.delete(`/api/cores/${id}`);
    if (handwrittenItemId) await deleteHandwrittenItem(handwrittenItemId);
  } catch (err) {
    console.error(err);
  }
};

export const deleteCoreByItemId = async (id: number) => {
  try {
    await api.delete(`/api/cores/item/${id}`);
  } catch (err) {
    console.error(err);
  }
};
