import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import Input from "@/components/library/Input";
import Loading from "@/components/library/Loading";
import { invoke } from "@/scripts/config/tauri";
import { FormEvent, useState } from "react";


export default function ImageUpload() {
  const [partImages, setPartImages] = useState<File[]>([]);
  const [stockNumImages, setStockNumImages] = useState<File[]>([]);
  const [engineNumImages, setEngineNumImages] = useState<File[]>([]);
  const [partImagesName, setPartImagesName] = useState('');
  const [stockNumImagesName, setStockNumImagesName] = useState('');
  const [engineNumImagesName, setEngineNumImagesName] = useState('');
  const [isUploadingParts, setIsUploadingParts] = useState(false);
  const [isUploadingStockNums, setIsUploadingStockNums] = useState(false);
  const [isUploadingEngineNums, setIsUploadingEngineNums] = useState(false);

  const uploadImages = async (e: FormEvent, images: File[], dir: string, setLoading: (v: boolean) => void, clear: () => void) => {
    e.preventDefault();
    setLoading(true);

    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer();
      const content = Array.from(new Uint8Array(arrayBuffer));
      await invoke('upload_file', { fileArgs: { file: content, dir, name: image.name }});
    }
    
    clear();
    setLoading(false);
  };

  const clearPartsInput = () => {
    setPartImages([]);
    setPartImagesName('');
    setIsUploadingParts(false);
  };

  const clearStockNumInput = () => {
    setStockNumImages([]);
    setStockNumImagesName('');
    setIsUploadingStockNums(false);
  };

  const clearEnginesInput = () => {
    setEngineNumImages([]);
    setEngineNumImagesName('');
    setIsUploadingEngineNums(false);
  };


  return (
    <Layout title="Image Upload">
      <div className="image-upload">
        {isUploadingParts ?
          <Loading />
          :
          <form onSubmit={(e) => uploadImages(e, partImages, `\\\\MWD1-SERVER/Server/Pictures/parts_dir/${partImagesName}`, setIsUploadingParts, clearPartsInput)}>
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
              onChange={(e) => setPartImages(e.target.files ? Array.from(e.target.files) : [])}
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
          <form onSubmit={(e) => uploadImages(e, stockNumImages, `\\\\MWD1-SERVER/Server/Pictures/sn_specific/${stockNumImagesName}`, setIsUploadingStockNums, clearStockNumInput)}>
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
              onChange={(e) => setStockNumImages(e.target.files ? Array.from(e.target.files) : [])}
              type="file"
              accept="image/*"
              multiple
              required
            />
            <Button type="submit">Upload</Button>
          </form>
        }

        {isUploadingEngineNums ?
          <Loading />
          :
          <form onSubmit={(e) => uploadImages(e, engineNumImages, `\\\\MWD1-SERVER/Server/Engines Pictures/StockPhotos/${engineNumImagesName}`, setIsUploadingEngineNums, clearEnginesInput)}>
            <h2>Upload For Engine Numbers</h2>
            <Input
              labelClass="image-upload__name-input"
              label="Folder Name"
              variant={['small', 'thin', 'label-stack', 'label-fit-content']}
              value={engineNumImagesName}
              onChange={(e: any) => setEngineNumImagesName(e.target.value)}
              required
            />
            <Input
              onChange={(e) => setEngineNumImages(e.target.files ? Array.from(e.target.files) : [])}
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
