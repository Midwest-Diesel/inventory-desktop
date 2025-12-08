import Input from "@/components/library/Input";
import Dialog from "../../library/Dialog";
import Button from "@/components/library/Button";
import { FormEvent, useState } from "react";
import { addHandwrittenItem, addHandwrittenItemChild, getHandwrittenById } from "@/scripts/services/handwrittensService";
import PartSelectDialog from "../../dashboard/dialogs/PartSelectDialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten | null) => void
  setIsEditing: (value: boolean) => void
}


export default function AddQtyDialog({ open, setOpen, handwritten, setHandwritten, setIsEditing }: Props) {
  const [qtyInput, setQty] = useState('');
  const [part, setPart] = useState<Part | null>(null);
  const [unitPriceInput, setUnitPrice] = useState('');
  const [partSelectDialogOpen, setPartSelectDialogOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (handwritten.invoiceStatus === 'SENT TO ACCOUNTING') return;
    if (!part) {
      alert('Select a part');
      return;
    }
    const qty: number = Number(qtyInput);
    const unitPrice: number = Number(unitPriceInput);
    if (qty < 1) {
      alert('Qty should be greater than 1');
      return;
    }

    const newItem = {
      handwrittenId: handwritten.id,
      date: new Date(),
      desc: part.desc,
      partNum: part.partNum,
      stockNum: null,
      unitPrice,
      qty: 0,
      cost: 0,
      location: null,
      partId: null
    };
    const id = await addHandwrittenItem(newItem);
    const newChild = {
      partId: null,
      qty,
      cost: 0.04,
      partNum: part.partNum,
      stockNum: 'In/Out'
    };
    await addHandwrittenItemChild(Number(id), newChild);

    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
    setIsEditing(false);
    resetData();
    setOpen(false);
  };

  const onSelectPart = (part: Part) => {
    setPart(part);
  };

  const handleCancel = () => {
    resetData();
    setOpen(false);
  };

  const resetData = () => {
    setPart(null);
    setQty('');
    setUnitPrice('');
  };


  return (
    <>
      <PartSelectDialog open={partSelectDialogOpen} setOpen={setPartSelectDialogOpen} onSubmit={onSelectPart} />
      
      <Dialog
        open={open}
        setOpen={setOpen}
        title="Add Part to Handwritten"
        width={370}
        y={-150}
      >
        <form onSubmit={handleSubmit}>
          <Button variant={['fit']} onClick={() => setPartSelectDialogOpen(true)} type="button">Select Part</Button>
          {part &&
            <>
              <p><strong>Part Number:</strong> { part.partNum }</p>
              <p><strong>Description:</strong> { part.desc }</p>
            </>
          }
          <br />

          <Input
            variant={['label-bold']}
            label="Qty"
            value={qtyInput}
            onChange={(e) => setQty(e.target.value)}
            type="number"
            required
          />
          <Input
            variant={['label-bold']}
            label="Price"
            value={unitPriceInput}
            onChange={(e) => setUnitPrice(e.target.value)}
            type="number"
            step="any"
            required
          />

          <div className="form__footer">
            <Button type="submit">Add to Handwritten</Button>
            <Button type="button" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
