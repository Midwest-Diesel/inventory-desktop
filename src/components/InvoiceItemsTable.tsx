import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  className?: string
  invoiceItems: InvoiceItem[]
}


export default function InvoiceItemsTable({ className, invoiceItems }: Props) {
  const getTotalPrice = (): number => {
    return invoiceItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  };
  const colorStyle = getTotalPrice() < 0 ? { color: 'var(--red-2)' } : '';


  return (
    <div className={`invoice-items-table ${className && className}`}>
      {invoiceItems &&
        <>
          <p><strong>Invoice Total: </strong><span style={{ ...colorStyle }}>{ formatCurrency(getTotalPrice()) }</span></p>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Location</th>
                <th>Cost</th>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Desc</th>
                <th>Unit Price</th>
                <th>Return</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item: InvoiceItem, i: number) => {
                return (
                  <tr key={i}>
                    <td>{ item.stockNum }</td>
                    <td>{ item.location }</td>
                    <td>{ formatCurrency(item.cost) }</td>
                    <td>{ item.qty }</td>
                    <td>{ item.partNum }</td>
                    <td>{ item.desc }</td>
                    <td>{ formatCurrency(item.unitPrice) }</td>
                    <td>{ item.return }</td>
                    <td>{ formatDate(item.entryDate) }</td>
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
