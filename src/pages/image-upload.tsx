import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Input from "@/components/Library/Input";
import Loading from "@/components/Library/Loading";
import { invoke } from "@/scripts/config/tauri";
import { FormEvent, useState } from "react";


export default function ImageUpload() {
  const [partImages, setPartImages] = useState<File[]>(null);
  const [stockNumImages, setStockNumImages] = useState<File[]>(null);
  const [partImagesName, setPartImagesName] = useState('');
  const [stockNumImagesName, setStockNumImagesName] = useState('');
  const [isUploadingParts, setIsUploadingParts] = useState(false);
  const [isUploadingStockNums, setIsUploadingStockNums] = useState(false);

  const handleUploadPart = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploadingParts(true);
    for (const image of partImages) {
      const arrayBuffer = await image.arrayBuffer();
      const content = Array.from(new Uint8Array(arrayBuffer));
      await invoke('upload_file', { fileArgs: { file: content, dir: `\\\\MWD1-SERVER/Server/Pictures/parts_dir/${partImagesName}`, name: image.name }});
    }
    setPartImages(null);
    setPartImagesName('');
    setIsUploadingParts(false);
  };

  const handleUploadStockNum = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploadingStockNums(true);
    for (const image of stockNumImages) {
      const arrayBuffer = await image.arrayBuffer();
      const content = Array.from(new Uint8Array(arrayBuffer));
      await invoke('upload_file', { fileArgs: { file: content, dir: `\\\\MWD1-SERVER/Server/Pictures/sn_specific/${stockNumImagesName}`, name: image.name }});
    }
    setStockNumImages(null);
    setStockNumImagesName('');
    setIsUploadingStockNums(false);
  };


  return (
    <Layout title="Image Upload">
      <div className="image-upload">
        {isUploadingParts ?
          <Loading />
          :
          <form onSubmit={(e) => handleUploadPart(e)}>
            <h2>Upload For Part Numbers</h2>
            <Input
              labelClass="image-upload__name-input"
              label="Folder Name"
              variant={['small', 'thin', 'label-stack', 'label-fit-content']}
              value={partImagesName}
              onChange={(e: any) => setPartImagesName(e.target.value)}
              required
            />
            <Input
              onChange={(e: any) => setPartImages(e.target.files)}
              type="file"
              accept="image/*"
              multiple
              required
            />
            <Button type="submit">Upload</Button>
          </form>
        }

        {isUploadingStockNums ?
          <Loading />
          :
          <form onSubmit={(e) => handleUploadStockNum(e)}>
            <h2>Upload For Stock Numbers</h2>
            <Input
              labelClass="image-upload__name-input"
              label="Folder Name"
              variant={['small', 'thin', 'label-stack', 'label-fit-content']}
              value={stockNumImagesName}
              onChange={(e: any) => setStockNumImagesName(e.target.value)}
              required
            />
            <Input
              onChange={(e: any) => setStockNumImages(e.target.files)}
              type="file"
              accept="image/*"
              multiple
              required
            />
            <Button type="submit">Upload</Button>
          </form>
        }
      </div>
    </Layout>
  );
}
