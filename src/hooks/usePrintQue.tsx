import { useAtom } from "jotai";
import { useNavState } from "./useNavState";
import { printQueAtom } from "@/scripts/atoms/state";


export function usePrintQue() {
  const router = useNavState();
  const [que, setQue] = useAtom<{ name: string, printCmd: string, data: any, maxWidth: string, maxHeight: string }[]>(printQueAtom);

  const addToQue = (name: string, printCmd: string, data: any, maxWidth: string, maxHeight: string) => {
    setQue((prev) => [...prev, { name, printCmd, data, maxWidth, maxHeight }]);
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
