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


  return (
    <>
      {open &&
        <Modal
          open
          setOpen={setOpen}
          title="Update Available"
          closeOnOutsideClick={false}
          exitWithEsc={false}
          showCloseBtn={false}
        >
          <div className="form__footer">
            <Button onClick={handleUpdate}>Install and restart</Button>
          </div>
        </Modal>
      }
    </>
  );
}
