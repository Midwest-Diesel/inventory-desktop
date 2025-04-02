import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";

interface RecentSearch {
  partNum: string
  salespersonId: number
}


// === GET routes === //

export const getRecentPartSearches = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/recent-searches/parts/${partNum}`, auth);
    res.data = res.data.map((search: any) => {
      return {
        ...search,
        date: parseResDate(search.date)
      };
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getQuotesByPartNum = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/recent-searches/quotes/${partNum}`, auth);
    res.data = res.data.map((search: any) => {
      return {
        ...search,
        date: parseResDate(search.date)
      };
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addRecentSearch = async (payload: RecentSearch) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/recent-searches', payload, auth);
  } catch (err) {
    console.error(err);
  }
};
