import Image from "next/image";
import Dialog from "../Library/Dialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  pictures: Picture[]
}


export default function PartPicturesDialog({ open, setOpen, pictures }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Part Pictures"
      width={600}
      height={520}
      className="part-pictures-dialog"
    >
      {pictures.map((pic: Picture) => {
        if (pic.name === 'Thumbs.db') return;
        return (
          <Image key={pic.id} src={pic.url} alt={pic.name} width={160} height={160} />
        );
      })}
    </Dialog>
  );
}
