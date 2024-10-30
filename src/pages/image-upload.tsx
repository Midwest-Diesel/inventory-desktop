import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Input from "@/components/Library/Input";
import Loading from "@/components/Library/Loading";
import { FormEvent, useState } from "react";

export default function ImageUpload() {
  const [partImages, setPartImages] = useState<File[]>(null);
  const [stockNumImages, setStockNumImages] = useState<File[]>(null);
  const [partImagesNames, setPartImagesNames] = useState('');
  const [stockNumImagesNames, setStockNumImagesNames] = useState('');
  const [isUploadingParts, setIsUploadingParts] = useState(false);
  const [isUploadingStockNums, setIsUploadingStockNums] = useState(false);

  const handleUploadPart = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploadingParts(true);
    for (const image of partImages) {
      // await addImageToSupabase('parts', `${partImagesNames}/${image.name}`, image);
    }
    setPartImages(null);
    setPartImagesNames('');
    setIsUploadingParts(false);
  };

  const handleUploadStockNum = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploadingStockNums(true);
    for (const image of stockNumImages) {
      // await addImageToSupabase('stockNum', `${stockNumImagesNames}/${image.name}`, image);
    }
    setStockNumImages(null);
    setStockNumImagesNames('');
    setIsUploadingStockNums(false);
  };


  return (
    <Layout title="Image Upload">
      {/* <button onClick={() => uploadFiles()}>Upload Photos</button> */}
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
              value={partImagesNames}
              onChange={(e: any) => setPartImagesNames(e.target.value)}
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
              value={stockNumImagesNames}
              onChange={(e: any) => setStockNumImagesNames(e.target.value)}
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
