import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { searchAltParts } from "@/scripts/controllers/partsController";
import { showSoldPartsAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";


interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setParts: (parts: Part[]) => void
  setLoading: (loading: boolean) => void
}

export default function PiggybackPartSearchDialog({ open, setOpen, setParts, setLoading }: Props) {
  const [showSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [partNum, setPartNum] = useState('*');
  const [stockNum, setStockNum] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [qty, setQty] = useState('' as any);
  const [remarks, setRemarks] = useState('');
  const [rating, setRating] = useState<number>('' as any);
  const [purchasedFrom, setPurchasedFrom] = useState('');

  useEffect(() => {
    document.getElementById('alt-part-search-input').focus();
  }, [open]);


  const clearInputs = () => {
    setPartNum('*');
    setStockNum('');
    setDesc('');
    setLocation('');
    setQty('' as any);
    setRemarks('');
    setRating('' as any);
    setPurchasedFrom('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    await handleSearch(partNum);
  };

  const handleSearch = async (partNum: string) => {
    setLoading(true);
    const results = await searchAltParts({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, showSoldParts }) as Part[];
    setParts(results);
    setLoading(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Alternate Parts Search"
      width={400}
      height={520}
      className="parts-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Alternate Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value.toUpperCase())}
          id="alt-part-search-input"
        />

        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e: any) => setStockNum(e.target.value)}
        />

        <Input
          label="Description"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e: any) => setDesc(e.target.value)}
        />

        <Input
          label="Location"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={location}
          onChange={(e: any) => setLocation(e.target.value)}
        />

        <Input
          label="Qty"
          type="number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={qty}
          onChange={(e: any) => setQty(e.target.value)}
        />

        <Input
          label="Remarks"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={remarks}
          onChange={(e: any) => setRemarks(e.target.value)}
        />

        <Input
          label="Rating"
          type="number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={rating}
          onChange={(e: any) => setRating(e.target.value)}
        />

        <Input
          label="Purchased From"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={purchasedFrom}
          onChange={(e: any) => setPurchasedFrom(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
