import api from "../config/axios";

import { supabase } from "../config/supabase";


export const getImagesFromPart = async (partNum: string) => {
  try {
    const data = await getBucket('parts');
    // Gets the folders with the most matching part number
    const folder = data.filter((folder) => partNum.includes(folder.name));
    partNum = folder.length > 0 ? folder[0].name : '';
    if (!partNum) return [];
    
    const images = (await supabase.storage.from('parts').list(partNum)).data.map((img) => {
      return {
        id: img.id,
        name: img.name,
        url: supabase.storage.from('parts').getPublicUrl(`${partNum}/${img.name}`).data.publicUrl
      };
    });
    return images as Picture[];
  } catch (err) {
    console.error('Error getting part images:', err);
  }
};

export const getImagesFromStockNum = async (stockNum: string) => {
  try {
    const data = await getBucket('stockNum');
    const folder = data.filter((folder) => stockNum.includes(folder.name));
    stockNum = folder.length > 0 ? folder[0].name : '';
    if (!stockNum) return [];
    
    const images = (await supabase.storage.from('stockNum').list(stockNum)).data.map((img) => {
      return {
        id: img.id,
        name: img.name,
        url: supabase.storage.from('stockNum').getPublicUrl(`${stockNum}/${img.name}`).data.publicUrl
      };
    });
    return images as Picture[];
  } catch (err) {
    console.error('Error getting part images:', err);
  }
};

export const checkImageExists = (pictureData: any[], partNum: string) => {
  const images = pictureData.find((p: any) => partNum && partNum.includes(p.name));
  return images ? true : false;
};

export const getBucket = async (name: string) => {
  try {
    const { data } = await supabase.storage.from(name).list('', { limit: 999999 });
    return data;
  } catch (err) {
    console.error('Error getting bucket:', err);
  }
};

export const addImageToSupabase = async (bucket: string, name: string, file: File) => {
  await supabase.storage.from(bucket).upload(name, file);
};


const BUCKET = 'stockNum';
const ROUTE = 'sn_specific';
const LIMIT = 10;
export const uploadFiles = async () => {
  try {
    const auth = { withCredentials: true };
    const payload = { LIMIT };
    await api.post(`/api/pictures/${ROUTE}/set`, payload, auth);
    const bucket = await getBucket(BUCKET);

    for (let x = 0; x < bucket.length; x++) {
      const res = await api.get(`/api/pictures`, auth);
      for (const fileData of res.data) {
        if (bucket.find((b) => b.name === fileData.name)) continue;
        const base64Data = fileData.url.replace(/^data:.+;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const name = fileData.name.split('/').pop();
        const file = new File([blob], name, { type: `image/${name.split('.')[1]}` });
        const path = fileData.name.replace(/\\/g, '/').replace(/\/\/MWD1-SERVER\/Server\/Pictures\/parts_dir/g, '').replace(/\/\/MWD1-SERVER\/Server\/Pictures\/sn_specific/g, '');
        console.log(file, path);
        await supabase.storage.from(BUCKET).upload(path, file);
      }
    }
  } catch (err) {
    console.error('Error uploading file:', err);
  }
};
