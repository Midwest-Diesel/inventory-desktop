import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import Modal from "./Modal";

interface Props {
  message: string
  onClose: () => void
}


export default function AlertMsg({ message, onClose }: Props) {
  return createPortal(
    <Modal
      style={{ backgroundColor: 'var(--red-3)' }}
      onClose={onClose}
      closeOnOutsideClick={true}
      exitWithEsc={true}
      open
    >
      <h2>{ message }</h2>
    </Modal>,
    document.body
  );
}

/* eslint-disable */
export function showAlertMsg(message: string) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const root = createRoot(container);

  function handleClose() {
    root.unmount();
    container.remove();
  }

  root.render(
    <AlertMsg message={message} onClose={handleClose} />
  );
}
