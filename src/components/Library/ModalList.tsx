import { ReactElement, ReactNode, useState } from "react";

interface ModalListProps {
  children: ReactNode;
  initialPage?: number;
  onClose?: () => void;
}


export default function ModalList({ children, initialPage = 0, onClose }: ModalListProps) {
  const modals = Array.isArray(children) ? children : [children];
  const [page, setPage] = useState(initialPage);

  const next = () => {
    if (page === modals.length - 1) {
      close();
    } else {
      setPage((p) => (p + 1) % modals.length);
    }
  };

  const prev = () => {
    setPage((p) => (p - 1 + modals.length) % modals.length);
  };

  const close = () => {
    if (onClose) onClose();
  };


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
