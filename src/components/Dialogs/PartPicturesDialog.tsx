import { useEffect, useState } from "react";
import Dialog from "../Library/Dialog";
import Checkbox from "../Library/Checkbox";
import Button from "../Library/Button";
import { invoke } from "@/scripts/config/tauri";

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

  useEffect(() => {
    if (!open) return;
    setSelectedImages(pictures.map((pic) => pic.name));
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
      attachments: pictures.filter((pic) => selectedImages.includes(pic.name)).map((pic) => `\\\\MWD1-SERVER/Server/Pictures/parts_dir/${partNum}/${pic.name}`)
    };
    await invoke('new_email_draft', { emailArgs: args });
  };

  const handleAttachEmail = async () => {
    const attachments = pictures.filter((pic) => selectedImages.includes(pic.name)).map((pic) => `\\\\MWD1-SERVER/Server/Pictures/parts_dir/${partNum}/${pic.name}`).join(';');
    await invoke('attach_to_existing_email', { attachments });
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
