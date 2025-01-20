import Dialog from "../Library/Dialog";
import Table from "../Library/Table";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { togglePurchaseOrderItemReceived } from "@/scripts/controllers/purchaseOrderController";
import { useEffect, useState } from "react";
import Checkbox from "../Library/Checkbox";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  purchaseOrder: PO
}


export default function MarkPoItemsReceivedDialog({ open, setOpen, purchaseOrder }: Props) {
  const [items, setItems] = useState<POItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(purchaseOrder.poItems);
  }, [open, purchaseOrder]);

  const handleReceivedItem = async (item: POItem) => {
    await togglePurchaseOrderItemReceived(item.id, !item.isReceived);
    setItems(items.map((i) => {
      if (i.id === item.id) return { ...i, isReceived: !i.isReceived };
      return i;
    }));
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
                  <Checkbox
                    checked={item.isReceived}
                    onChange={() => handleReceivedItem(item)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Dialog>
  );
}
