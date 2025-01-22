import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


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
      ecm: Boolean(engine.ecm)
    };
  }).sort((a: any, b: any) => b.loginDate - a.loginDate);
};

// === GET routes === //

export const getAllEngines = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/engines', auth);
    res.data = parseEngineRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAutofillEngine = async (engineNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/autofill/${engineNum}`, auth);
    res.data = parseEngineRes(res.data)[0];
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getEnginesByStatus = async (status: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/status/${status}`, auth);
    res.data = parseEngineRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getEngineById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/id/${id}`, auth);
    res.data = parseEngineRes(res.data);
    return res.data[0];
  } catch (err) {
    console.error(err);
  }
};

export const getEngineByStockNum = async (stockNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/stock-num/${stockNum}`, auth);
    res.data = parseEngineRes(res.data);
    return res.data[0];
  } catch (err) {
    console.error(err);
  }
};

export const getEnginesByEngineData = async (data: CustomerEngineData) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/data/${JSON.stringify(data)}`, auth);
    res.data = parseEngineRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getEngineCostIn = async (stockNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/costIn/${stockNum}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getEngineCostOut = async (stockNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/costOut/${stockNum}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getEngineCostRemaining = async (stockNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/cost-remaining/${stockNum}`, auth);
    return res.data[0].costRemaining || 0;
  } catch (err) {
    console.error(err);
  }
};

export const getEngineProfit = async (stockNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/engines/profit/${stockNum}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addEngine = async (engine: EngineAddOn) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/engines', engine, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editEngine = async (engine: Engine) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/engines', engine, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editEngineCostIn = async (engine: EngineCostIn) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/engines/cost-in', engine, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editEngineCostOut = async (engine: EngineCostOut) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/engines/cost-out', engine, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editEnginePartsTable = async (parts: EnginePartsTable, id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/engines/parts-table', { parts, id }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteEngine = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/engines/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteEngineCostIn = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/engines/cost-in/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deleteEngineCostOut = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/engines/cost-out/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
