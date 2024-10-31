import { invoke } from "@tauri-apps/api/tauri";
import api from "../config/axios";


const parseEmailStuffRes = async (res) => {
  return await Promise.all(res.map(async (item) => {
    return { ...item, images: await invoke('convert_img_to_base64', { pictures: item.images.split(', ') }) };
  }));
};

// === GET routes === //

export const getAllEmailStuff = async () => {
  try {
    const auth = { withCredentials: true };
    const res = await api.get('/api/email-stuff', auth);
    return await parseEmailStuffRes(res.data);
  } catch (err) {
    console.error(err);
  }
};

// === POST routes === //

export const addEmailStuffItem = async (payload: EmailStuff) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/email-stuff', payload, auth);
  } catch (err) {
    console.error(err);
  }
};

// === PUT routes === //

export const editEmailStuffItem = async (payload: EmailStuff) => {
  try {
    const auth = { withCredentials: true };
    await api.put('/api/email-stuff', payload, auth);
  } catch (err) {
    console.error(err);
  }
};
