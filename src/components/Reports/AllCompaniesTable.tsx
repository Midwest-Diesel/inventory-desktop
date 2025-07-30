import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";

interface Props {
  closeTable: () => void
  data: AllCompaniesReport[]
}


export default function AllCompaniesTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            <th>BillToCompany</th>
            <th>BillToAddress</th>
            <th>BillToCity</th>
            <th>BillToState</th>
            <th>BillToZip</th>
            <th>Country</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.billToCompany }</td>
                <td>{ row.billToAddress }</td>
                <td>{ row.billToCity }</td>
                <td>{ row.billToState }</td>
                <td>{ row.billToZip }</td>
                <td>{ row.country }</td>
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
