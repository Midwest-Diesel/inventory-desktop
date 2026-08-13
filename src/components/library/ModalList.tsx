import { ReactElement, ReactNode, useMemo, useState } from "react";

interface ModalListProps {
  children: ReactNode;
  initialPage?: number;
  onClose?: () => void;
}


export default function ModalList({ children, initialPage = 0, onClose }: ModalListProps) {
  const allModals = Array.isArray(children) ? children : [children];
  const modals = useMemo(() => {
    return allModals.filter(
      (child): child is ReactElement =>
        Boolean(child) && (child as ReactElement).props?.open !== false
    );
  }, [allModals]);
  
  const [page, setPage] = useState(initialPage);

  const next = () => {
    if (page >= modals.length - 1) {
      close();
    } else {
      setPage((p) => p + 1);
    }
  };

  const prev = () => {
    setPage((p) => Math.max(0, p - 1));
  };

  const close = () => {
    onClose?.();
  };


  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((child, i) => {
        if (!child) return null;

        return (
          <child.type
            {...(child as ReactElement<any>).props}
            key={i}
            open={page === i}
            onNext={next}
            onPrev={page > 0 && prev}
            onClose={close}
          />
        );
      })}
    </>
  );
}
