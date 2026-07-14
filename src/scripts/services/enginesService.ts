import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

export interface EngineSearch {
  stockNum?: number
  model?: string
  serialNum?: string
  arrNum?: string
  soldTo?: string
  date?: string
  location?: string
  comments?: string
  horsePower?: string
  jakeBrake: '' | 'TRUE' | 'FALSE'
  warranty: '' | 'TRUE' | 'FALSE'
  testRun: '' | 'TRUE' | 'FALSE'
  mileage?: string
  status: EngineStatus | null
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
  });
};

// === GET routes === //

export const getAllEngines = async (): Promise<Engine[]> => {
  try {
    const res = await api.get('/api/engines');
    return parseEngineRes(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAllEngineModels = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/engines/models');
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAutofillEngine = async (engineNum: number) => {
  try {
    const res = await api.get(`/api/engines/autofill/${engineNum}`);
    return parseEngineRes(res.data)[0];
  } catch (error) {
    console.error(error);
  }
};

export const getEnginesByStatus = async (status: EngineStatus | null, page: number, limit: number): Promise<{ pageCount: number, rows: Engine[] }> => {
  try {
    const params = { status, offset: (page - 1) * limit, limit };
    const res = await api.get(`/api/engines/status`, { params });
    return { pageCount: res.data.pageCount, rows: parseEngineRes(res.data.rows) };
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const searchEngines = async (search: EngineSearch): Promise<{ pageCount: number, rows: Engine[] }> => {
  try {
    const params = { ...search, stockNum: search.stockNum || '', offset: (search.page - 1) * search.limit };
    const res = await api.get(`/api/engines/search`, { params });
    return { pageCount: res.data.pageCount, rows: parseEngineRes(res.data.rows) };
  } catch (error) {
    console.error(error);
    return { pageCount: 0, rows: [] };
  }
};

export const getEngineByStockNum = async (stockNum: number | null): Promise<Engine | null> => {
  try {
    if (!stockNum || Number(stockNum) === 0) return null;
    const res = await api.get(`/api/engines/stock-num/${stockNum}`);
    return parseEngineRes(res.data)[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getEnginesByEngineData = async (data: CustomerEngineData): Promise<Engine[]> => {
  try {
    const res = await api.get(`/api/engines/data/${JSON.stringify(data)}`);
    return parseEngineRes(res.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getEngineCostRemaining = async (stockNum: number): Promise<number> => {
  try {
    const res = await api.get(`/api/engines/cost-remaining/${stockNum}`);
    return res.data.costRemaining || 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getEngineProfit = async (stockNum: number) => {
  try {
    const res = await api.get(`/api/engines/profit/${stockNum}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

// === POST routes === //

export const addEngine = async (engine: EngineAddOn) => {
  try {
    await api.post('/api/engines', engine);
  } catch (error) {
    console.error(error);
  }
};

export const addEngineCostIn = async (engineStockNum: number, cost: number, invoiceNum: string, vendor: string, costType: string, note: string) => {
  try {
    await api.post('/api/engines/cost-in', { engineStockNum, cost, invoiceNum, vendor, costType, note });
  } catch (error) {
    console.error(error);
  }
};

export const addEngineCostOut = async (stockNum: string, engineStockNum: number, cost: number, costType: string, note: string) => {
  try {
    await api.post('/api/engines/cost-out', { stockNum, engineStockNum, cost, costType, note });
  } catch (error) {
    console.error(error);
  }
};

// === PATCH routes === //

export const editEngineStatus = async (id: number, currentStatus: EngineStatus) => {
  try {
    await api.patch('/api/engines/status', { id, currentStatus });
  } catch (error) {
    console.error(error);
  }
};

// === PUT routes === //

export const editEngine = async (engine: Engine) => {
  try {
    await api.put('/api/engines', engine);
  } catch (error) {
    console.error(error);
  }
};

export const editEngineCostIn = async (engine: EngineCostIn) => {
  try {
    await api.put('/api/engines/cost-in', engine);
  } catch (error) {
    console.error(error);
  }
};

export const editEngineCostOut = async (engine: EngineCostOut) => {
  try {
    await api.put('/api/engines/cost-out', engine);
  } catch (error) {
    console.error(error);
  }
};

export const editEnginePartsTable = async (parts: EnginePartsTable, id: number) => {
  try {
    await api.put('/api/engines/parts-table', { parts, id });
  } catch (error) {
    console.error(error);
  }
};

// === DELETE routes === //

export const deleteEngine = async (id: number) => {
  try {
    await api.delete(`/api/engines/${id}`);
  } catch (error) {
    console.error(error);
  }
};

export const deleteEngineCostIn = async (id: number) => {
  try {
    await api.delete(`/api/engines/cost-in/${id}`);
  } catch (error) {
    console.error(error);
  }
};

export const deleteEngineCostOut = async (id: number) => {
  try {
    await api.delete(`/api/engines/cost-out/${id}`);
  } catch (error) {
    console.error(error);
  }
};
