import { invoke } from "@/scripts/config/tauri";
import api from "../config/axios";
import { handleError } from "../tools/utils";


const parseEmailStuffRes = async (res: any) => {
  return await Promise.all(res.map(async (item: any) => {
    return { ...item, images: await invoke('convert_img_to_base64', { pictures: item.images.split(', ') }) };
  }));
};

// === GET routes === //

export const getAllEmailStuff = async (): Promise<EmailStuff[]> => {
  try {
    const res = await api.get('/api/email-stuff');
    return await parseEmailStuffRes(res.data) ?? [];
  } catch (error) {
    handleError(error, 'getAllEmailStuff');
    return [];
  }
};

// === POST routes === //

export const addEmailStuffItem = async (payload: { name: string, images: string }) => {
  try {
    await api.post('/api/email-stuff', payload);
  } catch (error) {
    handleError(error, 'addEmailStuffItem');
  }
};

// === DELETE routes === //

export const deleteEmailStuffItem = async (id: number) => {
  try {
    await api.delete(`/api/email-stuff/${id}`);
  } catch (error) {
    handleError(error, 'deleteEmailStuffItem');
  }
};
