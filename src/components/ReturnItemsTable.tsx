import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  className?: string
  returnItems: ReturnItem[]
}


export default function ReturnItemsTable({ className, returnItems }: Props) {
  const getTotalPrice = (): number => {
    return returnItems.reduce((acc, item) => item.cost !== 0.04 && item.cost !== 0.01 && acc + (item.unitPrice * item.qty), 0);
  };
  const colorStyle = getTotalPrice() < 0 ? { color: 'var(--red-2)' } : '';


  return (
    <div className={`return-items-table ${className && className}`}>
      {returnItems &&
        <>
          <p><strong>Return Total: </strong><span style={{ ...colorStyle }}>{ formatCurrency(getTotalPrice()) }</span></p>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Cost</th>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Desc</th>
                <th>Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((ret: ReturnItem) => {
                return (
                  <tr key={ret.id}>
                    <td>{ ret.stockNum }</td>
                    <td>{ formatCurrency(ret.cost) }</td>
                    <td>{ ret.qty }</td>
                    <td>{ ret.partNum }</td>
                    <td>{ ret.desc }</td>
                    <td>{ formatCurrency(ret.unitPrice) }</td>
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
