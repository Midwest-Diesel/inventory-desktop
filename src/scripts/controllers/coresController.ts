import api from "../config/axios";

import { parseResDate } from "../tools/stringUtils";


const parseCoreDataRes = (data: any) => {
  return data.map((d: any) => {
    return { ...d, date: parseResDate(d.date) };
  });
};

// === GET routes === //

export const getAllCores = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/cores', auth);
    return parseCoreDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getCoresByCustomer = async (customerId: number, handwrittenId: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/cores/customer/${JSON.stringify({customerId, handwrittenId})}`, auth);
    return parseCoreDataRes(res.data) || [];
  } catch (err) {
    console.error(err);
  }
};

export const getCoreReturnsByCustomer = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/cores/return/customer/${id}`, auth);
    return parseCoreDataRes(res.data) || [];
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addCore = async (core: Core) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/cores', core, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const removeQtyFromCore = async (core: Core, qtyRemoved: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/cores/qty', { core, qty: core.qty - qtyRemoved }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editCoreCustomer = async (handwrittenId: number, customerId: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/cores/customer', { handwrittenId, customerId }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteCore = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/cores/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
