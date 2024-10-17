import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseReportData = (data: any) => {
  return data.map((d: any) => {
    return { ...d, date: parseResDate(`${d.date}`), entryDate: parseResDate(`${d.entryDate}`), loginDate: parseResDate(`${d.loginDate}`) };
  });
};

// === GET routes === //

export const reportSingleCompany = async (customer: string, startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportCountry = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/country/`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportAllCompanies = async (startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-companies/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportAllParts = async (startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-parts/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportPartDesc = async (keyword: string, startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/part-desc/${JSON.stringify({keyword, startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportAllEngines = async (startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-engines/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportAllSources = async (startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/all-sources/${JSON.stringify({startDate, endDate})}`, auth);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const reportAllSalesmen = async (startDate: Date, endDate: Date) => {
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

export const reportArielSales = async (startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/ariel-sales/${JSON.stringify({startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportSingleCompanyParts = async (customer: string, startDate: Date, endDate: Date) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/reports/single-company-parts/${JSON.stringify({customer, startDate, endDate})}`, auth);
    return parseReportData(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const reportSingleCompanyEngines = async (customer: string, startDate: Date, endDate: Date) => {
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
