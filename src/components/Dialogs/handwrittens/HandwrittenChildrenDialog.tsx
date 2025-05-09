import Table from "@/components/Library/Table";
import Dialog from "../../Library/Dialog";
import Input from "@/components/Library/Input";
import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/Library/Button";
import { deleteHandwrittenItem, deleteHandwrittenItemChild, editHandwrittenItems, editHandwrittenItemsChild, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { ask } from "@tauri-apps/api/dialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  stockNumChildren: HandwrittenItemChild[]
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten) => void
}


export default function HandwrittenChildrenDialog({ open, setOpen, stockNumChildren, handwritten, setHandwritten }: Props) {
  const [items, setItems] = useState<HandwrittenItemChild[]>(stockNumChildren);

  useEffect(() => {
    setItems(stockNumChildren);
  }, [stockNumChildren]);

  const editItem = (item: HandwrittenItemChild) => {
    setItems(items.map((i) => {
      if (i.id !== item.id) return i;
      return item;
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (handwritten.invoiceStatus === 'SENT TO ACCOUNTING') return;
    for (let i = 0; i < items.length; i++) {
      const oldItem = JSON.stringify({ qty: stockNumChildren[i].qty, partNum: stockNumChildren[i].partNum, cost: stockNumChildren[i].cost });
      const newItem = JSON.stringify({ qty: items[i].qty, partNum: items[i].partNum, cost: items[i].cost });
      if (oldItem === newItem) continue;
      
      if (Boolean(items[i].parentId)) {
        await editHandwrittenItemsChild({ ...items[i], cost: Number(items[i].cost) });
      } else {
        const newEditItem = {
          ...items[i] as any,
          handwrittenId: handwritten.id,
          cost: Number(items[i].cost)
        } as HandwrittenItem;
        await editHandwrittenItems(newEditItem);
      }
    }
    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
    setOpen(false);
  };

  const handleDelete = async (item: HandwrittenItemChild) => {
    if (!await ask('Are you sure you want to delete this item?') || handwritten.invoiceStatus === 'SENT TO ACCOUNTING') return;
    if (Boolean(item.parentId)) {
      await deleteHandwrittenItemChild(item.id);
    } else {
      if (!await ask('This is the root item, removing it will delete all child stock number items. Do you want to continue?')) return;
      await deleteHandwrittenItem(item.id);
    }
    const res = await getHandwrittenById(handwritten.id);
    if (res) setHandwritten(res);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Stock Numbers"
      maxHeight="25rem"
      y={-120}
      className="handwritten-children-dialog"
    >
      <form className="handwritten-children-dialog__content" onSubmit={handleSave}>
        <Button variant={['fit', 'no-hover-color']} type="submit" disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'}>Save</Button>

        <Table variant={['edit-row-details']}>
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
            {items.map((item) => {
              return (
                <tr key={item.id}>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={item.qty || ''}
                      onChange={(e) => editItem({ ...item, qty: Number(e.target.value) })}
                      disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'}
                    />
                  </td>
                  <td>
                    <p>{ item.partNum }</p>
                  </td>
                  <td>
                    <p>{ item.stockNum } { !Boolean(item.parentId) && <em style={{ color: 'var(--grey-light-4)' }}>(root)</em> }</p>
                  </td>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={item.cost ?? ''}
                      onChange={(e) => editItem({ ...item, cost: e.target.value as any })}
                      disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'}
                    />
                  </td>
                  <td>
                    <Button
                      variant={['red-color']}
                      onClick={() => handleDelete(item)}
                      type="button"
                      disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </form>
    </Dialog>
  );
}
