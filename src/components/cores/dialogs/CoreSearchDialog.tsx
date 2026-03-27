import { FormEvent, useEffect, useState } from "react";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Button from "@/components/library/Button";
import Select from "@/components/library/select/Select";
import { ask } from "@/scripts/config/tauri";
import { getCustomerById } from "@/scripts/services/customerService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  onSearch: (search: CoreSearch) => void
}

export interface CoreSearch {
  partNum: string
  billToCompany: string
  desc: string
  priority: string
  salesperson: string
}


export default function CoreSearchDialog({ open, setOpen, onSearch }: Props) {
  const [partNum, setPartNum] = useState('');
  const [billToCompany, setBillToCompany] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'' | 'HIGH' | 'LOW'>('');
  const [salesperson, setSalesperson] = useState('');
  const selectedCustomerId = localStorage.getItem('customerId');

  useEffect(() => {
    const init = async () => {
      if (!selectedCustomerId) return;
      const customer = await getCustomerById(Number(selectedCustomerId));
      if (customer && await ask(`Filter cores for ${customer.company}`)) {
        onSearch({ partNum, billToCompany: customer.company ?? '', desc, priority, salesperson });
      }
    };
    init();
  }, []);

  const clearInputs = () => {
    setPartNum('');
    setBillToCompany('');
    setDesc('');
    setPriority('');
    setSalesperson('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ partNum, billToCompany, desc, priority, salesperson });
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Cores Search"
      width={400}
      y={-250}
      className="cores-search-dialog"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum}
          onChange={(e) => setPartNum(e.target.value)}
        />

        <Input
          label="Bill To Company"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={billToCompany}
          onChange={(e) => setBillToCompany(e.target.value)}
        />

        <Input
          label="Description"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
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
          onChange={(e) => setSalesperson(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
