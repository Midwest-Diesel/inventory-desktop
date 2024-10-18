import { formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: EmailReport[]
  setReportsOpen: (open: boolean) => void
}


export default function EmailsTable({ setTableOpen, data, setReportsOpen }: Props) {
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
            <th>Email</th>
            <th>Phone</th>
            <th>BillToState</th>
            <th>AccountingStatus</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.date) }</td>
                <td>{ row.billToCompany }</td>
                <td>{ row.email }</td>
                <td>{ row.phone }</td>
                <td>{ row.billToState }</td>
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
