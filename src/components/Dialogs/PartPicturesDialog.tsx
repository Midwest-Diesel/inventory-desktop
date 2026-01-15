import { useEffect, useState } from "react";
import Dialog from "../library/Dialog";
import Checkbox from "../library/Checkbox";
import Button from "../library/Button";
import { invoke } from "@/scripts/config/tauri";
import Loading from "../library/Loading";

interface Picture {
  url: string
  name: string
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  pictures: Picture[]
  partNum: string
}


export default function PartPicturesDialog({ open, setOpen, pictures, partNum }: Props) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const DIRECTORY = `\\\\MWD1-SERVER\\Server\\Pictures\\parts_dir\\${partNum}`;

  useEffect(() => {
    if (!open) return;
    setSelectedImages([]);
  }, [open, partNum]);

  const editSelectedImages = (checked: boolean, name: string) => {
    if (checked) { 
      setSelectedImages([...selectedImages, name]);
    } else {
      setSelectedImages(selectedImages.filter((pic) => pic !== name));
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
      title="Part Pictures"
      width={650}
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
              src={`data:image/png;base64,${pic.url}`}
              alt={pic.name}
              width={240}
              height={240}
            />

            <Checkbox
              variant={['label-fit', 'dark-bg']}
              checked={selectedImages.includes(pic.name)}
              onChange={(e: any) => editSelectedImages(e.target.checked, pic.name)}
            />
          </div>
        );
      })}
    </Dialog>
  );
}
