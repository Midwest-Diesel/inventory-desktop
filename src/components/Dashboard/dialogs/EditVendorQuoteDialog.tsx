import { FormEvent, useEffect, useRef, useState } from "react";
import Dialog from "../../library/Dialog";
import Input from "../../library/Input";
import Button from "../../library/Button";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import TextArea from "@/components/library/TextArea";
import { editVendorQuote } from "@/scripts/services/vendorQuotesService";
import VendorDropdown from "@/components/library/dropdown/VendorDropdown";
import { getVendorByName } from "@/scripts/services/vendorsService";
import Select from "@/components/library/select/Select";

interface Props {
  quote: VendorQuote
  setQuote: (quote: VendorQuote | null) => void
  onClose: (quote: VendorQuote) => void
}


export default function EditVendorQuoteDialog({ quote, setQuote, onClose }: Props) {
  const [date, setDate] = useState<Date | null>(quote.date ?? new Date());
  const [vendor, setVendor] = useState<string>(quote.vendor?.name ?? '');
  const [contact, setContact] = useState<string>(quote.contact ?? '');
  const [partNum, setPartNum] = useState<string>(quote.partNum ?? '');
  const [condition, setCondition] = useState<VendorQuoteCondition>(quote.condition ?? '');
  const [price, setPrice] = useState<number | null>(quote.price || null);
  const [notes, setNotes] = useState<string>(quote.notes ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [quote]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newVendor = await getVendorByName(vendor);

    const newQuote = {
      ...quote,
      vendorId: newVendor?.id ?? null,
      contact,
      date,
      partNum,
      condition,
      price: Number(price),
      notes
    } as VendorQuote;

    await editVendorQuote(newQuote);
    onClose(newQuote);
    setQuote(null);
  };

  const handelCancel = () => {
    setDate(quote.date);
    setContact(quote.contact ?? '');
    setCondition(quote.condition ?? '');
    setPrice(quote.price);
    setNotes(quote.notes ?? '');
    setQuote(null);
    onClose(quote);
  };


  return (
    <Dialog
      open
      setOpen={() => setQuote(null)}
      title="Edit Vendor Quote"
      maxHeight="44rem"
      width={500}
    >
      <form onSubmit={(e)=> handleSubmit(e)}>
        <Input
          label="Date"
          variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
          type="date"
          value={parseDateInputValue(date)}
          onChange={(e) => setDate(new Date(e.target.value))}
          required
        />

        <VendorDropdown
          label="Vendor"
          variant={['label-bold', 'label-stack']}
          value={vendor}
          onChange={(value) => setVendor(value)}
          maxHeight="20rem"
        />

        <Input
          label="Part Number"
          variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
          value={partNum}
          onChange={(e) => setPartNum(e.target.value)}
        />

        <Select
          label="Condition"
          variant={['label-bold', 'label-stack']}
          value={condition}
          onChange={(e) => setCondition(e.target.value as VendorQuoteCondition)}
        >
          <option>New</option>
          <option>Good Used</option>
          <option>Reconditioned</option>
          <option>Core</option>
        </Select>

        <Input
          label="Price"
          variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
          value={price ?? ''}
          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : null)}
          type="number"
          step="any"
          ref={inputRef}
          required
        />

        <Input
          label="Contact"
          variant={['label-full-width', 'small', 'thin', 'label-bold', 'label-stack']}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <TextArea
          label="Notes"
          variant={['label-stack', 'label-bold', 'label-stack', 'label-fit-content']}
          rows={5}
          cols={100}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={handelCancel}>Cancel</Button>
          <Button type="submit" variant={['small']}>Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
