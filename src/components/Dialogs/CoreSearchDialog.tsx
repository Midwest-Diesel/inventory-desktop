import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  cores: Core[]
  setCores: (cores: Core[]) => void
}


export default function CoreSearchDialog({ open, setOpen, cores, setCores }: Props) {
  const [partNum, setPartNum] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('');
  const [salesperson, setSalesperson] = useState('');

  const clearInputs = () => {
    setPartNum('');
    setDesc('');
    setPriority('');
    setSalesperson('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const results = searchCores();
    setCores(results);
  };

  const searchCores  = () => {
    if (!partNum && !desc && !priority && !salesperson) return cores;
    if (partNum.includes('*')) {
      return cores.filter((core: Core) => core.partNum.includes(partNum.replace('*', '')));
    } else {
      return cores.filter((core: Core) => core.partNum.toString() === partNum);
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Cores Search"
      width={350}
      height={200}
      y={-250}
      className="cores-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
