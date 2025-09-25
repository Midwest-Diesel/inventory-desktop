import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface RecentSearch {
  partNum: string
  salespersonId: number
}


// === GET routes === //

export const getRecentPartSearches = async (partNum: string) => {
  try {
    const res = await api.get(`/api/recent-searches/parts/${partNum}`);
    return res.data.map((search: any) => {
      return {
        ...search,
        date: parseResDate(search.date)
      };
    });
  } catch (err) {
    console.error(err);
  }
};

export const getQuotesByPartNum = async (partNum: string) => {
  try {
    const res = await api.get(`/api/recent-searches/quotes/${partNum}`);
    return res.data.map((search: any) => {
      return {
        ...search,
        date: parseResDate(search.date)
      };
    });
  } catch (err) {
    console.error(err);
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
