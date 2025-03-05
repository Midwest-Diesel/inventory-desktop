import api from "../config/axios";


// === GET routes === //

export const getAllFreightCarriers = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/freight-carriers', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
