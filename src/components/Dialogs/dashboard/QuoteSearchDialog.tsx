import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import { searchQuotes } from "@/scripts/services/quotesService";
import Button from "../../Library/Button";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import SourceSelect from "@/components/Library/Select/SourceSelect";
import Select from "@/components/Library/Select/Select";
import UserSelect from "@/components/Library/Select/UserSelect";
import { isObjectNull } from "@/scripts/tools/utils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setQuotes: (quotes: Quote[]) => void
  setCount: (pageCount: number) => void
  filterByCustomer: boolean
  searchData: any
  setSearchData: (data: any) => void
  backupFunction: (data: any, page: number, resetSearch: boolean) => void
  limit: number
  page: number
}


export default function QuoteSearchDialog({ open, setOpen, setQuotes, setCount, filterByCustomer, searchData, setSearchData, backupFunction, limit, page }: Props) {
  const [id, setId] = useState<number>('' as any);
  const [date, setDate] = useState<Date | null>(null);
  const [salesmanId, setSalesmanId] = useState<number>('' as any);
  const [source, setSource] = useState('');
  const [customer, setCustomer] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [partNum, setPartNum] = useState('');
  const [desc, setDesc] = useState('');
  const [stockNum, setStockNum] = useState('');
  const [sale, setSale] = useState<'' | 'TRUE' | 'FALSE'>('');

  useEffect(() => {
    if (searchData && open) {
      const { id, date, salesmanId, source, customer, contact, phone, state, partNum, desc, stockNum, sale } = searchData;
      setId(id || '' as any);
      setDate(new Date(date));
      setSalesmanId(salesmanId || '' as any);
      setSource(source || '');
      setCustomer(customer || '');
      setContact(contact || '');
      setPhone(phone || '');
      setState(state || '');
      setPartNum(partNum || '');
      setDesc(desc || '');
      setStockNum(stockNum || '');
      setSale(sale || '');
    }
  }, [open]);

  const clearInputs = () => {
    setId('' as any);
    setDate(null);
    setSalesmanId('' as any);
    setSource('');
    setCustomer('');
    setContact('');
    setPhone('');
    setState('');
    setPartNum('');
    setDesc('');
    setStockNum('');
    setSale('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const quoteSearch = {
      id: id ? Number(id) : id,
      date: parseDateInputValue(date),
      salesmanId,
      source,
      customer,
      contact,
      phone: phone.trim(),
      state,
      partNum,
      desc,
      stockNum,
      sale,
      limit,
      page: (page - 1) * limit
    };
    const isValidSearch = (
      !isObjectNull({ ...quoteSearch, id, date, page: null, limit: null, salesmanId: salesmanId > 0 ? salesmanId : null })
    );
    if (isValidSearch) {
      setSearchData(quoteSearch);
      const res = await searchQuotes(quoteSearch, filterByCustomer ? Number(localStorage.getItem("customerId")) : 0);
      setQuotes(res?.rows ?? []);
      setCount(res?.pageCount ?? 1);
    } else {
      setSearchData(null);
      backupFunction(null, page, true);
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Quote Search"
      width={400}
      height={550}
      className="quote-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Quote ID"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={id}
          onChange={(e: any) => setId(e.target.value)}
          type="number"
        />

        <Input
          label="Date"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          type="date"
        />

        <UserSelect
          label="Salesman"
          variant={['label-space-between', 'label-inline']}
          value={salesmanId}
          onChange={(e: any) => setSalesmanId(Number(e.target.value))}
        />

        <SourceSelect
          label="Source"
          variant={['label-space-between', 'label-inline']}
          value={source}
          onChange={(e: any) => setSource(e.target.value)}
        />

        <Input
          label="Customer"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={customer}
          onChange={(e: any) => setCustomer(e.target.value)}
        />

        <Input
          label="Contact"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={contact}
          onChange={(e: any) => setContact(e.target.value)}
        />

        <Input
          label="Phone"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between', 'no-arrows']}
          value={phone}
          onChange={(e: any) => setPhone(e.target.value)}
          type="number"
        />

        <Input
          label="State"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={state}
          onChange={(e: any) => setState(e.target.value)}
        />

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

        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e: any) => setStockNum(e.target.value)}
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
