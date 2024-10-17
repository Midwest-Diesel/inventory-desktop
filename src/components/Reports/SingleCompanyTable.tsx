import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: SingleCompany[]
  setReportsOpen: (open: boolean) => void
}


export default function SingleCompanyTable({ setTableOpen, data, setReportsOpen }: Props) {
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
                <td>{ row.id }</td>
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
    </div>
  );
}
