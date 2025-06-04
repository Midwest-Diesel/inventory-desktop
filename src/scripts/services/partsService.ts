import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { isObjectNull } from "../tools/utils";
import { checkImageExists } from "./imagesService";

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
  serialNum?: string
  hp?: string
  showSoldParts: boolean
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
      imageExists: (window as any).__TAURI_IPC__ && await checkImageExists(part.partNum, 'part'),
      snImageExists: (window as any).__TAURI_IPC__ && await checkImageExists(part.stockNum, 'stock'),
    };
  }));
  return partsWithImages;
};

// === GET routes === //

export const getPartById = async (id: number): Promise<Part | null> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/part/${id}`, auth);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getPartsInfoByPartNum = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/parts-info/part-num/${partNum}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartsInfoByAltParts = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/parts-info/alt-parts/${partNum}`, auth);
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

export const getAllPartNums = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/all-part-num`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartCostIn = async (stockNum: string): Promise<PartCostIn[]> => {
  try {
    const auth = { withCredentials: true };
    const encodedParam = encodeURIComponent(stockNum);
    const res = await api.get(`/api/parts/part-cost-in/${encodedParam}`, auth);  
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
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

export const getSomeParts = async (page: number, limit: number, showSoldParts: boolean): Promise<any> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showSoldParts })}`, auth);
    return await parsePartsData(res.data) ?? [];
  } catch (err) {
    console.error(err);
  }
};

export const getPartsQty = async (showSoldParts: boolean) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/qty/${showSoldParts}`, auth);
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
    const res = await api.get(`/api/parts/searchAlt/${encodeURIComponent(JSON.stringify(filteredPart))}`, auth);
    return await parsePartsData(res.data) || [];
  } catch (err) {
    console.error(err);
  }
};

export const getSalesInfo = async (altParts: string) => {
  try {
    if (!altParts) return;
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/sales-info/${altParts}`, auth);
    return {
      ...res.data,
      sales: res.data.sales.map((part: any) => {
        return {
          ...part,
          soldToDate: parseResDate(part.soldToDate)
        };
      }),
      quotes: res.data.quotes.map((quote: any) => {
        return {
          ...quote,
          date: parseResDate(quote.date)
        };
      })
    };
  } catch (err) {
    console.error(err);
  }
};

export const checkForNewPartNum = async (partNum: string) => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/check-new/${partNum}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartsByCoreFamily = async (coreFamily: string): Promise<Part[] | []> => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get(`/api/parts/core-family?coreFamily=${coreFamily}`, auth);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
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
    const data = { ...part, altParts: filteredAlts.reverse().join(','), partInfoExists };
    await api.post('/api/parts', data, auth);

    // Adds this part to all connected part records
    if (filteredAlts.length > 0) {
      await addAltParts(partNum, includedAlts, updateLoading);
      // Updates alt parts
      let altsToAdd: any[] = [];
      const res = await searchAltParts({ partNum: `*${filteredAlts[0]}`, showSoldParts: true }) ?? [];
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

export const addPartCostIn = async (stockNum: string, cost: number, invoiceNum: number | null, vendor: string, costType: string, note: string) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/parts/part-cost-in', { stockNum, cost, invoiceNum, vendor, costType, note }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const handlePartTakeoff = async (partId: number, qty: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/parts/takeoff', { partId, qty }, auth);
  } catch (err) {
    console.error(err);
  }
};

export const editPartQty = async (partId: number, qty: number) => {
  try {
    const auth = { withCredentials: true };
    await api.patch('/api/parts/qty', { partId, qty }, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editPart = async (part: Part) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/parts', part, auth);
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
