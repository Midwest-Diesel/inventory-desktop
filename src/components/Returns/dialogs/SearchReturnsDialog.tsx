import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  onSearch: (search: ReturnSearch) => void
}

export interface ReturnSearch {
  id: number | null
  handwrittenId: number | null
  date: Date | null
  billToCompany: string
  progress: '' | 'shop' | 'accounting' | 'completed'
}


export default function SearchReturnsDialog({ open, setOpen, onSearch }: Props) {
  const [id, setId] = useState('');
  const [handwrittenId, setHandwrittenId] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [billToCompany, setBillToCompany] = useState('');
  const [progress, setProgress] = useState<'' | 'shop' | 'accounting' | 'completed'>('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const search = {
      id: Number(id) || null,
      handwrittenId: Number(handwrittenId) || null,
      date,
      billToCompany,
      progress
    };
    onSearch(search);
  };
  
  
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Search Returns"
      width={400}
    >
      <form onSubmit={onSubmit}>
        <Input
          label="Return ID"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={id}
          onChange={(e) => setId(e.target.value)}
          type="number"
        />

        <Input
          label="Handwritten ID"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={handwrittenId}
          onChange={(e) => setHandwrittenId(e.target.value)}
          type="number"
        />

        <Input
          label="Date"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={parseDateInputValue(date)}
          onChange={(e) => setDate(new Date(e.target.value))}
          type="date"
        />

        <Input
          label="Bill to Company"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={billToCompany}
          onChange={(e) => setBillToCompany(e.target.value)}
        />

        <Select
          label="Progress"
          variant={['label-space-between', 'label-inline']}
          value={progress}
          onChange={(e: any) => setProgress(e.target.value)}
        >
          <option value="">Any</option>
          <option value="shop">Shop</option>
          <option value="accounting">Accounting</option>
          <option value="completed">Completed</option>
        </Select>

        <div className="form__footer">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
