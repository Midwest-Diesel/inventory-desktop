import Table from "@/components/library/Table";
import Dialog from "../../library/Dialog";
import Input from "@/components/library/Input";
import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/library/Button";
import { deleteHandwrittenItemChild, editHandwrittenItemChild, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { ask } from "@/scripts/config/tauri";
import PartSelectDialog from "../../dashboard/dialogs/PartSelectDialog";
import { formatCurrency } from "@/scripts/tools/stringUtils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  stockNumChildren: HandwrittenItemChild[]
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten) => void
}


export default function HandwrittenChildrenDialog({ open, setOpen, stockNumChildren, handwritten, setHandwritten }: Props) {
  const [childEdited, setChildEdited] = useState<HandwrittenItemChild | null>(null);
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const [part, setPart] = useState<Part | null>(null);
  const [partSelectDialogOpen, setPartSelectDialogOpen] = useState(false);

  useEffect(() => {
    if (!childEdited) return;
    setQty(childEdited.qty?.toString() ?? '');
    setCost(childEdited.cost?.toString() ?? '');
    setPart(childEdited.part ?? null);
  }, [childEdited]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setChildEdited(null);
    if (handwritten.invoiceStatus === 'SENT TO ACCOUNTING' || !childEdited) return;
    await editHandwrittenItemChild({ id: childEdited.id, parentId: childEdited.parentId, partId: part?.id, qty: Number(qty), cost: Number(cost) } as any);
    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
  };

  const handleDelete = async (item: HandwrittenItemChild) => {
    if (!await ask('Are you sure you want to delete this item?') || handwritten.invoiceStatus === 'SENT TO ACCOUNTING') return;
    setChildEdited(null);
    await deleteHandwrittenItemChild(item.id);
    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
  };

  const onChangePartId = (part: Part) => {
    setPart(part);
  };


  if (stockNumChildren.length === 0) return null;

  return (
    <>
      <PartSelectDialog open={partSelectDialogOpen} setOpen={setPartSelectDialogOpen} onSubmit={onChangePartId} />

      <Dialog
        open={open}
        setOpen={(value: boolean) => {
          setOpen(value);
          if (!value) setChildEdited(null);
        }}
        title="Stock Numbers"
        maxHeight="25rem"
        y={-120}
        className="handwritten-children-dialog"
      >
        {childEdited ?
          <form className="handwritten-children-dialog__content" onSubmit={handleSave}>
            <Button variant={['fit']} onClick={() => setPartSelectDialogOpen(true)} type="button">Change Part</Button>
            <br />
            <p><strong>Part Number:</strong> { part?.partNum }</p>
            <p><strong>Stock Number:</strong> { part?.stockNum }</p>
            
            <Input
              variant={['x-small', 'label-bold', 'label-stack', 'label-fit-content']}
              label="Qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              type="number"
            />
            <Input
              variant={['small', 'label-bold', 'label-stack', 'label-fit-content']}
              label="Cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              type="number"
              step="any"
            />

            <div className="form__footer">
              <Button variant={['fit']} onClick={() => setChildEdited(null)} type="button">Cancel</Button>
              <Button variant={['fit', 'no-hover-color']} type="submit">Save</Button>
            </div>
          </form>
          :
          <Table>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Stock Number</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stockNumChildren.map((item) => {
                return (
                  <tr key={item.id}>
                    <td>{ item.qty }</td>
                    <td style={item.isTakeoffDone ? { color: 'var(--yellow-2)', fontWeight: 'bold' } : {}}>{ item.partNum }</td>
                    <td style={item.isTakeoffDone ? { color: 'var(--yellow-2)', fontWeight: 'bold' } : {}}>{ item.stockNum }</td>
                    <td>{ formatCurrency(item.cost) }</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <Button
                          onClick={() => setChildEdited(item)}
                          disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'}
                        >
                          <img src="/images/icons/edit.svg" alt="Edit" width={17} height={17} draggable={false} />
                        </Button>
                        <Button
                          variant={['danger']}
                          onClick={() => handleDelete(item)}
                          disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'}
                        >
                          <img src="/images/icons/delete.svg" alt="Delete" width={17} height={17} draggable={false} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        }
      </Dialog>
    </>
  );
}
