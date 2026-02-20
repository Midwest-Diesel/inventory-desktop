import { save } from "@tauri-apps/api/dialog";
import { invoke } from "../config/tauri";
import { writeBinaryFile } from "@tauri-apps/api/fs";


export const fileStoragePath = '//MWD1-SERVER/Server/Inventory File Storage';

export const uploadFile = async (file: File | null, path: string) => {
  try {
    if (!file) {
      console.error('No file data');
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = Array.from(new Uint8Array(arrayBuffer));
    const splitPath = path.replaceAll('\\', '/').split('/');
    const dir = splitPath.slice(0, -1).join('/');
    const name = splitPath[splitPath.length - 1];

    await invoke('upload_file', { fileArgs: { file: uint8Array, dir, name } });
  } catch (error) {
    console.error(error);
  }
};

export const readJsonFile = async <T = unknown>(path: string): Promise<T | null> => {
  try {
    const result = await invoke('get_json_file', { path }) as T | null;
    return result ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const downloadFile = async (path: string) => {
  try {
    const savePath = await save({ title: "Save Pricing Changes", defaultPath: "pricing_changes.xlsx" });
    if (!savePath) return;
    const bytes = await invoke('read_file_bytes', { path });
    const data = new Uint8Array(bytes);
    await writeBinaryFile({ path: savePath, contents: data });
  } catch (error) {
    console.error('Download Failed: ', error);
  }
};

export const deleteFile = async (path: string) => {
  try {
    await invoke('delete_file', { path });
  } catch (error) {
    console.error(error);
  }
};
