import Modal from "../Library/Modal";
import Button from "../Library/Button";
import { invoke } from "@/scripts/config/tauri";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  notes: string
}


export default function UpdateModal({ open, setOpen, notes }: Props) {
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
          style={{ maxWidth: '18rem' }}
          closeOnOutsideClick={false}
          exitWithEsc={false}
          onClose={handleClose}
        >
          <div className="form__footer">
            <Button onClick={handleUpdate}>Install and restart</Button>
          </div>

          {notes &&
            <div style={{ marginTop: '1rem', textAlign: 'start' }}>
              <h6>Notable Changes</h6>
              <p>{ notes }</p>
            </div>
          }
        </Modal>
      }
    </>
  );
}
