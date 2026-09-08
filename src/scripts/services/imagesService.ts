import { invoke } from "@/scripts/config/tauri";
import { handleError } from "../tools/utils";


export const getImagesFromPart = async (partNum: string | null): Promise<Picture[]> => {
  try {
    const res = await invoke('get_part_num_images', { pictureArgs: { part_num: partNum }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (error) {
    handleError(error, 'getImagesFromPart');
    return [];
  }
};

export const getImagesFromStockNum = async (stockNum: string): Promise<Picture[]> => {
  try {
    const res = await invoke('get_stock_num_images', { pictureArgs: { stock_num: stockNum }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (error) {
    handleError(error, 'getImagesFromStockNum');
    return [];
  }
};

export const getEngineImages = async (engineNum: number | null): Promise<Picture[]> => {
  try {
    const res = await invoke('get_engine_images', { pictureArgs: { stock_num: `${engineNum}` }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (error) {
    handleError(error, 'getEngineImages');
    return [];
  }
};

export const checkImageExists = async (partNum: string, type: 'part' | 'stock'): Promise<boolean> => { 
  const res = await invoke('get_all_pictures', { pictureArgs: { part_num: partNum, pic_type: type }});
  return res === true;
};
