import { invoke } from "@/scripts/config/tauri";


export const getImagesFromPart = async (partNum: string) => {
  try {
    const res: any = await invoke('get_part_num_images', { pictureArgs: { part_num: partNum }});
    return res.filter((pic) => pic.name !== 'Thumbs.db') as Picture[];
  } catch (err) {
    console.error('Error getting part images:', err);
  }
};

export const getImagesFromStockNum = async (stockNum: string) => {
  try {
    const res: any = await invoke('get_stock_num_images', { pictureArgs: { stock_num: stockNum }});
    return res.filter((pic) => pic.name !== 'Thumbs.db') as Picture[];
  } catch (err) {
    console.error('Error getting stock images:', err);
  }
};

export const getEngineImages = async (engineNum: number) => {
  try {
    const res: any = await invoke('get_engine_images', { pictureArgs: { stock_num: `${engineNum}` }});
    console.log(res);
    return res.filter((pic) => pic.name !== 'Thumbs.db') as Picture[];
  } catch (err) {
    console.error('Error getting stock images:', err);
  }
};

export const checkImageExists = async (partNum: string, type: 'part' | 'stock'): Promise<boolean> => { 
  const res = await invoke('get_all_pictures', { pictureArgs: { part_num: partNum, pic_type: type }});
  return res === true;
};
