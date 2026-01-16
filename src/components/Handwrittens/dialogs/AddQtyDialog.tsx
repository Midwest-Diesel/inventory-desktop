import Input from "@/components/library/Input";
import Dialog from "../../library/Dialog";
import Button from "@/components/library/Button";
import { FormEvent, useState } from "react";
import { addHandwrittenItem, addHandwrittenItemChild, getHandwrittenById } from "@/scripts/services/handwrittensService";
import Checkbox from "@/components/library/Checkbox";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten | null) => void
  setIsEditing: (value: boolean) => void
}


export default function AddQtyDialog({ open, setOpen, handwritten, setHandwritten, setIsEditing }: Props) {
  const [qty, setQty] = useState<number | null>(null);
  const [partNum, setPartNum] = useState('');
  const [desc, setDesc] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [isInOut, setIsInOut] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (handwritten.invoiceStatus === 'SENT TO ACCOUNTING') return;
    if (!qty || qty < 1) {
      alert('Qty should be greater than 1');
      return;
    }

    const newItem = {
      handwrittenId: handwritten.id,
      date: new Date(),
      desc,
      partNum,
      stockNum: isInOut ? 'IN/OUT' : '',
      unitPrice: Number(unitPrice),
      qty,
      cost: 0.04,
      location: isInOut ? 'IN/OUT' : '',
      partId: null
    };
    const id = await addHandwrittenItem(newItem);

    if (isInOut) {
      const newChild = {
        partId: null,
        qty,
        cost: 0.04,
        partNum,
        stockNum: 'In/Out'
      };
      await addHandwrittenItemChild(Number(id), newChild);
    }

    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
    setIsEditing(false);
    resetData();
    setOpen(false);
  };

  const handleCancel = () => {
    resetData();
    setOpen(false);
  };

  const resetData = () => {
    setQty(null);
    setUnitPrice(null);
    setPartNum('');
    setDesc('');
    setIsInOut(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Add Part to Handwritten"
      width={370}
      y={-150}
    >
      <form onSubmit={handleSubmit}>
        <Input
          variant={['label-bold']}
          label="Qty"
          value={qty ?? ''}
          onChange={(e) => setQty(e.target.value ? Number(e.target.value) : null)}
          type="number"
          required
        />
        <Input
          variant={['label-bold']}
          label="Part Number"
          value={partNum}
          onChange={(e) => setPartNum(e.target.value)}
          required
        />
        <Input
          variant={['label-bold']}
          label="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <Input
          variant={['label-bold']}
          label="Price"
          value={unitPrice ?? ''}
          onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : null)}
          type="number"
          step="any"
          required
        />
        <Checkbox
          variant={['dark-bg', 'label-bold', 'label-align-center', 'label-fit']}
          label="Is this part IN/OUT?"
          checked={isInOut}
          onChange={(e) => setIsInOut(e.target.checked)}
        />

        <div className="form__footer">
          <Button type="submit">Add to Handwritten</Button>
          <Button type="button" onClick={handleCancel}>Cancel</Button>
        </div>
      </form>
    </Dialog>
  );
}
