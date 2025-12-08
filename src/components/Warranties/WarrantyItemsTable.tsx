import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "../library/Table";

interface Props {
  className?: string
  warrantyItems: WarrantyItem[]
}


export default function WarrantyItemsTable({ className, warrantyItems }: Props) {
  const getTotalCost = (): number => {
    return (warrantyItems as any).reduce((acc: number, item: WarrantyItem) => item.cost !== 0.04 && item.cost !== 0.01 && acc + ((item?.cost ?? 0) * (item?.qty ?? 0)), 0);
  };
  const getTotalPrice = (): number => {
    return warrantyItems.reduce((acc: number, item: WarrantyItem) => acc + ((item?.price ?? 0) * (item?.qty ?? 0)), 0);
  };
  const costColorStyle = getTotalCost() < 0 ? { color: 'var(--red-2)' } : '';
  const priceColorStyle = getTotalPrice() < 0 ? { color: 'var(--red-2)' } : '';


  return (
    <div className={`warranty-items-table ${className && className}`}>
      {warrantyItems &&
        <>
          <p><strong>Cost Total: </strong><span style={{ ...costColorStyle }}>{ formatCurrency(getTotalCost()) }</span></p>
          <p><strong>Price Total: </strong><span style={{ ...priceColorStyle }}>{ formatCurrency(getTotalPrice()) }</span></p>
          <Table>
            <thead>
              <tr>
                <th>Stock Num</th>
                <th>Qty</th>
                <th>Part Num</th>
                <th>Desc</th>
                <th>Cost</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {warrantyItems.map((item: WarrantyItem) => {
                return (
                  <tr key={item.id}>
                    <td>{ item.stockNum }</td>
                    <td>{ item.qty }</td>
                    <td>{ item.partNum }</td>
                    <td>{ item.desc }</td>
                    <td>{ formatCurrency(item.cost) }</td>
                    <td>{ formatCurrency(item.price) }</td>
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
