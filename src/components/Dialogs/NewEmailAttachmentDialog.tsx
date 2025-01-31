import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import { invoke } from "@/scripts/config/tauri";
import { addEmailStuffItem, getAllEmailStuff } from "@/scripts/controllers/emailStuffController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setEmailStuff: (data: EmailStuff[]) => void
}


export default function NewEmailAttachmentDialog({ open, setOpen, setEmailStuff }: Props) {
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const clearInputs = () => {
    setName('');
    setFiles([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newFiles = await Promise.all(Array.from(files).map((f) => {
      return new Promise<{ name: string; data: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result?.toString().split(',')[1];
          resolve({
            name: f.name,
            data: base64Data || ''
          });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(f);
      });
    }));

    const fileUpload = {
      name,
      files: newFiles,
      is_multifile: newFiles.length > 1
    };
    await invoke('upload_email_stuff_files', { fileUpload });
    const fileString = newFiles.map((f) => {
      if (newFiles.length > 1) {
        return `\\\\MWD1-SERVER/Server/EmailAttachments/${name}/${f.name}`;
      } else {
        return `\\\\MWD1-SERVER/Server/EmailAttachments/${f.name}`;
      }
    }).join(', ');
    await addEmailStuffItem({ name, images: fileString });
    clearInputs();
    setOpen(false);

    const res = await getAllEmailStuff();
    setEmailStuff(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="New Attachment"
      width={400}
      height={520}
      className="Handwrittens-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Name"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          required
        />
        <Input
          label="Files"
          type="file"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          onChange={(e: any) => setFiles(e.target.files)}
          multiple
          required
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
