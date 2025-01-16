import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import Select from "../Library/Select/Select";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  cores: Core[]
  setCores: (cores: Core[]) => void
}


export default function CoreSearchDialog({ open, setOpen, cores, setCores }: Props) {
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
    setCores(searchCores());
  };

  const searchCores  = () => {
    return cores.filter((core) => {
      if (
        (!partNum || partNum.includes('*') ? core.partNum.toUpperCase().includes(partNum.replace('*', '').toUpperCase()) : core.partNum.toUpperCase() === partNum.toUpperCase()) &&
        (!desc || desc.includes('*') ? core.desc.toUpperCase().includes(desc.replace('*', '').toUpperCase()) : core.desc.toUpperCase() === desc.toUpperCase()) &&
        (!priority || core.priority.toUpperCase() === priority) &&
        (!salesperson || salesperson.includes('*') ? core.initials.toUpperCase().includes(salesperson.replace('*', '').toUpperCase()) : core.initials.toUpperCase() === salesperson.toUpperCase())
      ) {
        return core;
      }
    });
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
