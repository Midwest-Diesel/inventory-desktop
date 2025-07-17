import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Table from "../Library/Table";
import Checkbox from "../Library/Checkbox";

interface Props {
  className?: string
  warrantyItems: WarrantyItem[]
}


export default function WarrantyItemsTableDetails({ className, warrantyItems }: Props) {
  const getTotalCost = (): number => {
    return warrantyItems.reduce((acc, item) => acc + ((item?.cost ?? 0) * (item?.qty ?? 0)), 0);
  };
  const getTotalPrice = (): number => {
    return warrantyItems.reduce((acc, item) => acc + ((item?.price ?? 0) * (item?.qty ?? 0)), 0);
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
                <th>Returned to Vendor</th>
                <th>Claim Reason</th>
                <th>Vendor Report</th>
                <th>Vendor Credit</th>
                <th>Part Replaced by Vendor</th>
                <th>Customer Credited</th>
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
                    <td>{ formatDate(item.returnedVendorDate) }</td>
                    <td>{ item.claimReason }</td>
                    <td>{ item.vendorReport }</td>
                    <td>{ formatCurrency(item.vendorCredit) }</td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.hasVendorReplacedPart}
                        disabled
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.isCustomerCredited}
                        disabled
                      />
                    </td>
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
