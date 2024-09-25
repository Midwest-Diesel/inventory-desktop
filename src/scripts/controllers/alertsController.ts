import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";


const parseAlertDataRes = (data: any) => {
  return data.map((d: Alert) => {
    return { ...d, date: parseResDate(`${d.date}`) };
  });
};

// === GET routes === //

export const getAlerts = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/alerts', auth);
    res.data = parseAlertDataRes(res.data);
    return res.data.reverse();
  } catch (err) {
    console.log(err);
  }
};

// === POST routes === //

export const addAlert = async (alert: Alert) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/alerts', alert, auth);
  } catch (err) {
    console.log(err);
  }
};

// === PUT routes === //

export const editAlert = async (alert: Alert) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/alerts', alert, auth);
  } catch (err) {
    console.log(err);
  }
};

// === DELETE routes === //

export const deleteAlert = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/alerts/${id}`, auth);
  } catch (err) {
    console.log(err);
  }
};
