import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";
import Link from "next/link";

interface Props {
  className?: string
  returnItems: ReturnItem[]
}


export default function ReturnItemsTable({ className, returnItems }: Props) {
  const getTotalPrice = (): number => {
    return returnItems.reduce((acc, item) => item.cost !== 0.04 && item.cost !== 0.01 && acc + (item.unitPrice * item.qty), 0);
  };


  return (
    <div className={`return-items-table ${className && className}`}>
      {returnItems &&
        <>
          <p><strong>Return Total: </strong>{ formatCurrency(getTotalPrice()) }</p>
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
                    <td>
                      {ret.part && ret.part.id ?
                        <Link href={`/part/${ret.part.id}`}>{ ret.partNum }</Link>
                        :
                        <>{ ret.partNum }</>
                      }
                    </td>
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
