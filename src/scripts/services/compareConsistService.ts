import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";
import { getEngineCostRemaining } from "./enginesService";


const parseCompareDataRes = (data: any) => {
  return data.map((c: any) => {
    return { ...c, dateCreated: parseResDate(c.dateCreated) };
  });
};

// === GET routes === //

export const searchCompareData = async (customerId: number, arrNum: string): Promise<CompareConsist[]> => {
  try {
    const res = await api.get(`/api/compare-consist/search/${JSON.stringify({ customerId, arrNum })}`);
    return parseCompareDataRes(res.data);
  } catch (error) {
    handleError(error, 'searchCompareData');
    return [];
  }
};

export const getCompareDataById = async (id: number): Promise<CompareConsist | null> => {
  try {
    const res = await api.get(`/api/compare-consist/id/${id}`);
    return parseCompareDataRes(res.data)[0];
  } catch (error) {
    handleError(error, 'getCompareDataById');
    return null;
  }
};

export const getPartsOnEngines = async (partNum: string): Promise<{ partNum: string, engines: Engine[] }> => {
  try {
    const res = await api.get(`/api/compare-consist/on-engines/${partNum}`);
    const parsedDataPromises = res.data.map(async (eng: any) => {
      const costRemaining = await getEngineCostRemaining(eng.stockNum);
      return { ...eng, loginDate: parseResDate(eng.loginDate), costRemaining  };
    });
    const parsedData = await Promise.all(parsedDataPromises);
    return { partNum, engines: parsedData };
  } catch (error) {
    handleError(error, 'getPartsOnEngines');
    return { partNum, engines: [] };
  }
};

// === POST routes === //

export const addCompareData = async (data: CompareConsist) => {
  try {
    await api.post('/api/compare-consist', data);
  } catch (error) {
    handleError(error, 'addCompareData');
  }
};

// === DELETE routes === //

export const deleteCompareData = async (id: number) => {
  try {
    await api.delete(`/api/compare-consist/${id}`);
  } catch (error) {
    handleError(error, 'deleteCompareData');
  }
};
