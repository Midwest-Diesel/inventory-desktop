import Dialog from "@/components/library/Dialog";
import Table from "@/components/library/Table";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { addPurchaseOrderReceivedItem, togglePurchaseOrderItemReceived, togglePurchaseOrderReceived } from "@/scripts/services/purchaseOrderService";
import { useEffect, useState } from "react";
import Button from "@/components/library/Button";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  purchaseOrder: PO
  addOn: AddOn | null
}


export default function MarkPoItemsReceivedDialog({ open, setOpen, purchaseOrder, addOn }: Props) {
  const [items, setItems] = useState<POItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(purchaseOrder.poItems);
  }, [open, purchaseOrder]);

  const handleReceivedItem = async (item: POItem) => {
    if (item.isReceived) return;
    await togglePurchaseOrderItemReceived(item.id, true);
    const newItemsList = items.map((i) => {
      if (i.id === item.id) return { ...i, isReceived: true };
      return i;
    });
    setItems(newItemsList);

    if (!newItemsList.find((i) => !i.isReceived)) await togglePurchaseOrderReceived(purchaseOrder.id, true);

    const newItem = {
      partNum: addOn?.partNum ?? '',
      desc: addOn?.desc ?? '',
      stockNum: addOn?.stockNum ?? '',
      cost: 0,
      POItemId: item.id
    } as any;
    await addPurchaseOrderReceivedItem(newItem);
  };

  
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Mark PO Items Received"
    >
      <Table>
        <thead>
          <tr>
            <th>Qty</th>
            <th>Description</th>
            <th>Unit Price</th>
            <th>Total Price</th>
            <th>Mark Received</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            return (
              <tr key={item.id}>
                <td>{ item.qty }</td>
                <td>{ item.desc }</td>
                <td>{ formatCurrency(item.unitPrice) }</td>
                <td>{ formatCurrency(item.totalPrice) }</td>
                <td className="cbx-td">
                  <Button onClick={() => handleReceivedItem(item)} disabled={item.isReceived}>{ item.isReceived ? 'Received' : 'Receive' }</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Dialog>
  );
}
