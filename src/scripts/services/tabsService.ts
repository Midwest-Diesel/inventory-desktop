import api from "../config/axios";


// === GET routes === //

export const getTabsByUser = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/tabs', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addTab = async (history: { name: string, url: string }[]) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/tabs', { history }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const changeSelectedTab = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/tabs/selected', { id }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editTabHistory = async (id: number, urlIndex: number, history: { name: string, url: string }[]) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/tabs/history', { id, urlIndex, history }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const renameTab = async (id: number, name: string) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/tabs/name', { id, name }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteTab = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/tabs/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
