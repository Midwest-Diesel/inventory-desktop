import { formatDate } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";
import Link from "../library/Link";

interface Props {
  closeTable: () => void
  data: Handwritten[]
}


export default function PendingHandwrittensTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = data.map((row) =>
      [
        row.id,
        row.date,
        row.billToCompany,
        row.shipToCompany,
        row.source,
        row.payment,
        row.invoiceStatus,
        row.accountingStatus
      ].join('\t')
    ).join('\n');
    navigator.clipboard.writeText(rowsText);
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-row">
        <div className="reports-table__top-bar">
          <Button onClick={handleGoBack}>Back</Button>
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Bill To Company</th>
            <th>Ship To Company</th>
            <th>Source</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Acounting Status</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>
                  <Link href={`/handwrittens/${row.id}`}>{ row.id }</Link>
                </td>
                <td>{ formatDate(row.date) }</td>
                <td>{ row.billToCompany }</td>
                <td>{ row.shipToCompany }</td>
                <td>{ row.source }</td>
                <td>{ row.payment }</td>
                <td>{ row.invoiceStatus }</td>
                <td>{ row.accountingStatus }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
