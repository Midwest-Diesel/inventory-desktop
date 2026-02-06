import { useAtom } from "jotai";
import { useNavState } from "./useNavState";
import { pdfQueAtom } from "@/scripts/atoms/state";


export function usePdfQue() {
  const router = useNavState();
  const [que, setQue] = useAtom<{ name: string, pdfCmd: string, data: any, args: any, maxWidth: string, maxHeight: string }[]>(pdfQueAtom);

  const addToQue = (name: string, pdfCmd: string, data: any, args: any, maxWidth: string, maxHeight: string) => {
    setQue((prev) => [...prev, { name, pdfCmd, data, args, maxWidth, maxHeight }]);
  };

  const clearQue = () => {
    setQue([]);
  };

  const exportQue = () => {
    if (!window?.__TAURI_IPC__) return;
    router.push('PDF', '/pdf');
  };

  return { que, addToQue, clearQue, exportQue };
}
