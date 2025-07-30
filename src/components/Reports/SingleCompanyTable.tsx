import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";
import { useEffect, useState } from "react";
import Link from "../Library/Link";

interface Props {
  closeTable: () => void
  data: SingleCompany[]
  setReportsOpen: (open: boolean) => void
}


export default function SingleCompanyTable({ closeTable, data, setReportsOpen }: Props) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(data.reduce((acc, cur) => acc + cur.total, 0));
  }, [data]);

  const handleGoBack = () => {
    closeTable();
    setReportsOpen(true);
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-row">
        <Button onClick={handleGoBack}>Back</Button>
        <h3>Total: { formatCurrency(total) }</h3>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Handwritten</th>
            <th>Date</th>
            <th>BillToAddress</th>
            <th>BillToCity</th>
            <th>BillToCompany</th>
            <th>BillToState</th>
            <th>BillToZip</th>
            <th>Desc</th>
            <th>PartNum</th>
            <th>Qty</th>
            <th>UnitPrice</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.id ? <Link href={`/handwrittens/${row.id}`}>{ row.id }</Link> : row.id }</td>
                <td>{ formatDate(row.date) }</td>
                <td>{ row.billToAddress }</td>
                <td>{ row.billToCity }</td>
                <td>{ row.billToCompany }</td>
                <td>{ row.billToState }</td>
                <td>{ row.billToZip }</td>
                <td>{ row.desc }</td>
                <td>{ row.partNum }</td>
                <td>{ row.qty }</td>
                <td>{ formatCurrency(row.unitPrice) }</td>
                <td>{ formatCurrency(row.total) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
