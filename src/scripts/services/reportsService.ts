import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseReportData = (data: any) => {
  return data.map((d: any) => {
    return { ...d, date: parseResDate(`${d.date}`), entryDate: parseResDate(`${d.entryDate}`), loginDate: parseResDate(`${d.loginDate}`), toreDownDate: parseResDate(`${d.toreDownDate}`) };
  });
};

// === GET routes === //

export const getPerformance = async (): Promise<Perf | null> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/performance`, auth);
    return { sales: res.data } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const reportSingleCompany = async (customer: number, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportAllCompanies = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-companies/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportAllParts = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-parts/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportPartDesc = async (keyword: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/part-desc/${JSON.stringify({keyword, startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportAllEngines = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-engines/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportAllSources = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-sources/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportAllSalesmen = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-salesmen/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportTheMachines = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/the-machines`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportArielSales = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/ariel-sales/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportSingleCompanyParts = async (customer: number, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company-parts/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportSingleCompanyEngines = async (customer: number, startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company-engines/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportHandwrittenCompany = async (customer: number, year: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/handwrittens-company/${JSON.stringify({customer, year})}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportPBB = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/pbb`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportNoLocationParts = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/no-location-parts`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const reportRecentSearches = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/recent-searches/${JSON.stringify({partNum})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportEmails = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/emails/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportOutstandingCores = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/outstanding-cores`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const reportInventoryValueParts = async (): Promise<InventoryValueReportParts> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/parts`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueCoreEngines = async (): Promise<InventoryValueReportCoreEngines> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/core-engines`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueToreDownEngines = async (): Promise<InventoryValueReportToreDownEngines> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/tore-down-engines`, auth);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (err) {
    console.error(err);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueRunningEngines = async (): Promise<InventoryValueReportRunningEngines> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/running-engines`, auth);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (err) {
    console.error(err);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueShortBlocks = async (): Promise<InventoryValueReportShortBlocks> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/short-blocks`, auth);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (err) {
    console.error(err);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueSurplus = async (): Promise<InventoryValueReportSurplus> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/inventory-value/surplus`, auth);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (err) {
    console.error(err);
    return { combinedTotal: 0, data: [] };
  }
};

// === POST routes === //

export const addGonculatorData = async (partList: string[]) => {
  try {
    const auth = { withCredentials: true };
    await api.post(`/api/reports/the-machines`, { partList }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteGonculatorData = async () => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/reports/the-machines`, auth);
  } catch (err) {
    console.error(err);
  }
};
