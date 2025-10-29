import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";
import { useMemo } from "react";

interface Props {
  closeTable: () => void
  data: OutstandingCoresReport[]
}


export default function OutstandingCoresTable({ closeTable, data }: Props) {
  const total = useMemo(() => data.reduce((prev, row) => prev + row.charge, 0), [data]);
  
  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = data.map((row) =>
      [row.initials, formatDate(row.date), row.qty, row.partNum, row.desc, row.billToCompany, formatCurrency(row.charge)].join('\t')
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
        <h3>Total: { formatCurrency(total) }</h3>
      </div>
      
      <Table>
        <thead>
          <tr>
            <th>Initials</th>
            <th>Date</th>
            <th>Qty</th>
            <th>PartNum</th>
            <th>Desc</th>
            <th>BillToCompany</th>
            <th>Charge</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.initials }</td>
                <td>{ formatDate(row.date) }</td>
                <td>{ row.qty }</td>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ row.billToCompany }</td>
                <td>{ formatCurrency(row.charge) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
