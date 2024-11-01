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

export const addEmailStuffItem = async (payload: any) => {
  try {
    const auth = { withCredentials: true };
    await api.post('/api/email-stuff', payload, auth);
  } catch (err) {
    console.error(err);
  }
};

// === DELETE routes === //

export const deleteEmailStuffItem = async (id: number) => {
  try {
    const auth = { withCredentials: true };
    await api.delete(`/api/email-stuff/${id}`, auth);
  } catch (err) {
    console.error(err);
  }
};
