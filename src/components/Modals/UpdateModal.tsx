import Modal from "../Library/Modal";
import Button from "../Library/Button";
import { invoke } from "@tauri-apps/api/tauri";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function UpdateModal({ open, setOpen }: Props) {
  const handleUpdate = () => {
    invoke('install_update');
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('showUpdate', 'false');
  };


  return (
    <>
      {open && localStorage.getItem('showUpdate') !== 'false' &&
        <Modal
          open
          title="Update Available"
          closeOnOutsideClick={false}
          exitWithEsc={false}
          onClose={handleClose}
        >
          <div className="form__footer">
            <Button onClick={handleUpdate}>Install and restart</Button>
          </div>
        </Modal>
      }
    </>
  );
}
