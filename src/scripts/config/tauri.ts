import { invoke as tauriEvent } from "@tauri-apps/api/tauri";
import { confirm as tauriConfirm } from "@tauri-apps/api/dialog";

export const invoke = async (cmd: string, args?: any) => {
  if (!window.__TAURI_IPC__) return;
  await tauriEvent(cmd, args);
};

export const confirm = async (msg: string): Promise<boolean> => {
  if (!window.__TAURI_IPC__) return true;
  return await tauriConfirm(msg);
};
