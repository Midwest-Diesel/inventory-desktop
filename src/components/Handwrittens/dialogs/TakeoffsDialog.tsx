import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import { editHandwrittenChildTakeoffState, editHandwrittenItemTakeoffState, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { addPart, addPartCostIn, addToPartQtyHistory, editPartCostIn, editPartStockNum, getPartById, getPartCostIn, getPartQty, handlePartTakeoff } from "@/scripts/services/partsService";
import { getSurplusByCode, zeroAllSurplusItems } from "@/scripts/services/surplusService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";
import Loading from "@/components/library/Loading";
import { ask, invoke } from "@/scripts/config/tauri";
import { useNavState } from "@/hooks/useNavState";
import { editEngineStatus, getEngineByStockNum } from "@/scripts/services/enginesService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: HandwrittenItem | HandwrittenItemChild
  unitPrice: number
  setHandwritten: (handwritten: Handwritten | null) => void
  onSubmit: () => void
  takeoffInputRef: RefObject<HTMLInputElement>
  handwrittenId: number
}


const OUT_OF_STOCK_EMAIL_RECIPIENTS = ['terry@midwestdiesel.com', 'jack@midwestdiesel.com', 'matt@midwestdiesel.com', 'jason@midwestdiesel.com', 'jon@midwestdiesel.com', 'ryan@midwestdiesel.com'];

export default function TakeoffsDialog({ open, setOpen, item, unitPrice, setHandwritten, onSubmit, takeoffInputRef, handwrittenId }: Props) {
  const [qty, setQty] = useState<number>(Number(item.qty));
  const [part, setPart] = useState<Part | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { newTabs, newTab } = useNavState();

  useEffect(() => {
    if (!open) return;
    setTimeout(() => ref.current?.querySelector('button')?.focus(), 100);
  }, [open]);

  useEffect(() => {
    setQty(Number(item.qty));

    const fetchData = async () => {
      const res = await getPartById(item.partId);
      if (res) {
        setPart(res);
      } else {
        const engineRes = await getEngineByStockNum(Number(item.stockNum));
        setEngine(engineRes);
      }
    };
    fetchData();
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!part) return;
    if (part.qty - Number(qty) < 0) {
      alert('Part qty cannot go below 0');
      return;
    }

    // Remove qty and edit surplus when applicable
    const handwritten = await getHandwrittenById(handwrittenId);
    if (!handwritten) return;
    setLoading(true);

    // Do the takeoff
    await handlePartTakeoff(part.id, Number(qty), handwritten?.billToCompany ?? '', unitPrice, handwritten.id);
    await addToPartQtyHistory(part.id, -Number(qty));

    // Mark takeoff as done
    const parentId = (item as HandwrittenItemChild).parentId;
    if (parentId) {
      await editHandwrittenChildTakeoffState(item.id, true);
      await editHandwrittenItemTakeoffState(parentId, true);
    } else {
      await editHandwrittenItemTakeoffState(item.id, true);
    }
    
    // Set all connected surplus cost to $0.01
    const surplus: Surplus | null = await getSurplusByCode(part.purchasedFrom ?? '');
    if (surplus && surplus.price - Number(item.cost) <= 0) await zeroAllSurplusItems(surplus.code);

    // Prompt to send a part "out of stock" email if there's no more of these parts left
    if (await getPartQty(part.partNum) === 0 && await ask('Do you want to send an "out of stock" email?')) {
      const emailArgs: Email = {
        subject: `Important Part OUT OF STOCK!`,
        body: `The following part is no longer in stock: ${part.partNum} ${part.desc} sold for ${formatCurrency(unitPrice)}`,
        recipients: OUT_OF_STOCK_EMAIL_RECIPIENTS,
        attachments: []
      };
      await invoke('new_email_draft', { emailArgs });
    }
    
    // When the qty remaining after takeoffs is not 0
    // then it will create a new part with a date code, with the qtySold value
    // instead of changing the qtySold for the original part.
    if (part.qty - Number(qty) === 0) {
      const res = await getPartCostIn(part.stockNum ?? '');
      const partCostIn: PartCostIn | null = res.find((p: PartCostIn) => p.vendor === part.purchasedFrom) ?? null;
      if (partCostIn) await editPartCostIn({ ...partCostIn, cost: item.cost });

      // Also change stockNum to a date code if this is a UP
      if (part.stockNum?.startsWith('UP')) {
        const newStockNum = `${part.stockNum} (${formatDate(new Date())})`;
        await editPartStockNum(part.id, newStockNum);
 
        for (const row of res) {
          await editPartCostIn({ ...row, id: Number(row.id), cost: Number(row.cost), stockNum: newStockNum });
        }
      }
    } else {
      const newStockNum = `${part.stockNum} (${formatDate(new Date())})`;
      const newId = await addPart({ ...part, qty: 0, qtySold: Number(qty), stockNum: newStockNum, soldTo: handwritten?.billToCompany ?? '', sellingPrice: unitPrice, handwrittenId: handwritten.id }, true);
      if (!newStockNum) {
        alert('Failed to add PartCostIn data: newStockNum is invalid');
        return;
      }
      await addPartCostIn(newStockNum, Number(item.cost), null, part.purchasedFrom ?? '', 'PurchasePrice', '');

      const tabs = [];
      // When the part cost doesn't match the line item cost,
      // prompt the user to go to the new part created
      // This will take the user to the part details, where they can change it manually
      if (Number(part.purchasePrice) !== item.cost && await ask(`Part cost of ${formatCurrency(part.purchasePrice)} doesn't equal line item cost of ${formatCurrency(item.cost)}. Do you want to open the new part created?\n\nThis will create a new tab.`)) {
        tabs.push([{ name: part.partNum, url: `/part/${newId}` }]);
      }

      // Bring the user to the original part details so they can edit the remarks
      if (await ask('There\'s still qty left over, do you want to edit the part remarks?\n\nThis will create a new tab.')) {
        tabs.push([{ name: part.stockNum!, url: `/part/${part.id}` }]);
      }

      await newTabs(tabs);
    }

    // Finalize takeoff
    const res = await getHandwrittenById(handwrittenId);
    onSubmit();
    setLoading(false);
    setHandwritten(res);
    takeoffInputRef.current?.focus();
    setOpen(false);
  };

  const handleSubmitEngine = async (e: FormEvent) => {
    e.preventDefault();
    if (!engine) return;

    await editEngineStatus(engine.id, 'Sold');
    await newTab([{ name: engine.stockNum.toString(), url: `/engines/${engine.stockNum}` }]);
    await editHandwrittenItemTakeoffState(item.id, true);

    onSubmit();
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
            onChange={(e) => setQty(Math.max(Math.min(Number(e.target.value), (item.qty ?? 0)), 1))}
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

      {engine &&
        <form onSubmit={handleSubmitEngine}>
          <p><strong>Engine Stock Number:</strong> { engine.stockNum }</p>

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
