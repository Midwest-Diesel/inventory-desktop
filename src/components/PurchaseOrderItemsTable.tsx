import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";
import Checkbox from "./Library/Checkbox";

interface Props {
  className?: string
  poItems: POItem[]
  poReceivedItems: POReceivedItem[]
}


export default function PurchaseOrderItemsTable({ className, poItems, poReceivedItems }: Props) {
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
                <th>Qty</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {poReceivedItems.map((item: POReceivedItem, i: number) => {
                return (
                  <tr key={i}>
                    <td>{ item.partNum }</td>
                    <td>{ item.desc }</td>
                    <td>{ item.stockNum }</td>
                    <td>{ item.cost }</td>
                    <td>{ item.qty }</td>
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
