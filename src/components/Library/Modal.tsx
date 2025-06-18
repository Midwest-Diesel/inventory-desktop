import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import React, { useEffect, useRef } from "react";
import Button from "./Button";

interface Props {
  children: React.ReactNode
  style?: any
  className?: string
  variant?: ('default')[]
  title?: string
  closeOnOutsideClick?: boolean
  exitWithEsc?: boolean
  showCloseBtn?: boolean
  width?: number
  height?: number
  maxHeight?: string
  open?: boolean
  setOpen?: (open: boolean) => void
  onClose?: () => void
}


export default function Modal({ children, className = '', variant = [], title, closeOnOutsideClick, exitWithEsc = true, showCloseBtn = true, width, height, maxHeight, open, setOpen, onClose, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const classes = generateClasses(className, variant, 'modal');

  useEffect(() => {
    bindEventListeners();
    document.querySelector('dialog')?.focus();
  }, []);

  const bindEventListeners = () => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target === (ref as any).current && closeOnOutsideClick) {
        closeModal();
      }
    };
  
    if (closeOnOutsideClick) {
      window.addEventListener('click', handleOutsideClick);
      return () => {
        window.removeEventListener('click', handleOutsideClick);
      };
    }
  };

  const closeModal = () => {
    if (setOpen) {
      setOpen(false);
    } else {
      if (onClose) onClose();
    }
  };
    

  return (
    <div className="modal__bg" ref={ref} style={{ zIndex: '40', position: 'absolute', top: 0, left: 0, height: '100%' }}>
      <dialog
        open={open}
        style={{ width: width, height: height }}
        onKeyDown={(e) => (exitWithEsc && e.key === 'Escape') && closeModal()}
        {...parseClasses(classes)}
        {...props}
      >
        <h3 className="modal__title">{ title }</h3>
        { showCloseBtn && <Button variant={["X"]} onClick={closeModal} data-testid="alert-close-btn">X</Button> }
        <div className="modal__content" style={{ maxHeight: maxHeight }}>
          { children }
        </div>
      </dialog>
    </div>
  );
}
