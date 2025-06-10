import { toastAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";


export function useToast() {
  const [toasts, setToasts] = useAtom<Toast[]>(toastAtom);

  const sendToast = (msg: string, type: 'error' | 'success' | 'warning' | 'info' | 'none', duration = 6000) => {
    setToasts([...toasts, { msg, type, duration, id: toasts.length }]);
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== toasts.length))
    }, duration ?? 6000);
  };
  
  return { sendToast };
}
