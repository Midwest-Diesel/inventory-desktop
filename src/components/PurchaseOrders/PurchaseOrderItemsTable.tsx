import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "../library/Table";
import Checkbox from "../library/Checkbox";

interface Props {
  className?: string
  poItems: POItem[]
  poReceivedItems: POReceivedItem[]
  handleToggleIsItemReceived: (id: number, isReceived: boolean) => Promise<void>
}


export default function PurchaseOrderItemsTable({ className, poItems, poReceivedItems, handleToggleIsItemReceived }: Props) {
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
