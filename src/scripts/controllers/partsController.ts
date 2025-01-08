import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { isObjectNull } from "../tools/utils";
import { checkImageExists } from "./imagesController";

interface PartSearchData {
  partNum?: string
  stockNum?: string
  desc?: string
  location?: string
  qty?: number
  remarks?: string
  rating?: number
  ourCost?: number
  entryDate?: Date
  purchasedFrom?: string
}


const parsePartsData = async (parts: any) => {
  const partsWithImages = await Promise.all(parts.map(async (part: any) => {
    return {
      ...part,
      entryDate: new Date(part.entryDate),
      soldToDate: new Date(part.soldToDate),
      altParts: part.altParts ? part.altParts.split(',').map((p: any) => p.trim()) : [],
      partsCostIn: part.partsCostIn ? part.partsCostIn.filter((part: any) => !isObjectNull(part)) : [],
      engineCostOut: part.engineCostOut ? part.engineCostOut.filter((part: any) => !isObjectNull(part)) : [],
      imageExists: await checkImageExists(part.partNum, 'part'),
      snImageExists: await checkImageExists(part.stockNum, 'stock'),
    };
  }));
  return partsWithImages;
};

// === GET routes === //

export const getPartById = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/part/${id}`, auth);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
  }
};

export const getPartsInfoByPartNum = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/parts-info/${partNum}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartByPartNum = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/part-num/${partNum}`, auth);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
  }
};

export const getPartByEngineNum = async (engineNum: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/engine-num/${engineNum}`, auth);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
  }
};

export const getPartByStockNum = async (stockNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/stock-num/${stockNum}`, auth);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
  }
};

export const getAutofillPart = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/autofill/${partNum}`, auth);
    const data = (await parsePartsData(res.data))[0];
    return data ? data.partNum : '';
  } catch (err) {
    console.error(err);
  }
};

export const getPartCostIn = async (stockNum: string) => {
  try {
    const auth = { withCredentials: true };
    const encodedParam = encodeURIComponent(stockNum);
    const res = await api.get(`/api/parts/part-cost-in/${encodedParam}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartEngineCostOut = async (stockNum: string) => {
  try {
    const auth = { withCredentials: true };
    const encodedParam = encodeURIComponent(stockNum);
    const res = await api.get(`/api/parts/engine-cost-out/${encodedParam}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartsByYear = async (year: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/year/${year}`, auth);
    return await parsePartsData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getSomeParts = async (page: number, limit: number) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/limit/${JSON.stringify({ page: (page - 1) * limit, limit: limit })}`, auth);
    return await parsePartsData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getPartsQty = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/parts/qty', auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAltsByPartNum = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/alts/${partNum}`, auth);
    return res.data.length > 0 ? res.data[0] : res.data;
  } catch (err) {
    console.error(err);
  }
};

export const searchParts = async (part: PartSearchData) => {
  try {
    if (isObjectNull(part)) return null;
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/search/${JSON.stringify(part)}`, auth);
    return await parsePartsData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const searchAltParts = async (part: PartSearchData) => {
  try {
    if (isObjectNull(part)) return null;
    const filteredPart = Object.fromEntries(
      Object.entries(part).filter(
        ([key, value]) => value !== '' && value !== null && value !== '*'
      )
    );
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/searchAlt/${JSON.stringify(filteredPart)}`, auth);
    return await parsePartsData(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getSalesInfo = async (partNum: string) => {
  try {
    if (!partNum) return;
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/sales-info/${partNum}`, auth);
    res.data.sales = res.data.sales.map((s) => {
      return { ...s, soldToDate: parseResDate(s.soldToDate) };
    }).sort((a, b) => b.soldToDate - a.soldToDate);
    res.data.quotes = res.data.quotes.map((q) => {
      return { ...q, date: parseResDate(q.date) };
    }).sort((a, b) => b.date - a.date);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addPart = async (part: Part, partInfoExists: boolean, updateLoading?: (i: number, total: number) => void) => {
  try {
    const partNum = part.partNum;
    const filteredAlts = part ? part.altParts.filter((p) => p !== partNum) : [];
    const includedAlts = [partNum, ...filteredAlts];

    // Create new part record
    const auth = { withCredentials: true };
    const data = { ...part, altParts: part.altParts.join(','), partInfoExists };
    await api.post('/api/parts', data, auth);

    // Adds this part to all connected part records
    if (filteredAlts.length > 0) {
      await addAltParts(partNum, includedAlts, updateLoading);
      // Updates alt parts
      let altsToAdd = [];
      const res = await searchAltParts({ partNum: `*${filteredAlts[0]}` });
      res.forEach((part) => {
        altsToAdd.push(...part.altParts);
      });
      altsToAdd = Array.from(new Set(altsToAdd.reverse()));
      await editAltParts(partNum, altsToAdd);
    }
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const handlePartTakeoff = async (partId: number, qty: number, stockNum: string, cost: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/parts/takeoff', { partId, qty }, auth);
    await api.patch('/api/parts/cost-in/takeoff', { stockNum, cost }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editPart = async (part: Part) => {
  try {
    const auth = { withCredentials: true };
    const data = { ...part, altParts: part.altParts.join(',') };
    await api.put('/api/parts', data, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editPartCostIn = async (part: PartCostIn) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/parts/cost-in', part, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editAltParts = async (partNum: string, altParts: string[]) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/parts/parts-info', { partNum, altParts }, auth);
  } catch (err) {
    console.error(err);
  }
};

// Adds alt parts to all connected records but the one being edited
export const addAltParts = async (partNum: string, altParts: string[], updateLoading?: (i: number, total: number) => void) => {
  try {
    const auth = { withCredentials: true };
    const filteredAlts = altParts.filter((p) => p && p !== partNum);
    for (let i = 0; i < filteredAlts.length; i++) {
      if (updateLoading) updateLoading(i + 1, filteredAlts.length);
      for (let j = 0; j < altParts.length; j++) {
        await api.put('/api/parts/parts-info/add', { partNum: filteredAlts[i], altParts: altParts[j] }, auth);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

export const removeAltParts = async (partNum: string, altParts: string[]) => {
  try {
    const auth = { withCredentials: true };
    const filteredAlts = altParts.filter((p) => p && p !== partNum);
    for (let i = 0; i < filteredAlts.length; i++) {
      for (let j = 0; j < altParts.length; j++) {
        await api.put('/api/parts/parts-info/remove', { partNum: filteredAlts[i], altParts: altParts[j] }, auth);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deletePart = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/parts/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};

export const deletePartCostIn = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/parts/cost-in/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
