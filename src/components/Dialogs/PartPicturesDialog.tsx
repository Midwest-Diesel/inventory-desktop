import { useEffect, useState } from "react";
import Image from "next/image";
import Dialog from "../Library/Dialog";
import Loading from "../Library/Loading";

interface Picture {
  id: string;
  url: string;
  name: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  pictures: Picture[];
}


export default function PartPicturesDialog({ open, setOpen, pictures }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const filteredPictures = pictures.filter((pic) => pic.name !== 'Thumbs.db');

  useEffect(() => {
    if (pictures.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadedCount(0);
  }, [pictures]);

  useEffect(() => {
    if (loadedCount === filteredPictures.length) {
      setLoading(false);
    }
  }, [loadedCount, pictures]);

  const handleImageLoad = () => {
    setLoadedCount((count) => count + 1);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Part Pictures"
      width={600}
      height={520}
      className="part-pictures-dialog"
    >
      {filteredPictures.map((pic: Picture) => {
        return (
          <Image
            key={pic.id}
            src={pic.url}
            alt={pic.name}
            width={160}
            height={160}
            onLoad={handleImageLoad}
          />
        );
      })}
      { loading && <Loading /> }
    </Dialog>
  );
}
