import api from "../config/axios";


// === GET routes === //

export const getTabsByUser = async () => {
  try {
    return await api.get('/api/tabs');
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addTab = async (history: { name: string, url: string }[]) => {
  try {
    await api.post('/api/tabs', { history });
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const changeSelectedTab = async (id: number) => {
  try {
    await api.patch('/api/tabs/selected', { id });
  } catch (err) {
    console.error(err);
  }
};

export const editTabHistory = async (id: number, urlIndex: number, history: { name: string, url: string }[]) => {
  try {
    await api.patch('/api/tabs/history', { id, urlIndex, history });
  } catch (err) {
    console.error(err);
  }
};

export const renameTab = async (id: number, name: string) => {
  try {
    await api.patch('/api/tabs/name', { id, name });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteTab = async (id: number) => {
  try {
    await api.delete(`/api/tabs/${id}`);
  } catch (err) {
    console.error(err);
  }
};
