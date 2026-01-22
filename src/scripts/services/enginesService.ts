import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

export interface EngineSearch {
  stockNum?: number
  model?: string
  serialNum?: string
  date?: string
  location?: string
  comments?: string
  horsePower?: string
  jakeBrake: '' | 'TRUE' | 'FALSE'
  warranty: '' | 'TRUE' | 'FALSE'
  testRun: '' | 'TRUE' | 'FALSE'
  mileage?: string
  status: EngineStatus
  limit: number
  page: number
}


const parseEngineRes = (data: any) => {
  return data.map((engine: any) => {
    return {
      ...engine,
      toreDownDate: parseResDate(engine.toreDownDate),
      loginDate: parseResDate(engine.loginDate),
      soldDate: parseResDate(engine.soldDate),
      jakeBrake: Boolean(engine.jakeBrake),
      warranty: Boolean(engine.warranty),
      testRun: Boolean(engine.testRun),
      ecm: Boolean(engine.ecm),
      costOut: engine.costOut ? engine.costOut.filter((cost: number) => cost) : [],
      costIn: engine.costOut ? engine.costIn.filter((cost: number) => cost) : []
    };
  }).sort((a: any, b: any) => b.loginDate - a.loginDate);
};

// === GET routes === //

export const getAllEngines = async () => {
  try {
    const res = await api.get('/api/engines');
    return parseEngineRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getAutofillEngine = async (engineNum: number) => {
  try {
    const res = await api.get(`/api/engines/autofill/${engineNum}`);
    return parseEngineRes(res.data)[0];
  } catch (err) {
    console.error(err);
  }
};

export const getEnginesByStatus = async (status: EngineStatus, page: number, limit: number): Promise<{ pageCount: number, rows: Engine[] }> => {
  try {
    const res = await api.get(`/api/engines/status/${encodeURI(JSON.stringify({ status, offset: (page - 1) * limit, limit }))}`);
    return { pageCount: res.data.pageCount, rows: parseEngineRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const searchEngines = async (search: EngineSearch): Promise<{ pageCount: number, rows: Engine[] }> => {
  try {
    const res = await api.get(`/api/engines/search/${encodeURI(JSON.stringify({ ...search, offset: (search.page - 1) * search.limit }))}`);
    return { pageCount: res.data.pageCount, rows: parseEngineRes(res.data.rows) };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, rows: [] };
  }
};

export const getEngineByStockNum = async (stockNum: number | null): Promise<Engine | null> => {
  try {
    const res = await api.get(`/api/engines/stock-num/${stockNum}`);
    return parseEngineRes(res.data)[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getEnginesByEngineData = async (data: CustomerEngineData): Promise<Engine[]> => {
  try {
    const res = await api.get(`/api/engines/data/${JSON.stringify(data)}`);
    return parseEngineRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getEngineCostRemaining = async (stockNum: number): Promise<number> => {
  try {
    const res = await api.get(`/api/engines/cost-remaining/${stockNum}`);
    return res.data[0].costRemaining || 0;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getEngineProfit = async (stockNum: number) => {
  try {
    const res = await api.get(`/api/engines/profit/${stockNum}`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addEngine = async (engine: EngineAddOn) => {
  try {
    await api.post('/api/engines', engine);
  } catch (err) {
    console.error(err);
  }
};

export const addEngineCostIn = async (engineStockNum: number, cost: number, invoiceNum: string, vendor: string, costType: string, note: string) => {
  try {
    await api.post('/api/engines/cost-in', { engineStockNum, cost, invoiceNum, vendor, costType, note });
  } catch (err) {
    console.error(err);
  }
};

export const addEngineCostOut = async (stockNum: string, engineStockNum: number, cost: number, costType: string, note: string) => {
  try {
    await api.post('/api/engines/cost-out', { stockNum, engineStockNum, cost, costType, note });
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const editEngineStatus = async (id: number, currentStatus: EngineStatus) => {
  try {
    await api.patch('/api/engines/status', { id, currentStatus });
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editEngine = async (engine: Engine) => {
  try {
    await api.put('/api/engines', engine);
  } catch (err) {
    console.error(err);
  }
};

export const editEngineCostIn = async (engine: EngineCostIn) => {
  try {
    await api.put('/api/engines/cost-in', engine);
  } catch (err) {
    console.error(err);
  }
};

export const editEngineCostOut = async (engine: EngineCostOut) => {
  try {
    await api.put('/api/engines/cost-out', engine);
  } catch (err) {
    console.error(err);
  }
};

export const editEnginePartsTable = async (parts: EnginePartsTable, id: number) => {
  try {
    await api.put('/api/engines/parts-table', { parts, id });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteEngine = async (id: number) => {
  try {
    await api.delete(`/api/engines/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deleteEngineCostIn = async (id: number) => {
  try {
    await api.delete(`/api/engines/cost-in/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deleteEngineCostOut = async (id: number) => {
  try {
    await api.delete(`/api/engines/cost-out/${id}`);
  } catch (err) {
    console.error(err);
  }
};
