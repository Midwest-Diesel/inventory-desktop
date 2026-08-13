import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../library/Dialog";
import Input from "../../library/Input";
import Button from "../../library/Button";
import { useAtom } from "jotai";
import { showSoldPartsAtom } from "@/scripts/atoms/state";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handleSearch: (searchData: PartSearchData) => Promise<void>
}


export default function PiggybackPartSearchDialog({ open, setOpen, handleSearch }: Props) {
  const [showSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [partNum, setPartNum] = useState('*');
  const [stockNum, setStockNum] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [qty, setQty] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rating, setRating] = useState('');
  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [hp, setHp] = useState('');

  useEffect(() => {
    document.getElementById('alt-part-search-input')?.focus();
  }, [open]);

  const clearInputs = () => {
    setPartNum('*');
    setStockNum('');
    setDesc('');
    setLocation('');
    setQty('');
    setRemarks('');
    setRating('');
    setPurchasedFrom('');
    setSerialNum('');
    setHp('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    await handleSearch({ partNum, stockNum, desc, location, qty: Number(qty), remarks, rating: Number(rating), purchasedFrom, serialNum, hp, showSoldParts });
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
          onChange={(e) => setPartNum(e.target.value.toUpperCase())}
          id="alt-part-search-input"
        />

        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e) => setStockNum(e.target.value)}
        />

        <Input
          label="Description"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <Input
          label="Location"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Input
          label="Qty"
          type="number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <Input
          label="Remarks"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <Input
          label="Rating"
          type="number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />

        <Input
          label="Purchased From"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={purchasedFrom}
          onChange={(e) => setPurchasedFrom(e.target.value)}
        />

        <Input
          label="Serial Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={serialNum}
          onChange={(e) => setSerialNum(e.target.value)}
        />

        <Input
          label="HP"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
