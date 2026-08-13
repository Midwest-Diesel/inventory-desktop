import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";

interface Props {
  closeTable: () => void
  data: AllSalesmenReport[]
}


export default function AllSalesmenTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            <th>TotalSales</th>
            <th>SalesCost</th>
            <th>NetSales</th>
            <th>Salesperson</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatCurrency(row.totalSales) }</td>
                <td>{ formatCurrency(row.totalCost) }</td>
                <td>{ formatCurrency(row.netSales) }</td>
                <td>{ row.salesman }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
