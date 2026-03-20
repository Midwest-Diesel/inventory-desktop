import { useAtom } from "jotai";
import { useNavState } from "./useNavState";
import { printQueAtom } from "@/scripts/atoms/state";


export function usePrintQue() {
  const router = useNavState();
  const [que, setQue] = useAtom<{ name: string, printCmd: string, data: any, printArgs?: any, maxWidth: string, maxHeight: string, fileName?: string }[]>(printQueAtom);

  const addToQue = (name: string, printCmd: string, data: any, maxWidth: string, maxHeight: string, printArgs?: any, fileName?: string) => {
    setQue((prev) => [...prev, { name, printCmd, data, printArgs, maxWidth, maxHeight, fileName }]);
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
