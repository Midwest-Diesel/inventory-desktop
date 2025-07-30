import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";
import { useEffect, useState } from "react";

interface Props {
  closeTable: () => void
  data: AllPartsReport[]
}


export default function AllPartsTable({ closeTable, data }: Props) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(data.reduce((acc, cur) => acc + cur.sales, 0));
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
            <th>AltParts</th>
            <th>FirstOfDescription</th>
            <th>SumOfQtySold</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.altParts }</td>
                <td>{ row.firstOfDesc }</td>
                <td>{ formatCurrency(row.sumOfQtySold) }</td>
                <td>{ formatCurrency(row.sales) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
