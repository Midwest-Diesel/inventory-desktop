import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { toggleHandwrittenTakeoffState } from "@/scripts/controllers/handwrittensController";
import { getPartById, handlePartTakeoff } from "@/scripts/controllers/partsController";
import { getSurplusByCode, editSurplusPrice } from "@/scripts/controllers/surplusController";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: HandwrittenItem | HandwrittenItemChild
}


export default function TakeoffsDialog({ open, setOpen, item }: Props) {
  const [qty, setQty] = useState<number>(item.qty);
  const [cost, setCost] = useState<number>(item.cost);
  const [changeCost, setChangeCost] = useState(false);

  useEffect(() => {
    if (item.cost === 0.04) {
      setChangeCost(true);
      setCost(0.04);
    };
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handlePartTakeoff(item.partId, Number(qty), Number(cost));
    await toggleHandwrittenTakeoffState(item.id, true);
    const part: Part = await getPartById(item.partId);
    const surplus: Surplus = await getSurplusByCode(part.purchasedFrom);
    if (surplus) {
      await editSurplusPrice(surplus.id, surplus.price - Number(cost));
    }

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
