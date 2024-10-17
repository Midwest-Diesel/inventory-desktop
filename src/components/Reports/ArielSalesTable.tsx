import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: ArielSalesReport[]
  setReportsOpen: (open: boolean) => void
}


export default function ArielSalesTable({ setTableOpen, data, setReportsOpen }: Props) {
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
    </div>
  );
}
