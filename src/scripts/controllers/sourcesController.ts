import api from "../config/axios";



// === GET routes === //

export const getAllSources = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/sources', auth);
    return res.data.map((source: any) => source.source).sort();
  } catch (err) {
    console.error(err);
  }
};
