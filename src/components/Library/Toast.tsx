import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import { useEffect, useRef } from "react";

interface Props {
  msg: string
  className?: string
  variant?: ('default')[]
  type: 'error' | 'success' | 'warning' | 'info' | 'none'
  open: boolean
  setOpen: (open: boolean) => void
  duration?: number
}

export default function Toast({ msg, className = '', variant = [], type, open, setOpen, duration = 4000, ...props }: Props) {
  const classes = generateClasses(className, variant, 'toast');
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (open) handleOpened();
  }, [open]);

  const handleOpened = () => {
    if (!ref.current) return;
    ref.current.innerHTML = msg;
    setTimeout(() => {
      setOpen(false);
    }, duration);
  };


  return (
    <>
      {open &&
        <div
          {...parseClasses(classes)}
          {...props}
        >
          { type !== 'none' && <object data={`/images/notifications/${type}.svg`} className={`toast__icon--${type}`} width={65} height={65}></object> }
          <p ref={ref}>{ msg }</p>
        </div>
      }
    </>
  );
}
