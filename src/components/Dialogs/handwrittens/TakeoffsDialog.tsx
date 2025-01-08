import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { toggleHandwrittenTakeoffState } from "@/scripts/controllers/handwrittensController";
import { addPart, getPartById, getPartCostIn, handlePartTakeoff } from "@/scripts/controllers/partsController";
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
    const part: Part = await getPartById(item.partId);
    const partCostIn = await getPartCostIn(part.stockNum);
    const totalPartCost = partCostIn.filter((num) => num.cost !== 0.04 && num.cost !== 0.01 && num.costType !== 'ReconPrice' && num.vendor === part.purchasedFrom).reduce((acc, val) => acc + val.cost, 0) - Number(cost);
    await handlePartTakeoff(item.partId, Number(qty), part.stockNum, totalPartCost);
    await toggleHandwrittenTakeoffState(item.id, true);
    const surplus: Surplus = await getSurplusByCode(part.purchasedFrom);
    if (surplus && Number(cost) === 0.04) {
      await editSurplusPrice(surplus.id, surplus.price - Number(cost));
    }
    await addPart({ ...part, qty: Number(qty) }, true);

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
