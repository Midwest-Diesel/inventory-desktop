import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { editHandwrittenTakeoffState, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { addPart, addPartCostIn, editPartCostIn, getPartById, getPartCostIn, handlePartTakeoff } from "@/scripts/services/partsService";
import { getSurplusByCode, zeroAllSurplusItems } from "@/scripts/services/surplusService";
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
  const [part, setPart] = useState<Part | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!item.partId) return;
      const res = await getPartById(item.partId);
      setPart(res);
    };
    fetchData();
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item.partId) return;
    const part: Part | null = await getPartById(item.partId);
    await handlePartTakeoff(item.partId, Number(qty));
    await editHandwrittenTakeoffState(item.id, true);
    if (!part) return;
    
    const surplus: Surplus | null = await getSurplusByCode(part.purchasedFrom ?? '');
    if (surplus && surplus.price - Number(item.cost) <= 0) await zeroAllSurplusItems(surplus.code);
    if (part.qty - Number(qty) <= 0) {
      const res = await getPartCostIn(part.stockNum ?? '');
      const partCostIn: PartCostIn | null = res.find((p: PartCostIn) => p.vendor === part.purchasedFrom) ?? null;
      if (partCostIn) await editPartCostIn({ ...partCostIn, cost: item.cost });
    } else {
      const newStockNum = part.stockNum?.split('').slice(0, 2).join('').toUpperCase() !== 'UP' ? part.stockNum : `${part.stockNum} (${formatDate(new Date())})`;
      await addPart({ ...part, qty: 0, stockNum: newStockNum }, true);
      await addPartCostIn(newStockNum ?? '', Number(item.cost), null, part.purchasedFrom ?? '', 'PurchasePrice', '');
    }

    const res = await getHandwrittenById(Number(params.handwritten));
    setHandwritten(res);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Takeoff"
      width={300}
      y={-200}
      data-testid="takeoffs-dialog"
    >
      {part &&
        <form onSubmit={handleSubmit}>
          <p><strong>Part Number:</strong> { part.partNum }</p>
          <p><strong>Stock Number:</strong> { part.stockNum }</p>
          <p><strong>Description:</strong> { part.desc }</p>
          <p><strong>Qty on Hand:</strong> { part.qty }</p>
          <br />
          <Input
            variant={['x-small', 'label-bold', 'label-stack', 'label-fit-content']}
            label="Qty"
            value={qty ?? ''}
            onChange={(e: any) => setQty(Math.max(Math.min(e.target.value, (item.qty ?? 0)), 1))}
            type="number"
            data-testid="qty"
          />

          <div className="form__footer">
            <Button type="submit" data-testid="submit-btn">Submit</Button>
          </div>
        </form>
      }
    </Dialog>
  );
}
