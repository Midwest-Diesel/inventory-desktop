import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface NewAlert {
  date: Date
  salesmanId: number
  partNum: string
  type: string
  note: string | null
}


const parseAlertDataRes = (data: any) => {
  return data.map((d: Alert) => {
    return { ...d, date: parseResDate(`${d.date}`) };
  });
};

// === GET routes === //

export const getAlerts = async (): Promise<Alert[]> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/alerts', auth);
    res.data = parseAlertDataRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const detectAlerts = async (partNum: string): Promise<Alert[]> => {
  if (!partNum || partNum === '*') return [];
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/alerts/${partNum}`, auth);
    res.data = parseAlertDataRes(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addAlert = async (alert: NewAlert) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/alerts', alert, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editAlert = async (alert: Alert) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/alerts', alert, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteAlert = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/alerts/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
