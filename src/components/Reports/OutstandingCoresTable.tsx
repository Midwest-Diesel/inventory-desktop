import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  closeTable: () => void
  data: OutstandingCoresReport[]
  setReportsOpen: (open: boolean) => void
}


export default function OutstandingCoresTable({ closeTable, data, setReportsOpen }: Props) {
  const handleGoBack = () => {
    closeTable();
    setReportsOpen(true);
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
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
