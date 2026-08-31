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
  } catch (error) {
    console.error(error);
  }
};

export const getSurplusByCode = async (code: string | null): Promise<Surplus | null> => {
  try {
    if (!code) return null;
    const res = await api.get(`/api/surplus/code/${code}`);
    return parseSurplusDataRes(res.data)[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getSurplusSoldParts = async (code: string): Promise<any[]> => {
  try {
    if (!code) return [];
    const params = { code };
    const res = await api.get(`/api/surplus/sold`, { params });
    return res.data.map((d: any) => {
      return { ...d, soldToDate: parseResDate(d.soldToDate) };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSurplusRemainingParts = async (code: string): Promise<any[]> => {
  try {
    if (!code) return [];
    const params = { code };
    const res = await api.get(`/api/surplus/remaining`, { params });
    return res.data.map((d: any) => {
      return { ...d, soldToDate: parseResDate(d.soldToDate) };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSurplusCostRemaining = async (code: string): Promise<number | null> => {
  try {
    if (!code) return null;
    const params = { code };
    const res = await api.get(`/api/surplus/cost-remaining`, { params });
    return res.data.costRemaining;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// === POST routes === //

export const addSurplus = async (surplus: Surplus) => {
  try {
    await api.post('/api/surplus', surplus);
  } catch (error) {
    console.error(error);
  }
};

// === PUT routes === //

export const zeroAllSurplusItems = async (vendor: string) => {
  try {
    await api.put('/api/surplus/zero-all', { vendor });
  } catch (error) {
    console.error(error);
  }
};
