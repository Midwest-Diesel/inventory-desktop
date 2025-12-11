import Dialog from "../library/Dialog";
import Checkbox from "../library/Checkbox";
import { useEffect, useState } from "react";
import { invoke } from "@/scripts/config/tauri";
import Button from "../library/Button";
import Loading from "../library/Loading";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  pictures: Picture[]
  stockNum: string | null
}


export default function StockNumPicturesDialog({ open, setOpen, pictures = [], stockNum }: Props) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const DIRECTORY = `\\\\MWD1-SERVER\\Server\\Pictures\\sn_specific\\${stockNum}`;

  useEffect(() => {
    if (!open) return;
    setSelectedImages(pictures.map((pic) => pic.name));
  }, [open, stockNum]);

  const editSelectedImages = (checked: boolean, name: string) => {
    if (checked) { 
      setSelectedImages([...selectedImages, name]);
    } else {
      setSelectedImages(selectedImages.filter((i) => i !== name));
    }
  };

  const handleNewEmail = async () => {
    const args = {
      subject: 'Part Pictures',
      body: '',
      recipients: [],
      attachments: pictures.filter((pic) => selectedImages.includes(pic.name)).map((pic) => `${DIRECTORY}/${pic.name}`)
    };
    await invoke('new_email_draft', { emailArgs: args });
  };

  const handleAttachEmail = async () => {
    const attachments = pictures.filter((pic) => selectedImages.includes(pic.name)).map((pic) => `${DIRECTORY}/${pic.name}`).join(';');
    await invoke('attach_to_existing_email', { attachments });
  };

  const openFolder = async () => {
    await invoke('view_file', { filepath: DIRECTORY });
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Stock Part Pictures"
      width={600}
      height={520}
      className="part-pictures-dialog"
    >
      <Button onClick={handleNewEmail}>Add to New Email</Button>
      <Button onClick={handleAttachEmail}>Attach to Existing Email</Button>
      <Button onClick={openFolder}>Open Folder</Button>

      { pictures.length === 0 && <Loading /> }
      {pictures.map((pic: Picture, i) => {
        return (
          <div key={i} className="part-pictures-dialog__img-container">
            <img
              key={i}
              src={`data:image/png;base64,${pic.url}`}
              alt={pic.name}
              width={240}
              height={240}
            />

            <Checkbox
              variant={['label-fit']}
              checked={selectedImages.includes(pic.name)}
              onChange={(e: any) => editSelectedImages(e.target.checked, pic.name)}
            />
          </div>
        );
      })}
    </Dialog>
  );
}
