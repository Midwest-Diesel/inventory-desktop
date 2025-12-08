import { FormEvent, useState } from "react";
import Dialog from "@/components/library/Dialog";
import Button from "@/components/library/Button";
import Input from "@/components/library/Input";
import { parseDateInputValue, parseResDate } from "@/scripts/tools/stringUtils";
import { addSurplus } from "@/scripts/services/surplusService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  refetch: () => void
}


export default function NewSurplusPartDialog({ open, setOpen, refetch }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newSurplus = {
      code,
      name,
      price: Number(price),
      date: parseResDate(parseDateInputValue(date)),
      notes: null
    } as Surplus;
    await addSurplus(newSurplus);
    refetch();
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="New Surplus Part"
      width={400}
      maxHeight={'400px'}
      className="new-surplus-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Code"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <Input
          label="Name"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Price"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          type="number"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <Input
          label="Purchase Date"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          type="date"
          required
        />

        <div className="form__footer">
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
