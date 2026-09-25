import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import React, { ReactNode, useEffect, useRef } from "react";
import Button from "./Button";

interface Props {
  children: ReactNode
  className?: string
  variant?: ('default')[]
  closeOnOutsideClick?: boolean
  exitWithEsc?: boolean
  hasCloseBtn?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
}


export default function MiniDialog({ children, className = '', variant = [], closeOnOutsideClick = true, exitWithEsc = true, hasCloseBtn = false, open, setOpen, ...props }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const classes = generateClasses(className, variant, 'mini-dialog');

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDialog();
      }
    };

    if (!closeOnOutsideClick) return;
    window.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open, closeOnOutsideClick]);

  const closeDialog = () => {
    if (setOpen) setOpen(false);
  };


  return (
    <dialog
      open={open}
      ref={ref}
      onKeyDown={(e) => (exitWithEsc && e.key === 'Escape') && closeDialog()}
      {...parseClasses(classes)}
      {...props}
    >
      { hasCloseBtn && <Button type="button" variant={['X']} onClick={closeDialog}>X</Button> }
      { children }
    </dialog>
  );
}
