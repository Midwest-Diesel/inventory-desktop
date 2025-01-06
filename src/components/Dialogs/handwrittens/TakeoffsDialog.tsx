import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { editPartQtyAndCost } from "@/scripts/controllers/partsController";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: HandwrittenItem
}


export default function TakeoffsDialog({ open, setOpen, item }: Props) {
  const [qty, setQty] = useState<number>(item.qty);
  const [cost, setCost] = useState<number>(item.cost);
  const [changeCost, setChangeCost] = useState(false);

  useEffect(() => {
    if (item.cost === 0.04) {
      setChangeCost(true)
      setCost(0.04);
    };
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await editPartQtyAndCost(item.partId, Number(qty), Number(cost));
    setOpen(false);
    setChangeCost(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Takeoff"
      width={300}
      y={-200}
    >
      <form onSubmit={handleSubmit}>
        <Input
          variant={['x-small', 'label-bold', 'label-stack']}
          label="Qty"
          value={qty}
          onChange={(e: any) => setQty(e.target.value)}
          type="number"
        />
        {changeCost &&
          <Input
            variant={['small', 'label-bold']}
            label="Change Cost"
            value={cost}
            onChange={(e: any) => setCost(e.target.value)}
            type="number"
          />
        }

        <div className="form__footer">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
