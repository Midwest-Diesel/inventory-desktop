import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Button from "../Library/Button";
import Input from "../Library/Input";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { addSurplus, getAllSurplus } from "@/scripts/controllers/surplusController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setSurplus: (surplus: Surplus[]) => void
}


export default function NewSurplusPartDialog({ open, setOpen, setSurplus }: Props) {
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
      date,
      notes: null,
    } as Surplus;
    await addSurplus(newSurplus);
    setSurplus(await getAllSurplus());
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
          onChange={(e: any) => setCode(e.target.value)}
          required
        />

        <Input
          label="Name"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          required
        />

        <Input
          label="Price"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          type="number"
          value={price}
          onChange={(e: any) => setPrice(e.target.value)}
          required
        />

        <Input
          label="Purchase Date"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          type="date"
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          required
        />

        <div className="form__footer">
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
