import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  closeTable: () => void
  data: HandwrittensCompanyReport[]
}


export default function HandwrittenCompanyTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
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
      { data.length == 0 && <Loading /> }
    </div>
  );
}
