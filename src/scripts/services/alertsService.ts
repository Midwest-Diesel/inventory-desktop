import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { handleError } from "../tools/utils";

interface NewAlert {
  date: Date
  salesmanId: number
  subtext: string
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
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const searchAlerts = async (partNum: string): Promise<Alert[]> => {
  try {
    const params = new URLSearchParams({ partNum });
    const res = await api.get(`/api/alerts/search?${params.toString()}`);
    return parseAlertDataRes(res.data);
  } catch (error) {
    handleError(error, 'searchAlerts');
    return [];
  }
};

export const detectAlerts = async (partNum: string): Promise<Alert[]> => {
  if (!partNum || partNum === '*') return [];
  try {
    const res = await api.get(`/api/alerts/partNum/${partNum}`);
    return parseAlertDataRes(res.data);
  } catch (error) {
    handleError(error, 'detectAlerts');
    return [];
  }
};

// === POST routes === //

export const addAlert = async (alert: NewAlert) => {
  try {
    await api.post('/api/alerts', alert);
  } catch (error) {
    handleError(error, 'addAlert');
  }
};

// === PUT routes === //

export const editAlert = async (alert: Alert) => {
  try {
    await api.put('/api/alerts', alert);
  } catch (error) {
    handleError(error, 'editAlert');
  }
};

// === DELETE routes === //

export const deleteAlert = async (id: number) => {
  try {
    await api.delete(`/api/alerts/${id}`);
  } catch (error) {
    handleError(error, 'deleteAlert');
  }
};
