import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import { editHandwrittenTakeoffState, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { addPart, addPartCostIn, addToPartQtyHistory, editPartCostIn, getPartById, getPartCostIn, handlePartTakeoff } from "@/scripts/services/partsService";
import { getSurplusByCode, zeroAllSurplusItems } from "@/scripts/services/surplusService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useParams } from "react-router-dom";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";
import Loading from "@/components/library/Loading";
import { confirm } from "@/scripts/config/tauri";
import { useNavState } from "@/hooks/useNavState";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: HandwrittenItem | HandwrittenItemChild
  unitPrice: number
  setHandwritten: (handwritten: Handwritten | null) => void
  onSubmit: () => void
  takeoffInputRef: RefObject<HTMLInputElement>
}


export default function TakeoffsDialog({ open, setOpen, item, unitPrice, setHandwritten, onSubmit, takeoffInputRef }: Props) {
  const params = useParams();
  const [qty, setQty] = useState<number>(item.qty ?? 0);
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { newTab } = useNavState();

  useEffect(() => {
    if (!open) return;
    setTimeout(() => ref.current?.querySelector('button')?.focus(), 100);
  }, [open]);

  useEffect(() => {
    const fetchData = async () => {
      if (!item.partId) return;
      const res = await getPartById(item.partId);
      setPart(res);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!part) return;
    if (part.qty - Number(qty) < 0) {
      alert('Part qty cannot go below 0');
      return;
    }

    // Remove qty and edit surplus when applicable
    const handwritten = await getHandwrittenById(Number(params.handwritten));
    if (!handwritten) return;
    setLoading(true);

    await handlePartTakeoff(part.id, Number(qty), handwritten?.billToCompany ?? '', unitPrice, handwritten.id);
    await editHandwrittenTakeoffState(item.id, true);
    await addToPartQtyHistory(part.id, -Number(qty));
    
    const surplus: Surplus | null = await getSurplusByCode(part.purchasedFrom ?? '');
    if (surplus && surplus.price - Number(item.cost) <= 0) await zeroAllSurplusItems(surplus.code);
    
    // When the qty remaining after takeoffs is not 0
    // then it will create a new part with a date code, with the qtySold value
    // instead of changing the qtySold for the original part
    if (part.qty - Number(qty) === 0) {
      const res = await getPartCostIn(part.stockNum ?? '');
      const partCostIn: PartCostIn | null = res.find((p: PartCostIn) => p.vendor === part.purchasedFrom) ?? null;
      if (partCostIn) await editPartCostIn({ ...partCostIn, cost: item.cost });
    } else {
      const isPartUP = part.stockNum?.split('').slice(0, 2).join('').toUpperCase() === 'UP';
      const newStockNum = isPartUP ? `${part.stockNum} (${formatDate(new Date())})` : part.stockNum;
      const newId = await addPart({ ...part, qty: 0, qtySold: Number(qty), stockNum: newStockNum, soldTo: handwritten?.billToCompany ?? '', sellingPrice: unitPrice, handwrittenId: handwritten.id }, true);
      if (!newStockNum) {
        alert('Failed to add PartCostIn data: newStockNum is invalid');
        return;
      }
      await addPartCostIn(newStockNum, Number(item.cost), null, part.purchasedFrom ?? '', 'PurchasePrice', '');

      // When the part cost doesn't match the line item cost,
      // prompt the user to go to the new part created
      // This will take the user to the part details, where they can change it manually
      if (Number(part.purchasePrice) !== item.cost && await confirm(`Part cost of ${formatCurrency(part.purchasePrice)} doesn't equal line item cost of ${formatCurrency(item.cost)}. Do you want to open the new part created?`)) {
        await newTab([{ name: part.partNum, url: `/part/${newId}` }]);
      }
    }

    // Finalize takeoff
    const res = await getHandwrittenById(Number(params.handwritten));
    onSubmit();
    setLoading(false);
    setHandwritten(res);
    takeoffInputRef.current?.focus();
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
            data-testid="takeoff-qty-input"
          />

          <div className="form__footer" ref={ref}>
            {loading ?
              <Loading />
              :
              <Button type="submit" data-testid="takeoff-submit-btn">Submit</Button>
            }
          </div>
        </form>
      }
    </Dialog>
  );
}
