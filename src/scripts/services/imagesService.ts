import { invoke } from "@/scripts/config/tauri";


export const getImagesFromPart = async (partNum: string | null): Promise<Picture[]> => {
  try {
    const res: any = await invoke('get_part_num_images', { pictureArgs: { part_num: partNum }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (err) {
    console.error('Error getting part images:', err);
    return [];
  }
};

export const getImagesFromStockNum = async (stockNum: string): Promise<Picture[]> => {
  try {
    const res: any = await invoke('get_stock_num_images', { pictureArgs: { stock_num: stockNum }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (err) {
    console.error('Error getting stock images:', err);
    return [];
  }
};

export const getEngineImages = async (engineNum: number | null): Promise<Picture[]> => {
  try {
    const res: any = await invoke('get_engine_images', { pictureArgs: { stock_num: `${engineNum}` }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (err) {
    console.error('Error getting engine images:', err);
    return [];
  }
};

export const checkImageExists = async (partNum: string, type: 'part' | 'stock'): Promise<boolean> => { 
  const res = await invoke('get_all_pictures', { pictureArgs: { part_num: partNum, pic_type: type }});
  return res === true;
};
