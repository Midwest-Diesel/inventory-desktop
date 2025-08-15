import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import Select from "../Library/Select/Select";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  onSearch: (search: CoreSearch) => void
}

export interface CoreSearch {
  partNum: string
  desc: string
  priority: string
  salesperson: string
}


export default function CoreSearchDialog({ open, setOpen, onSearch }: Props) {
  const [partNum, setPartNum] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'' | 'HIGH' | 'LOW'>('');
  const [salesperson, setSalesperson] = useState('');

  const clearInputs = () => {
    setPartNum('');
    setDesc('');
    setPriority('');
    setSalesperson('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ partNum, desc, priority, salesperson });
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Cores Search"
      width={350}
      height={280}
      y={-250}
      className="cores-search-dialog"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
        />

        <Input
          label="Description"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e: any) => setDesc(e.target.value)}
        />

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Priority"
          value={priority}
          onChange={(e: any) => setPriority(e.target.value)}
        >
          <option value="">Both</option>
          <option value="HIGH">High</option>
          <option value="LOW">Low</option>
        </Select>

        <Input
          label="Salesperson"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={salesperson}
          onChange={(e: any) => setSalesperson(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
