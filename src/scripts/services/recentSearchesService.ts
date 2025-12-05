import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface RecentSearch {
  partNum: string
  salespersonId: number
}


const parseRecentSearches = (data: any[]) => {
  return data.map((search: any) => {
    return {
      ...search,
      date: parseResDate(search.date)
    };
  });
};

// === GET routes === //

export const getRecentPartSearches = async (partNum: string): Promise<RecentPartSearch[]> => {
  try {
    const params = { partNum };
    const res = await api.get(`/api/recent-searches/parts`, { params });
    return parseRecentSearches(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getRecentPartSearchesToday = async (): Promise<RecentPartSearch[]> => {
  try {
    const res = await api.get(`/api/recent-searches/parts/today`);
    return parseRecentSearches(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getQuotesByPartNum = async (partNum: string): Promise<RecentQuoteSearch[]> => {
  try {
    const params = { partNum };
    const res = await api.get(`/api/recent-searches/quotes`, { params });
    return parseRecentSearches(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addRecentSearch = async (payload: RecentSearch) => {
  try {
    await api.post('/api/recent-searches', payload);
  } catch (err) {
    console.error(err);
  }
};
