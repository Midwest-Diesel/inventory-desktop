import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getAllSources = async (): Promise<string[]> => {
  try {
    const res = await api.get('/api/sources');
    return res.data.map((source: any) => source.source).sort();
  } catch (error) {
    handleError(error, 'getAllSources');
    return [];
  }
};
