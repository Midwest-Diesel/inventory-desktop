import Image from "next/image";
import Dialog from "../Library/Dialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  pictures: Picture[]
}


export default function StockNumPicturesDialog({ open, setOpen, pictures = [] }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Stock Part Pictures"
      width={600}
      height={520}
      className="part-pictures-dialog"
    >
      {pictures.map((pic: Picture, i) => {
        return (
          <Image
            key={i}
            src={`data:image/png;base64,${pic.url}`}
            alt={pic.name}
            width={160}
            height={160}
          />
        );
      })}
    </Dialog>
  );
}
