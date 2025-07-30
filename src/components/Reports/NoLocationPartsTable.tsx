import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  closeTable: () => void
  data: NoLocationPartsReport[]
  setReportsOpen: (open: boolean) => void
}


export default function NoLocationPartsTable({ closeTable, data, setReportsOpen }: Props) {
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
            <th>Qty</th>
            <th>PartNum</th>
            <th>Desc</th>
            <th>Location</th>
            <th>StockNum</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.qty }</td>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ row.location }</td>
                <td>{ row.stockNum }</td>
                <td>{ row.remarks }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
