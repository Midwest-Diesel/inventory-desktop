import { FormEvent, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { searchHandwrittens } from "@/scripts/controllers/handwrittensController";
import Select from "@/components/Library/Select/Select";
import { paymentTypes } from "@/pages/handwrittens/index";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import SourceSelect from "@/components/Library/Select/SourceSelect";
import { useAtom } from "jotai";
import { handwrittenSearchAtom } from "@/scripts/atoms/state";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setHandwrittens: (invoices: Handwritten[]) => void
  setMinItems: (minItems: number[]) => void
  limit: number
}


export default function HandwrittensSearchDialog({ open, setOpen, setHandwrittens, setMinItems, limit }: Props) {
  const [handwrittenSearchData, setHandwrittenSearchData] = useAtom(handwrittenSearchAtom);
  const [id, setId] = useState<number>('' as any);
  const [date, setDate] = useState<Date | null>(null);
  const [poNum, setPoNum] = useState('');
  const [billToCompany, setBillToCompany] = useState('');
  const [shipToCompany, setShipToCompany] = useState('');
  const [source, setSource] = useState('');
  const [payment, setPayment] = useState('');

  const clearInputs = () => {
    setId('' as any);
    setDate(null);
    setPoNum('');
    setBillToCompany('');
    setShipToCompany('');
    setSource('');
    setPayment('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const searchData = {
      id: id ? Number(id) : id,
      date: parseDateInputValue(date),
      poNum,
      billToCompany,
      shipToCompany,
      source,
      payment,
      limit,
      offset: 0
    };
    const res = await searchHandwrittens(searchData);
    setHandwrittens(res?.rows);
    setMinItems(res?.minItems);
    setHandwrittenSearchData(searchData);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Handwrittens Search"
      width={400}
      height={520}
      className="Handwrittens-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Handwritten ID"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={id}
          onChange={(e: any) => setId(e.target.value)}
          type="number"
        />

        <Input
          label="Date"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          type="date"
        />

        <Input
          label="Bill to Company"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={billToCompany}
          onChange={(e: any) => setBillToCompany(e.target.value)}
        />

        <Input
          label="Ship to Company"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={shipToCompany}
          onChange={(e: any) => setShipToCompany(e.target.value)}
        />

        <Input
          label="PO Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={poNum}
          onChange={(e: any) => setPoNum(e.target.value)}
        />

        <SourceSelect
          variant={['label-space-between', 'label-inline']}
          label="Source"
          value={source}
          onChange={(e: any) => setSource(e.target.value)}
        />

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Payment"
          value={payment}
          onChange={(e: any) => setPayment(e.target.value)}
        >
          <option value="">-- SELECT PAYMENT TYPE --</option>
          {paymentTypes.map((type, i) => {
            return <option key={i}>{ type }</option>;
          })}
        </Select>

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
