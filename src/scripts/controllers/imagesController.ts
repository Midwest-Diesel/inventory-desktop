import { invoke } from "@tauri-apps/api/tauri";


export const getImagesFromPart = async (partNum: string) => {
  try {
    const res = await invoke('get_part_num_images', { pictureArgs: { part_num: partNum }});
    return res as Picture[];
  } catch (err) {
    console.error('Error getting part images:', err);
  }
};

export const getImagesFromStockNum = async (stockNum: string) => {
  try {
    const res = await invoke('get_stock_num_images', { pictureArgs: { stock_num: stockNum }});
    return res as Picture[];
  } catch (err) {
    console.error('Error getting stock images:', err);
  }
};

export const checkImageExists = async (partNum: string, type: 'part' | 'stock'): Promise<boolean> => { 
  const res = await invoke('get_all_pictures', { pictureArgs: { part_num: partNum, pic_type: type }});
  return res === true;
};
