import api from "../config/axios";


// === GET routes === //

export const getAllSources = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/sources');
    return res.data.map((source: any) => source.source).sort();
  } catch (error) {
    console.error(error);
    return [];
  }
};
