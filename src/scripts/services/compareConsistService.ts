import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { getEngineCostRemaining } from "./enginesService";


const parseCompareDataRes = (data: any) => {
  return data.map((c: any) => {
    return { ...c, dateCreated: parseResDate(c.dateCreated) };
  });
};

// === GET routes === //

export const getCompareDataByCustomer = async (id: number) => {
  try {
    const res = await api.get(`/api/compare-consist/customer/${id}`);
    return parseCompareDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchCompareData = async (customerId: number, arrNum: string) => {
  try {
    const res = await api.get(`/api/compare-consist/search/${JSON.stringify({ customerId, arrNum })}`);
    return parseCompareDataRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getCompareDataById = async (id: number) => {
  try {
    const res = await api.get(`/api/compare-consist/id/${id}`);
    return parseCompareDataRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getPartsOnEngines = async (partNum: string) => {
  try {
    const res = await api.get(`/api/compare-consist/on-engines/${partNum}`);
    const parsedDataPromises = res.data.map(async (eng: any) => {
      const costRemaining = await getEngineCostRemaining(eng.stockNum);
      return { ...eng, loginDate: parseResDate(eng.loginDate), costRemaining  };
    });
    const parsedData = await Promise.all(parsedDataPromises);
    return { partNum: partNum, engines: parsedData };
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addCompareData = async (data: CompareConsist) => {
  try {
    await api.post('/api/compare-consist', data);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteCompareData = async (id: number) => {
  try {
    await api.delete(`/api/compare-consist/${id}`);
  } catch (err) {
    console.error(err);
  }
};
