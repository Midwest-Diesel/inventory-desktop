import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { editQuote } from "@/scripts/services/quotesService";
import SourceSelect from "../../Library/Select/SourceSelect";
import CustomerDropdown from "../../Library/Dropdown/CustomerDropdown";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { getCustomerByName, getCustomerNames } from "@/scripts/services/customerService";
import { useAtom } from "jotai";
import { customerNamesAtom } from "@/scripts/atoms/state";
import PartSelectDialog from "./PartSelectDialog";
import Select from "@/components/Library/Select/Select";

interface Props {
  setQuoteEdited: (quote: Quote | null) => void
  quote: Quote
  setQuote: (quote: Quote) => void
}


export default function EditQuoteDialog({ setQuoteEdited, quote, setQuote }: Props) {
  const [customerNames, setCustomerNames] = useAtom<string[]>(customerNamesAtom);
  const [date, setDate] = useState<Date | null>(quote.date);
  const [source, setSource] = useState<string>(quote.source ?? '');
  const [company, setCompany] = useState<string>(quote.customer?.company ?? '');
  const [contact, setContact] = useState<string>(quote.contact ?? '');
  const [part, setPart] = useState<Part | null>(quote.part);
  const [desc, setDesc] = useState<string>(quote.desc ?? '');
  const [price, setPrice] = useState<number>(Number(quote.price));
  const [notes, setNotes] = useState<string>(quote.notes ?? '');
  const [partSelectOpen, setPartSelectOpen] = useState(false);

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
      ...quote,
      customer,
      contact,
      date,
      source,
      partNum: part ? part.partNum : quote.partNum,
      stockNum: part ? part.stockNum : quote.stockNum,
      desc,
      price,
      notes,
      partId: part ? part.id : null
    } as Quote;
    await editQuote(newQuote);
    setQuote(newQuote);
    setQuoteEdited(null);
  };

  const handelCancel = () => {
    setDate(quote.date);
    setSource(quote.source ?? '');
    setCompany(quote.customer?.company ?? '');
    setContact(quote.contact ?? '');
    setPart(quote.part);
    setDesc(quote.desc ?? '');
    setPrice(quote.price ?? 0);
    setNotes(quote.notes ?? '');
    setQuoteEdited(null);
  };

  const onSubmitPartSelect = (part: Part) => {
    setPart(part);
    setDesc(part.desc ?? '');
  };


  return (
    <>
      <PartSelectDialog open={partSelectOpen} setOpen={setPartSelectOpen} onSubmit={onSubmitPartSelect} />

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
            variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
            type="date"
            value={parseDateInputValue(date)}
            onChange={(e: any) => setDate(new Date(e.target.value))}
            required
          />

          <SourceSelect
            label="Source"
            variant={['label-bold', 'label-stack']}
            value={source}
            onChange={(e: any) => setSource(e.target.value)}
          />
          
          <CustomerDropdown
            label="Customer"
            variant={['label-full-width', 'gap', 'fill', 'label-bold', 'label-stack']}
            value={company}
            onChange={(value: any) => setCompany(value)}
            maxHeight="15rem"
          />

          <Select
            label="Contact"
            variant={['label-full-width', 'label-bold', 'label-stack']}
            value={contact}
            onChange={(e: any) => setContact(e.target.value)}
          >
            <option value="">-- SELECT CONTACT --</option>
            {quote.customer && quote.customer.contacts.map((c) => {
              return <option key={c.id}>{ c.name }</option>;
            })}
          </Select>

          {part &&
            <>
              <p><span style={{ fontWeight: 'bold' }}>PartNum:</span> {part.partNum}</p>
              <p><span style={{ fontWeight: 'bold' }}>StockNum:</span> {part.stockNum}</p>
            </>
          }

          <br />
          <Button variant={['fit']} type="button" onClick={() => setPartSelectOpen(true)}>Select Part</Button>
          <br />

          <Input
            label="Description"
            variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
            value={desc}
            onChange={(e: any) => setDesc(e.target.value)}
          />

          <Input
            label="Price"
            variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
            value={price}
            onChange={(e: any) => setPrice(e.target.value)}
            type="number"
            step="any"
            required
          />

          <Input
            label="Notes"
            variant={['label-stack', 'text-area', 'label-bold', 'label-stack', 'label-fit-content']}
            rows={5}
            cols={100}
            value={notes}
            onChange={(e: any) => setNotes(e.target.value)}
          />

          <div className="form__footer">
            <Button type="button" variant={['small']} onClick={handelCancel}>Cancel</Button>
            <Button type="submit" variant={['small']}>Save</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
