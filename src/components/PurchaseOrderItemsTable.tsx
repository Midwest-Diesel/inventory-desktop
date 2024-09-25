import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  className?: string
  poItems: POItem[]
}


export default function PurchaseOrderItemsTable({ className, poItems }: Props) {
  return (
    <div className={`purchase-order-items-table ${className && className}`}>
      {poItems &&
        <>
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
              {poItems.map((item: POItem, i: number) => {
                return (
                  <tr key={i}>
                    <td>{ item.qty }</td>
                    <td>{ item.desc }</td>
                    <td>{ formatCurrency(item.unitPrice) }</td>
                    <td>{ formatCurrency(item.totalPrice) }</td>
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
