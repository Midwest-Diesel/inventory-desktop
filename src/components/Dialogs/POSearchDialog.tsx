import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import Select from "../Library/Select/Select";
import { useAtom } from "jotai";
import { POSearchAtom } from "@/scripts/atoms/state";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  limit: number
  page: number
}


export default function POSearchDialog({ open, setOpen, limit, page }: Props) {
  const [, setSearchData] = useAtom(POSearchAtom);
  const [poNum, setPoNum] = useState<number>('' as any);
  const [date, setDate] = useState<Date | null>(null);
  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [purchasedFor, setPurchasedFor] = useState('');
  const [isItemReceived, setIsItemReceived] = useState<'' | 'TRUE' | 'FALSE'>('');
  const [orderedBy, setOrderedBy] = useState('');

  const clearInputs = () => {
    setPoNum('' as any);
    setDate(null);
    setPurchasedFrom('');
    setPurchasedFor('');
    setIsItemReceived('');
    setOrderedBy('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const searchData = {
      poNum: Number(poNum),
      date: parseDateInputValue(date),
      purchasedFrom,
      purchasedFor,
      isItemReceived,
      orderedBy,
      limit,
      offset: (page - 1) * limit
    };
    setSearchData(searchData);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="PO Search"
      width={400}
      height={400}
    >
      <form onSubmit={handleSubmit}>
        <Input
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          label="PO Number"
          value={poNum}
          onChange={(e: any) => setPoNum(e.target.value)}
          type="number"
        />

        <Input
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          label="Date"
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          type="date"
        />

        <Input
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          label="Purchased From"
          value={purchasedFrom}
          onChange={(e: any) => setPurchasedFrom(e.target.value)}
        />

        <Input
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          label="Purchased For"
          value={purchasedFor}
          onChange={(e: any) => setPurchasedFor(e.target.value)}
        />

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Is Item Received"
          value={isItemReceived}
          onChange={(e: any) => setIsItemReceived(e.target.value)}
        >
          <option value="">Both</option>
          <option value="TRUE">True</option>
          <option value="FALSE">False</option>
        </Select>

        <Input
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          label="Ordered By"
          value={orderedBy}
          onChange={(e: any) => setOrderedBy(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
