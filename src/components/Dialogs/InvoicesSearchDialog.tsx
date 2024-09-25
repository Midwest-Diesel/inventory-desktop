import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import { searchInvoices } from "@/scripts/controllers/invoicesController";


interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setInvoices: (invoices: Invoice[]) => void
}

export default function InvoicesSearchDialog({ open, setOpen, setInvoices }: Props) {
  const [id, setId] = useState('' as any);
  const [date, setDate] = useState('' as any);
  const [poNum, setPoNum] = useState('');

  const clearInputs = () => {
    setId('');
    setDate('');
    setPoNum('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const results = await searchInvoices({ id, date, poNum  }) as Invoice[];
    setInvoices(results);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Invoices Search"
      width={400}
      height={520}
      className="invoices-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Invoice ID"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={id}
          onChange={(e: any) => setId(e.target.value)}
        />

        {/* <Input
          label="Date"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          type="date"
          value={date}
          onChange={(e: any) => setDate(e.target.value)}
        /> */}

        {/* <Input
          label="Po Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={poNum}
          onChange={(e: any) => setPoNum(e.target.value)}
        /> */}

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
