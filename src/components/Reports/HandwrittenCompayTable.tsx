import Button from "../Library/Button";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: HandwrittensCompanyReport[]
  setReportsOpen: (open: boolean) => void
}


export default function HandwrittenCompanyTable({ setTableOpen, data, setReportsOpen }: Props) {
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
            <th>Year</th>
            <th>BillToCompany</th>
            <th>HandwrittenCount</th>
            <th>CustomerType</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.year }</td>
                <td>{ row.billToCompany }</td>
                <td>{ row.handwrittenCount }</td>
                <td>{ row.customerType }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
