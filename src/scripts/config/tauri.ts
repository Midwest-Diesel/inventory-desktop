import { invoke as tauriEvent } from "@tauri-apps/api/tauri";
import { confirm as tauriConfirm } from "@tauri-apps/api/dialog";
import { windowConfirm } from "../tools/utils";

export const invoke = async (cmd: string, args?: any) => {
  if (!window?.__TAURI_IPC__) return;
  return await tauriEvent(cmd, args);
};

export const confirm = async (msg: string): Promise<boolean> => {
  if (!window?.__TAURI_IPC__) return windowConfirm(msg);
  return await tauriConfirm(msg);
};
