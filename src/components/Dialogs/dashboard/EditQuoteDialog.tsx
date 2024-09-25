import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { editQuote } from "@/scripts/controllers/quotesController";
import Checkbox from "../../Library/Checkbox";
import SourceSelect from "../../Library/Select/SourceSelect";
import CustomerSelect from "../../Library/Select/CustomerSelect";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { getCustomerByName, getCustomerNames } from "@/scripts/controllers/customerController";
import { useAtom } from "jotai";
import { customerNamesAtom } from "@/scripts/atoms/state";

interface Props {
  setQuoteEdited: (quote: Quote) => void
  quote: Quote
  setQuote: (quote: Quote) => void
}


export default function EditQuoteDialog({ setQuoteEdited, quote, setQuote }: Props) {
  const [customerNames, setCustomerNames] = useAtom<string[]>(customerNamesAtom);
  const [date, setDate] = useState<Date>(quote.date);
  const [salesman, setSalesman] = useState<string>(quote.salesman);
  const [source, setSource] = useState<string>(quote.source);
  const [company, setCompany] = useState<string>(quote.customer.company || '');
  const [partNum, setPartNum] = useState<string>(quote.partNum || '');
  const [desc, setDesc] = useState<string>(quote.desc || '');
  const [stockNum, setStockNum] = useState<string>(quote.stockNum);
  const [price, setPrice] = useState<number>(quote.price);
  const [notes, setNotes] = useState<string>(quote.notes);
  const [sale, setSale] = useState<boolean>(quote.sale);

  useEffect(() => {
    const fetchData = async () => {
      if (customerNames.length === 0) setCustomerNames(await getCustomerNames());
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const customer = await getCustomerByName(company);
    const newQuote = {
      id: quote.id,
      customer,
      date,
      salesman,
      source,
      partNum,
      desc,
      stockNum,
      price,
      notes,
      sale,
    } as Quote;
    await editQuote(newQuote);
    setQuote(newQuote);
    setQuoteEdited(null);
  };

  const handelCancel = () => {
    setDate(quote.date);
    setSalesman(quote.salesman);
    setSource(quote.source);
    setCompany(quote.customer.company);
    setPartNum(quote.partNum);
    setDesc(quote.desc);
    setStockNum(quote.stockNum);
    setPrice(quote.price);
    setNotes(quote.notes);
    setSale(quote.sale);
    setQuoteEdited(null);
  };


  return (
    <Dialog
      open
      setOpen={() => setQuoteEdited(null)}
      title="Edit Quote"
      maxHeight="44rem"
      width={500}
    >
      <form onSubmit={(e)=> handleSubmit(e)}>
        <Input
          label="Date"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          type="date"
          value={parseDateInputValue(date)}
          onChange={(e: any) => setDate(new Date(e.target.value))}
          required
        />

        <Input
          label="Qtd By"
          variant={['label-space-between', 'label-full-width', 'x-small', 'thin']}
          value={salesman}
          onChange={(e: any) => setSalesman(e.target.value)}
          required
        />

        <SourceSelect
          label="Source"
          variant={['label-space-between']}
          value={source}
          onChange={(e: any) => setSource(e.target.value)}
        />
        
        <CustomerSelect
          label="Customer"
          variant={['label-space-between', 'label-full-width', 'gap', 'fill']}
          value={company}
          onChange={(value: any) => setCompany(value)}
          maxHeight="15rem"
        />

        <Input
          label="Part Number"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
          required
        />

        <Input
          label="Description"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={desc}
          onChange={(e: any) => setDesc(e.target.value)}
        />

        <Input
          label="Stock Number"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={stockNum}
          onChange={(e: any) => setStockNum(e.target.value)}
        />

        <Input
          label="Price"
          variant={['label-space-between', 'label-full-width', 'small', 'thin']}
          value={price}
          onChange={(e: any) => setPrice(e.target.value)}
          required
        />

        <Input
          label="Notes"
          variant={['label-stack', 'text-area']}
          rows={5}
          cols={100}
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
        />

        <Checkbox
          label="Sale"
          variant={['label-space-between', 'dark-bg']}
          checked={sale}
          onChange={(e: any) => setSale(e.target.checked)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={handelCancel}>Cancel</Button>
          <Button type="submit" variant={['small']}>Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
