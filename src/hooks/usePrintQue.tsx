import { useAtom } from "jotai";
import { useNavState } from "./useNavState";
import { printQueAtom } from "@/scripts/atoms/state";


const SCALE = 1.2;
const setScale = (maxWidth: string, maxHeight: string): { width: string, height: string } => {
  const width = `${Number(maxWidth.split('px')[0]) * SCALE}px`;
  const height = `${Number(maxHeight.split('px')[0]) * SCALE}px`;
  return { width, height };
};

export function usePrintQue() {
  const router = useNavState();
  const [que, setQue] = useAtom<{ name: string, printCmd: string, data: unknown, printArgs?: unknown, maxWidth: string, maxHeight: string, fileName?: string }[]>(printQueAtom);

  const addToQue = (name: string, printCmd: string, data: unknown, maxWidth: string, maxHeight: string, printArgs?: unknown, fileName?: string) => {
    const { width, height } = setScale(maxWidth, maxHeight);
    setQue((prev) => [...prev, { name, printCmd, data, printArgs, maxWidth: width, maxHeight: height, fileName }]);
  };

  const clearQue = () => {
    setQue([]);
  };

  const printQue = () => {
    if (!window?.__TAURI_IPC__) return;
    router.push('Printing', '/print');
  };

  return { que, addToQue, clearQue,printQue };
}
