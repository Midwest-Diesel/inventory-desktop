import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { editHandwrittenTakeoffState, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { addPart, addPartCostIn, editPartCostIn, getPartById, getPartCostIn, handlePartTakeoff } from "@/scripts/controllers/partsController";
import { getSurplusByCode, zeroAllSurplusItems } from "@/scripts/controllers/surplusController";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: HandwrittenItem | HandwrittenItemChild
  setHandwritten: (handwritten: Handwritten | null) => void
}


export default function TakeoffsDialog({ open, setOpen, item, setHandwritten }: Props) {
  const params = useParams();
  const [qty, setQty] = useState<number | null>(item.qty);
  const [cost, setCost] = useState<number | null>(item.cost);
  const [changeCost, setChangeCost] = useState(false);

  useEffect(() => {
    if (item.cost === 0.04) {
      setChangeCost(true);
      setCost(0.04);
    };
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item.partId) return;
    const part: Part = await getPartById(item.partId);
    await handlePartTakeoff(item.partId, Number(qty));
    await editHandwrittenTakeoffState(item.id, true);
    const surplus: Surplus = await getSurplusByCode(part.purchasedFrom ?? '');
    if (surplus && surplus.price - Number(cost) <= 0) await zeroAllSurplusItems(surplus.code);
    if (part.qty - Number(qty) <= 0) {
      const partCostIn = (await getPartCostIn(part.stockNum ?? '')).find((p: PartCostIn) => p.vendor === part.purchasedFrom);
      await editPartCostIn({ ...partCostIn, cost: Number(cost) });
    } else {
      const newStockNum = `${part.stockNum} (${formatDate(new Date())})`;
      await addPart({ ...part, qty: 0, stockNum: newStockNum }, true);
      await addPartCostIn(newStockNum, Number(cost), null, part.purchasedFrom ?? '', 'PurchasePrice', '');
    }

    const res = await getHandwrittenById(Number(params.handwritten));
    setHandwritten(res);
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
          value={qty ?? ''}
          onChange={(e: any) => setQty(Math.max(Math.min(e.target.value, (item.qty ?? 0)), 1))}
          type="number"
        />
        {changeCost &&
          <Input
            variant={['small', 'label-bold']}
            label="Change Cost"
            value={cost ?? ''}
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
