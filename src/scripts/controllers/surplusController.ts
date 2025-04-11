import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseSurplusDataRes = (data: any) => {
  return data.map((d: any) => {
    return { ...d, date: parseResDate(d.date) };
  }).sort((a: any, b: any) => a.date === null && b.date === null ? 0 : a.date === null ? 1 : b.date === null ? -1 : a.date > b.date ? -1 : 1);
};

// === GET routes === //

export const getAllSurplus = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/surplus', auth);
    res.data = parseSurplusDataRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getSurplusByCode = async (code: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/surplus/code/${code}`, auth);
    res.data = parseSurplusDataRes(res.data);
    return res.data[0];
  } catch (err) {
    console.error(err);
  }
};

export const getSurplusSoldParts = async (code: string): Promise<any[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/surplus/sold/${code}`, auth);
    res.data = res.data.map((d: any) => {
      return { ...d, soldToDate: parseResDate(d.soldToDate) };
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSurplusRemainingParts = async (code: string): Promise<any[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/surplus/remaining/${code}`, auth);
    res.data = res.data.map((d: any) => {
      return { ...d, soldToDate: parseResDate(d.soldToDate) };
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSurplusCostRemaining = async (code: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/surplus/cost-remaining/${code}`, auth);
    return res.data.costRemaining;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addSurplus = async (surplus: Surplus) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/surplus', surplus, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editSurplusPrice = async (id: number, price: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/surplus/price', { id, price }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editSurplus = async (surplus: Surplus) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/surplus', surplus, auth);
  } catch (err) {
    console.error(err);
  }
};

export const zeroAllSurplusItems = async (vendor: string) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/surplus/zero-all', { vendor }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteSurplus = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/surplus/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
