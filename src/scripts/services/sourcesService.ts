import api from "../config/axios";



// === GET routes === //

export const getAllSources = async () => {
  try {
    const res = await api.get('/api/sources');
    return res.data.map((source: any) => source.source).sort();
  } catch (err) {
    console.error(err);
  }
};
