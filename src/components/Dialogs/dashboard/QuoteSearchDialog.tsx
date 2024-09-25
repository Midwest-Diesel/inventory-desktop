import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Dropdown from "../../Library/Dropdown/Dropdown";
import { searchQuotes } from "@/scripts/controllers/quotesController";
import Button from "../../Library/Button";


interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  setQuotes: (quotes: Quote[]) => void;
}

export default function QuoteSearchDialog({ open, setOpen, setQuotes }: Props) {
  const [id, setid] = useState<number | string>('');
  const [date, setDate] = useState<Date>('' as any);
  const [salesman, setSalesman] = useState<Date>('' as any);
  const [source, setSource] = useState<string>('');
  const [customer, setCustomer] = useState<Customer>('' as any);
  const [contact, setContact] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [partNumber, setPartNumber] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [stockNumber, setStockNumber] = useState<string>('');
  const [sale, setSale] = useState<string>('');

  useEffect(() => {
    clearInputs();
  }, [open]);

  const clearInputs = () => {
    setid('');
    setDate('' as any);
    setSalesman('' as any);
    setSource('');
    setCustomer('' as any);
    setContact('');
    setState('');
    setPartNumber('');
    setDesc('');
    setStockNumber('');
    setSale('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setQuotes(await searchQuotes({ partNum: partNumber, desc: desc, stockNum: stockNumber }));
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Quote Search"
      width={400}
      height={520}
      className="quote-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Part Number"
          type="string"
          variant={['x-small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNumber}
          onChange={(e: any) => setPartNumber(e.target.value)}
        />

        <Input
          label="Description"
          type="string"
          variant={['x-small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e: any) => setDesc(e.target.value)}
        />

        <Input
          label="Stock Number"
          type="string"
          variant={['x-small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNumber}
          onChange={(e: any) => setStockNumber(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
