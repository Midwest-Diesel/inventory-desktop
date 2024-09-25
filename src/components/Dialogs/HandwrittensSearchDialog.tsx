import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import { searchHandwrittens } from "@/scripts/controllers/handwrittensController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setHandwrittens: (invoices: Handwritten[]) => void
}


export default function HandwrittensSearchDialog({ open, setOpen, setHandwrittens }: Props) {
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
    const results = await searchHandwrittens({ id, date, poNum  }) as Handwritten[];
    setHandwrittens(results);
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
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
