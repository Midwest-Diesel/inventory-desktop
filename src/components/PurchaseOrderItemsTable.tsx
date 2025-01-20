import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";
import Checkbox from "./Library/Checkbox";
import { togglePurchaseOrderItemReceived } from "@/scripts/controllers/purchaseOrderController";
import { confirm } from "@tauri-apps/api/dialog";

interface Props {
  className?: string
  poItems: POItem[]
  poReceivedItems: POReceivedItem[]
  po: PO
  setPoItems: (data: PO) => void
}


export default function PurchaseOrderItemsTable({ className, poItems, poReceivedItems, po, setPoItems }: Props) {
  const handleToggleIsItemReceived = async (id: number, isReceived: boolean) => {
    if (!await confirm(`Mark item as ${isReceived ? 'received' : 'not received'}?`)) return;
    await togglePurchaseOrderItemReceived(id, isReceived);
    setPoItems({ ...po, poItems: poItems.map((item) => {
      if (item.id === id) return { ...item, isReceived };
      return item;
    })});
  };


  return (
    <div className={`purchase-order-items-table ${className && className}`}>
      {poItems &&
        <>
          <h3>PO Items</h3>
          <Table>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {poItems.map((item: POItem, i: number) => {
                return (
                  <tr key={i}>
                    <td>{ item.qty }</td>
                    <td>{ item.desc }</td>
                    <td>{ formatCurrency(item.unitPrice) }</td>
                    <td>{ formatCurrency(item.totalPrice) }</td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.isReceived}
                        onChange={(e: any) => handleToggleIsItemReceived(item.id, e.target.checked)}
                        disabled
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <br />

          <h3>PO Items Received</h3>
          <Table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Stock Number</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {poReceivedItems.map((item: POReceivedItem, i: number) => {
                return (
                  <tr key={i}>
                    <td>{ item.partNum }</td>
                    <td>{ item.stockNum }</td>
                    <td>{ item.desc }</td>
                    <td>{ item.qty }</td>
                    <td>{ formatCurrency(item.cost) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }
    </div>
  );
}
