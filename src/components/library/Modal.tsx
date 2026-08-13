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
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const handleOutsideClick = (e: MouseEvent) => {
    if (e.target === ref.current && closeOnOutsideClick) {
      closeModal();
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (exitWithEsc && e.key === 'Escape') {
      closeModal();
    }
  };

  const closeModal = () => {
    if (setOpen) {
      setOpen(false);
    } else {
      onClose?.();
    }
  };
    

  return (
    <>
      {open &&
        <div className="modal__bg" ref={ref} style={{ zIndex: '40', position: 'fixed', top: 0, left: 0, height: '100%' }}>
          <dialog
            open={open}
            style={{ width, height }}
            {...parseClasses(classes)}
            {...props}
          >
            <h3 className="modal__title">{ title }</h3>
            { (showCloseBtn && onClose) && <Button variant={['X']} onClick={closeModal} data-testid="alert-close-btn">X</Button> }
            <div className="modal__content" style={{ maxHeight }}>
              { children }
            </div>
          </dialog>
        </div>
      }
    </>
  );
}
