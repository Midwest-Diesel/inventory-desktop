import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: AllSalesmenReport[]
  setReportsOpen: (open: boolean) => void
}


export default function AllSalesmenTable({ setTableOpen, data, setReportsOpen }: Props) {
  const handleGoBack = () => {
    setTableOpen(false);
    setReportsOpen(true);
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
                <td>{ formatCurrency(row.salesCost) }</td>
                <td>{ formatCurrency(row.netSales) }</td>
                <td>{ row.salesman }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}