import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { getEngineCostRemaining } from "./enginesController";


const parseCompareDataRes = (data: any) => {
  return data.map((c: any) => {
    return { ...c, dateCreated: parseResDate(c.dateCreated) };
  });
};

// === GET routes === //

export const getCompareData = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/compare-consist', auth);
    res.data = parseCompareDataRes(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const getCompareDataByCustomer = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/compare-consist/customer/${id}`, auth);
    res.data = parseCompareDataRes(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const getCompareDataById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/compare-consist/id/${id}`, auth);
    res.data = parseCompareDataRes(res.data);
    return res.data[0];
  } catch (err) {
    console.log(err);
  }
};

export const getPartsOnEngines = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/compare-consist/on-engines/${partNum}`, auth);
    const parsedDataPromises = res.data.map(async (eng: any) => {
      const costRemaining = await getEngineCostRemaining(eng.stockNum);
      return { ...eng, loginDate: parseResDate(eng.loginDate), costRemaining  };
    });
    const parsedData = await Promise.all(parsedDataPromises);
    return { partNum: partNum, engines: parsedData };
  } catch (err) {
    console.log(err);
  }
};

// === POST routes === //

export const addCompareData = async (data: CompareConsist) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/compare-consist', data, auth);
  } catch (err) {
    console.log(err);
  }
};