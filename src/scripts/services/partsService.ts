import api from "../config/axios";
import { parseResDate } from "../tools/stringUtils";
import { isObjectNull } from "../tools/utils";
import { checkImageExists } from "./imagesService";


const parsePartsData = async (parts: any) => {
  const partsWithImages = await Promise.all(parts.map(async (part: any) => {
    return {
      ...part,
      entryDate: new Date(part.entryDate),
      reconDate: new Date(part.reconDate),
      priceLastUpdated: part.priceLastUpdated && new Date(part.priceLastUpdated),
      soldToDate: part.soldToDate && new Date(part.soldToDate),
      altParts: part.altParts ? part.altParts.split(',').map((p: any) => p.trim()) : [],
      partCostIn: part.partCostIn ? part.partCostIn.filter((part: any) => !isObjectNull(part)) : [],
      engineCostOut: part.engineCostOut ? part.engineCostOut.filter((part: any) => !isObjectNull(part)) : [],
      imageExists: (window as any).__TAURI_IPC__ && await checkImageExists(part.partNum, 'part'),
      snImageExists: (window as any).__TAURI_IPC__ && await checkImageExists(part.stockNum, 'stock')
    } as Part;
  }));
  return partsWithImages;
};

// === GET routes === //

export const getPartById = async (id: number | null): Promise<Part | null> => {
  try {
    if (!id) return null;
    const res = await api.get(`/api/parts/part/${id}`);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getPartInfoByPartNum = async (partNum: string): Promise<PartInfo | null> => {
  try {
    const res = await api.get(`/api/parts/parts-info/part-num/${partNum}`);
    return res.data ? res.data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getPartInfoByAltParts = async (partNum: string): Promise<PartInfo[]> => {
  try {
    const res = await api.get(`/api/parts/parts-info/alt-parts/${partNum}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getPartByEngineNum = async (engineNum: number): Promise<Part | null> => {
  try {
    const res = await api.get(`/api/parts/engine-num/${engineNum}`);
    return (await parsePartsData(res.data))[0];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getPartsByStockNum = async (stockNum: string): Promise<Part[]> => {
  try {
    if (!stockNum) return [];
    const res = await api.get(`/api/parts/stock-num/${stockNum}`);
    return await parsePartsData(res.data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getAllPartNums = async () => {
  try {
    const res = await api.get(`/api/parts/all-part-num`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartCostIn = async (stockNum: string): Promise<PartCostIn[]> => {
  try {
    const encodedParam = encodeURIComponent(stockNum);
    const res = await api.get(`/api/parts/part-cost-in/${encodedParam}`);  
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getPartEngineCostOut = async (stockNum: string) => {
  try {
    const encodedParam = encodeURIComponent(stockNum);
    const res = await api.get(`/api/parts/engine-cost-out/${encodedParam}`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getSomeParts = async (page: number, limit: number, showSoldParts: boolean): Promise<{ pageCount: number, totalQty: number, rows: Part[], rowsHidden: number | null }> => {
  try {
    const res = await api.get(`/api/parts/limit/${JSON.stringify({ page: (page - 1) * limit, limit, showSoldParts })}`);
    return { pageCount: res.data.pageCount, totalQty: res.data.totalQty, rows: await parsePartsData(res.data.rows), rowsHidden: res.data.rowsHidden };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, totalQty: 0, rows: [], rowsHidden: null };
  }
};

export const getSomePartsMin = async (page: number, limit: number, showSoldParts: boolean): Promise<{ pageCount: number, totalQty: number, rows: PartMin[], rowsHidden: number | null }> => {
  try {
    const res = await api.get(`/api/parts/limit-min/${JSON.stringify({ page: (page - 1) * limit, limit, showSoldParts })}`);
    return { pageCount: res.data.pageCount, totalQty: res.data.totalQty, rows: await parsePartsData(res.data.rows), rowsHidden: res.data.rowsHidden };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, totalQty: 0, rows: [], rowsHidden: null };
  }
};

export const getPartsQty = async (showSoldParts: boolean): Promise<number> => {
  try {
    const res = await api.get(`/api/parts/qty/${showSoldParts}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getPartQty = async (partNum: string): Promise<number | null> => {
  try {
    const params = new URLSearchParams({ partNum });
    const res = await api.get(`/api/parts/part-qty?${params.toString()}`);
    return res.data.qty;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAltsByPartNum = async (partNum: string) => {
  try {
    const res = await api.get(`/api/parts/alts/${partNum}`);
    return res.data.length > 0 ? res.data[0] : res.data;
  } catch (err) {
    console.error(err);
  }
};

export const searchParts = async (part: PartSearchData, page: number, limit: number): Promise<{ pageCount: number, totalQty: number, rows: Part[], rowsHidden: number | null }> => {
  try {
    if (isObjectNull(part)) return { pageCount: 0, totalQty: 0, rows: [], rowsHidden: null };
    const res = await api.get(`/api/parts/search/${encodeURIComponent(JSON.stringify(part))}?offset=${(page - 1) * limit}&limit=${limit}`);
    return { pageCount: res.data.pageCount, totalQty: res.data.totalQty, rows: await parsePartsData(res.data.rows), rowsHidden: res.data.rowsHidden };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, totalQty: 0, rows: [], rowsHidden: null };
  }
};

export const searchAltParts = async (part: PartSearchData, page: number, limit: number): Promise<{ pageCount: number, totalQty: number, rows: Part[], rowsHidden: number | null }> => {
  try {
    if (isObjectNull(part)) return { pageCount: 0, totalQty: 0, rows: [], rowsHidden: null };
    const filteredPart = Object.fromEntries(
      Object.entries(part).filter(
        ([, value]) => value !== '' && value !== null && value !== '*'
      )
    );
    const res = await api.get(`/api/parts/searchAlt/${encodeURIComponent(JSON.stringify(filteredPart))}?offset=${(page - 1) * limit}&limit=${limit}`);
    return { pageCount: res.data.pageCount, totalQty: res.data.totalQty, rows: await parsePartsData(res.data.rows), rowsHidden: res.data.rowsHidden };
  } catch (err) {
    console.error(err);
    return { pageCount: 0, totalQty: 0, rows: [], rowsHidden: null };
  }
};

export const getSalesInfo = async (altParts: string): Promise<SalesInfo> => {
  try {
    if (!altParts) return { sales: [], quotes: [], salesByYearList: [], counters: { new: 0, recon: 0, used: 0, core: 0 }};
    const params = new URLSearchParams({ altParts });
    const res = await api.get(`/api/parts/sales-info?${params.toString()}`);
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
      }),
      salesByYearList: res.data.salesByYearList.map((part: any) => {
        return {
          ...part,
          soldToDate: parseResDate(part.soldToDate)
        };
      })
    };
  } catch (err) {
    console.error(err);
    return { sales: [], quotes: [], salesByYearList: [], counters: { new: 0, recon: 0, used: 0, core: 0 }};
  }
};

export const checkForNewPartNum = async (partNum: string) => {
  try {
    const res = await api.get(`/api/parts/check-new/${partNum}`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getPartsByCoreFamily = async (coreFamily: string): Promise<Part[]> => {
  try {
    const res = await api.get(`/api/parts/core-family?coreFamily=${coreFamily}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getNextUPStockNum = async (): Promise<string | null> => {
  try {
    const res = await api.get(`/api/parts/latest-up-stock-num`);
    return res.data.stockNum;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getPartsQtyHistory = async (partId: number): Promise<PartQtyHistory[]> => {
  try {
    const res = await api.get(`/api/parts/qty-history?partId=${partId}`);
    return res.data.map((r: any) => ({ ...r, dateChanged: new Date(r.dateChanged) }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getFastTrackInventory = async (): Promise<FastTrackItem[]> => {
  try {
    const res = await api.get(`/api/parts/fast-track`);
    const rows: FastTrackItem[] = res.data;
    const existingPartNums = new Set(rows.map((r) => r.part_num));
    const additionalRows: FastTrackItem[] = [];

    for (const row of rows) {
      if (!row.alt_parts) continue;
      const altParts = row.alt_parts
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      for (const altPart of altParts) {
        if (!existingPartNums.has(altPart)) {
          existingPartNums.add(altPart);
          additionalRows.push({
            part_num: altPart,
            manufacturer: '',
            qty: '',
            desc: '',
            alt_parts: altPart
          });
        }
      }
    }

    return [...rows, ...additionalRows];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// === POST routes === //

export const addPart = async (part: Part, partInfoExists: boolean): Promise<number | null> => {
  try {
    const partNum = part.partNum;
    const filteredAlts = part ? part.altParts.filter((p) => p !== partNum) : [];
    const includedAlts = [partNum, ...filteredAlts];

    // Create new part record
    const data = { ...part, altParts: filteredAlts.join(','), partInfoExists };
    const id = await api.post('/api/parts', data);

    // Adds this part to all connected part records
    if (filteredAlts.length > 0) {
      const filteredAlts = includedAlts.filter((p) => p && p !== partNum);
      await api.put('/api/parts/parts-info/add', { partNums: filteredAlts, altParts: includedAlts });
      
      // Updates alt parts
      let altsToAdd: any[] = [];
      const res = await searchAltParts({ partNum: `*${filteredAlts[0]}`, showSoldParts: true }, 1, 999999999) ?? [];
      res.rows.forEach((part) => {
        altsToAdd.push(...part.altParts);
      });
      altsToAdd = Array.from(new Set(altsToAdd));
      await editAltParts(partNum, altsToAdd);
    }

    return Number(id.data);
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addPartCostIn = async (stockNum: string, cost: number, invoiceNum: string | null, vendor: string, costType: string, note: string) => {
  try {
    await api.post('/api/parts/part-cost-in', { stockNum, cost, invoiceNum, vendor, costType, note });
  } catch (err) {
    console.error(err);
  }
};

export const addToPartQtyHistory = async (partId: number, qty: number) => {
  try {
    await api.post('/api/parts/qty-history', { partId, qty, date: new Date() });
  } catch (err) {
    console.error(err);
  }
};

// === PATCH routes === //

export const handlePartTakeoff = async (partId: number, qty: number, soldTo: string, sellingPrice: number, handwrittenId: number) => {
  try {
    await api.patch('/api/parts/takeoff', { partId, qty, soldTo, sellingPrice, handwrittenId });
  } catch (err) {
    console.error(err);
  }
};

export const setPartLastUpdated = async (partId: number) => {
  try {
    await api.patch('/api/parts/last-updated', { partId, date: new Date() });
  } catch (err) {
    console.error(err);
  }
};

export const editPartStockNum = async (partId: number, stockNum: string) => {
  try {
    await api.patch('/api/parts/stock-num', { partId, stockNum });
  } catch (err) {
    console.error(err);
  }
};

export const editWeightDims = async (partNum: string, weightDims: string) => {
  try {
    await api.patch('/api/parts/weight-dims', { partNum, weightDims });
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editPart = async (part: Part) => {
  try {
    await api.put('/api/parts', part);
  } catch (err) {
    console.error(err);
  }
};

export const editPartCostIn = async (part: PartCostIn) => {
  try {
    await api.put('/api/parts/cost-in', part);
  } catch (err) {
    console.error(err);
  }
};

export const editAltParts = async (partNum: string, altParts: string[]) => {
  try {
    await api.put('/api/parts/parts-info', { partNum, altParts });
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deletePart = async (id: number) => {
  try {
    await api.delete(`/api/parts/${id}`);
  } catch (err) {
    console.error(err);
  }
};

export const deletePartCostIn = async (id: number) => {
  try {
    await api.delete(`/api/parts/cost-in/${id}`);
  } catch (err) {
    console.error(err);
  }
};
