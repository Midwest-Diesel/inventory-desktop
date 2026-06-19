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
    const res = await api.get(`/api/reports/performance`);
    return { sales: res.data } as any;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const reportSingleCompany = async (customer: number, startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/single-company/${JSON.stringify({customer, startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportSalesByBillToCompany = async (billToCompany: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/sales-by-bill-to-company/${JSON.stringify({billToCompany, startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportAllCompanies = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/all-companies/${JSON.stringify({startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportAllParts = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/all-parts/${JSON.stringify({startDate, endDate})}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportPartDesc = async (keyword: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/part-desc/${JSON.stringify({keyword, startDate, endDate})}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportAllEngines = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/all-engines/${JSON.stringify({startDate, endDate})}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportAllSources = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/all-sources/${JSON.stringify({startDate, endDate})}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportAllSalesmen = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/all-salesmen/${JSON.stringify({startDate, endDate})}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportTheMachines = async () => {
  try {
    const res = await api.get(`/api/reports/the-machines`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportArielSales = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/ariel-sales/${JSON.stringify({startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportSingleCompanyParts = async (purchasedFrom: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/single-company-parts/${JSON.stringify({purchasedFrom, startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportSingleCompanyEngines = async (purchasedFrom: string, startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/single-company-engines/${JSON.stringify({purchasedFrom, startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportHandwrittenCompany = async (customer: number, year: number) => {
  try {
    const res = await api.get(`/api/reports/handwrittens-company/${JSON.stringify({customer, year})}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportPBB = async () => {
  try {
    const res = await api.get(`/api/reports/pbb`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportNoLocationParts = async () => {
  try {
    const res = await api.get(`/api/reports/no-location-parts`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const reportRecentSearches = async (partNum: string) => {
  try {
    const res = await api.get(`/api/reports/recent-searches/${JSON.stringify({partNum})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportEmails = async (startDate: Date | null, endDate: Date | null) => {
  try {
    const res = await api.get(`/api/reports/emails/${JSON.stringify({startDate, endDate})}`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportOutstandingCores = async () => {
  try {
    const res = await api.get(`/api/reports/outstanding-cores`);
    return parseReportData(res.data);
  } catch (error) {
    console.error(error);
  }
};

export const reportNewCustomers = async (date: Date): Promise<NewCustomersReport[]> => {
  try {
    const res = await api.get(`/api/reports/new-customers`, { params: { date } });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const reportInventoryValueParts = async (): Promise<InventoryValueReportParts> => {
  try {
    const res = await api.get(`/api/reports/inventory-value/parts`);
    return res.data;
  } catch (error) {
    console.error(error);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueCoreEngines = async (): Promise<InventoryValueReportCoreEngines> => {
  try {
    const res = await api.get(`/api/reports/inventory-value/core-engines`);
    return { combinedTotal: res.data.combinedTotal, data: res.data.data.map((r: any) => ({ ...r, loginDate: parseResDate(r.loginDate) })) };
  } catch (error) {
    console.error(error);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueToreDownEngines = async (): Promise<InventoryValueReportToreDownEngines> => {
  try {
    const res = await api.get(`/api/reports/inventory-value/tore-down-engines`);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (error) {
    console.error(error);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueRunningEngines = async (): Promise<InventoryValueReportRunningEngines> => {
  try {
    const res = await api.get(`/api/reports/inventory-value/running-engines`);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (error) {
    console.error(error);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueShortBlocks = async (): Promise<InventoryValueReportShortBlocks> => {
  try {
    const res = await api.get(`/api/reports/inventory-value/short-blocks`);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (error) {
    console.error(error);
    return { combinedTotal: 0, data: [] };
  }
};

export const reportInventoryValueSurplus = async (): Promise<InventoryValueReportSurplus> => {
  try {
    const res = await api.get(`/api/reports/inventory-value/surplus`);
    return { combinedTotal: res.data.combinedTotal, data: parseReportData(res.data.data) };
  } catch (error) {
    console.error(error);
    return { combinedTotal: 0, data: [] };
  }
};

// === POST routes === //

export const addGonculatorData = async (partList: string[]) => {
  try {
    await api.post(`/api/reports/the-machines`, { partList });
  } catch (error) {
    console.error(error);
  }
};

// === DELETE routes === //

export const deleteGonculatorData = async () => {
  try {
    await api.delete(`/api/reports/the-machines`);
  } catch (error) {
    console.error(error);
  }
};
