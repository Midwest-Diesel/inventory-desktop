import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import UserSelect from "@/components/library/select/UserSelect";
import { EngineQuoteSearchData } from "@/scripts/services/quotesService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { FormEvent, useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  onSearch: (data: EngineQuoteSearchData) => void
}


export default function EngineQuoteSearchDialog({ open, setOpen, onSearch }: Props) {
  const [date, setDate] = useState<Date | null>(null);
  const [salesmanId, setSalesmanId] = useState<number | null>(null);
  const [source, setSource] = useState('');
  const [customer, setCustomer] = useState('');
  const [contact, setContact] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [desc, setDesc] = useState('');
  const [stockNum, setStockNum] = useState('');
  const [sale, setSale] = useState<'' | 'TRUE' | 'FALSE'>('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      date: parseDateInputValue(date),
      salesmanId,
      source,
      customer,
      contact,
      serialNum,
      desc,
      stockNum,
      sale
    } as EngineQuoteSearchData;
    onSearch(data);
  };

  const clearInputs = () => {
    setDate(null);
    setSalesmanId(null);
    setSource('');
    setCustomer('');
    setContact('');
    setSerialNum('');
    setDesc('');
    setStockNum('');
    setSale('');
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Engine Quotes Search"
      width={400}
    >
      <form onSubmit={onSubmit}>
        <Input
          label="Date"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={parseDateInputValue(date)}
          onChange={(e) => setDate(new Date(e.target.value))}
          type="date"
        />

        <UserSelect
          label="Salesman"
          variant={['label-space-between', 'label-inline']}
          value={salesmanId ?? ''}
          onChange={(e) => setSalesmanId(Number(e.target.value))}
          userSubtype="sales"
        />

        <Input
          label="Source"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <Input
          label="Customer"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />

        <Input
          label="Contact"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <Input
          label="Serial Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={serialNum}
          onChange={(e) => setSerialNum(e.target.value)}
        />

        <Input
          label="Description"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e) => setStockNum(e.target.value)}
        />

        <Select
          label="Sale"
          variant={['label-space-between', 'label-inline']}
          value={sale}
          onChange={(e: any) => setSale(e.target.value)}
        >
          <option value="">Both</option>
          <option value="TRUE">True</option>
          <option value="FALSE">False</option>
        </Select>

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
