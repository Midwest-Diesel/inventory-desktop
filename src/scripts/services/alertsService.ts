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
    const res = await api.get('/api/alerts');
    return parseAlertDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const detectAlerts = async (partNum: string): Promise<Alert[]> => {
  if (!partNum || partNum === '*') return [];
  try {
    const res = await api.get(`/api/alerts/${partNum}`);
    return parseAlertDataRes(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addAlert = async (alert: NewAlert) => {
  try {
    await api.post('/api/alerts', alert);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editAlert = async (alert: Alert) => {
  try {
    await api.put('/api/alerts', alert);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteAlert = async (id: number) => {
  try {
    await api.delete(`/api/alerts/${id}`);
  } catch (err) {
    console.error(err);
  }
};
