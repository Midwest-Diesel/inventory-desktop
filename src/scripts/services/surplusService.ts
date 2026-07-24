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
    const res = await api.get('/api/surplus');
    return parseSurplusDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getSurplusByCode = async (code: string | null): Promise<Surplus | null> => {
  try {
    if (!code) return null;
    const res = await api.get(`/api/surplus/code/${code}`);
    return parseSurplusDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSurplusSoldParts = async (code: string): Promise<any[]> => {
  try {
    const res = await api.get(`/api/surplus/sold/${code}`);
    return res.data.map((d: any) => {
      return { ...d, soldToDate: parseResDate(d.soldToDate) };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSurplusRemainingParts = async (code: string): Promise<any[]> => {
  try {
    const res = await api.get(`/api/surplus/remaining/${code}`);
    return res.data.map((d: any) => {
      return { ...d, soldToDate: parseResDate(d.soldToDate) };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSurplusCostRemaining = async (code: string): Promise<number | null> => {
  try {
    const res = await api.get(`/api/surplus/cost-remaining/${code}`);
    return res.data.costRemaining;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// === POST routes === //

export const addSurplus = async (surplus: Surplus) => {
  try {
    await api.post('/api/surplus', surplus);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const zeroAllSurplusItems = async (vendor: string) => {
  try {
    await api.put('/api/surplus/zero-all', { vendor });
  } catch (err) {
    console.error(err);
  }
};
