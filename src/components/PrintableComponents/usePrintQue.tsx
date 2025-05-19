import { useAtom } from "jotai";
import { useNavState } from "../Navbar/useNavState";
import { printQueAtom } from "@/scripts/atoms/state";


export function usePrintQue() {
  const router = useNavState();
  const [que, setQue] = useAtom<{ name: string, printCmd: string, data: any }[]>(printQueAtom);

  const addToQue = (name: string, printCmd: string, data: any) => {
    setQue((prev) => [...prev, { name, printCmd, data }]);
  };

  const clearQue = () => {
    setQue([]);
  };

  const printQue = () => {
    router.push('Printing', '/print');
  };

  return { que, addToQue, clearQue,printQue };
}
