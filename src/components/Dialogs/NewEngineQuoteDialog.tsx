import { FormEvent, useEffect, useState } from "react";
import { addQuote } from "@/scripts/services/quotesService";
import { getCustomerByName } from "@/scripts/services/customerService";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import SourceSelect from "../Library/Select/SourceSelect";
import Button from "../Library/Button";
import { useToast } from "@/hooks/useToast";
import CustomerDropdown from "../Library/Dropdown/CustomerDropdown";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  engine: Engine | null
  onNewQuote: () => void
}


export default function NewEngineQuoteDialog({ open, setOpen, engine, onNewQuote }: Props) {
  const toast = useToast();
  const [source, setSource] = useState('');
  const [company, setCompany] = useState('');
  const [stockNum, setStockNum] = useState<string>(engine?.stockNum.toString() ?? '');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setStockNum(engine?.stockNum.toString() ?? '');
  }, [engine]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const customer = await getCustomerByName(company);
    if (!customer) return;
    const newQuote = {
      customerId: Number(customer.id),
      contact: null,
      date: new Date(),
      source,
      partNum: null,
      stockNum: Number(stockNum),
      desc,
      price: Number(price),
      notes,
      partId: null
    } as any;
    await addQuote(newQuote);
    resetInputs();
    onNewQuote();
    toast.sendToast('Created quote', 'success');
  };

  const resetInputs = () => {
    setSource('');
    setCompany('');
    setStockNum(engine?.stockNum.toString() ?? '');
    setDesc('');
    setPrice('');
    setNotes('');
    setOpen(false);
  };


  return (
    <>
      <Dialog
        open={open}
        setOpen={setOpen}
        title="New Engine Quote"
        maxHeight="44rem"
        width={500}
        data-testid="new-engine-quote-dialog"
      >
        <form onSubmit={(e)=> handleSubmit(e)}>
          <p><strong>Stock Number:</strong> <span date-testid="quote-stock-num">{ stockNum }</span></p>

          <SourceSelect
            label="Source"
            variant={['label-bold', 'label-stack']}
            value={source}
            onChange={(e: any) => setSource(e.target.value)}
          />
          
          <CustomerDropdown
            label="Customer"
            variant={['label-full-width', 'label-bold', 'no-margin', 'label-inline', 'label-stack']}
            maxHeight="25rem"
            value={company}
            onChange={(c: string) => setCompany(c)}
          />
          
          <br />
          <Input
            label="Description"
            variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
            value={desc}
            onChange={(e: any) => setDesc(e.target.value)}
            data-testid="desc"
          />

          <Input
            label="Price"
            variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
            value={price}
            onChange={(e: any) => setPrice(e.target.value)}
            type="number"
            step="any"
            required
            data-testid="price"
          />

          <Input
            label="Notes"
            variant={['label-stack', 'text-area', 'label-bold', 'label-stack', 'label-fit-content']}
            rows={5}
            cols={100}
            value={notes}
            onChange={(e: any) => setNotes(e.target.value)}
          />

          <div className="form__footer">
            <Button type="button" variant={['small']} onClick={resetInputs}>Cancel</Button>
            <Button type="submit" variant={['small']} data-testid="save-btn">Save</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
