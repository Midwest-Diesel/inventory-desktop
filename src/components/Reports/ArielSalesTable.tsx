import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";
import { useEffect, useState } from "react";

interface Props {
  closeTable: () => void
  data: ArielSalesReport[]
}


export default function ArielSalesTable({ closeTable, data }: Props) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(data.reduce((acc, cur) => acc + cur.total, 0));
  }, [data]);

  const handleGoBack = () => {
    closeTable();
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
            <th>Date</th>
            <th>BillToCompany</th>
            <th>Salesman</th>
            <th>Source</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.date) }</td>
                <td>{ row.billToCompany }</td>
                <td>{ row.initials }</td>
                <td>{ row.source }</td>
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
