import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseReportData = (data: any) => {
  return data.map((d: any) => {
    return { ...d, date: parseResDate(`${d.date}`), entryDate: parseResDate(`${d.entryDate}`), loginDate: parseResDate(`${d.loginDate}`), toreDownDate: parseResDate(`${d.toreDownDate}`) };
  });
};

// === GET routes === //

export const getPerformance = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/performance`, auth);
    return { sales: res.data } as any;
  } catch (err) {
    console.log(err);
  }
};

export const reportSingleCompany = async (customer: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportAllCompanies = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-companies/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportAllParts = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-parts/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportPartDesc = async (keyword: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/part-desc/${JSON.stringify({keyword, startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportAllEngines = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-engines/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportAllSources = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-sources/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportAllSalesmen = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-salesmen/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportTheMachines = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/the-machines`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportArielSales = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/ariel-sales/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportSingleCompanyParts = async (customer: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company-parts/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportSingleCompanyEngines = async (customer: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company-engines/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportHandwrittenCompany = async (customer: string, year: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/handwrittens-company/${JSON.stringify({customer, year})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportPBB = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/pbb`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportNoLocationParts = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/no-location-parts`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportRecentSearches = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/recent-searches/${JSON.stringify({partNum})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportEmails = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/emails/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportOutstandingCores = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/outstanding-cores`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportInventoryValueParts = async (): Promise<{ partNum: string, stockNum: string, desc: string, qty: number, purchasePrice: number, totalCost: number }[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/parts`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const reportInventoryValueCoreEngines = async (): Promise<{ stockNum: number, loginDate: Date, model: string, serialNum: string, costRemaining: number }[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/core-engines`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const reportInventoryValueToreDownEngines = async (): Promise<{ stockNum: number, loginDate: Date, model: string, serialNum: string, costRemaining: number, toreDownDate: Date }[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/tore-down-engines`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const reportInventoryValueRunningEngines = async (): Promise<{ stockNum: number, serialNum: string, loginDate: Date, costRemaining: number, currentStatus: string }[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/running-engines`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const reportInventoryValueShortBlocks = async (): Promise<{ stockNum: number, model: string, serialNum: string, loginDate: Date, currentStatus: string, costRemaining: number }[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/short-blocks`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const reportInventoryValueSurplus = async (): Promise<{ code: string, name: string, date: Date, price: number, costRemaining: number }[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/surplus`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

// === POST routes === //

export const addGonculatorData = async (partList: string[]) => {
  try {
    const auth = { withCredentials: true };
    await api.post(`/api/reports/the-machines`, { partList }, auth);
  } catch (err) {
    console.log(err);
  }
};

// === DELETE routes === //

export const deleteGonculatorData = async () => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/reports/the-machines`, auth);
  } catch (err) {
    console.log(err);
  }
};
