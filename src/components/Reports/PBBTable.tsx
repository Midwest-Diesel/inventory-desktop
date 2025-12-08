import Button from "../library/Button";
import Loading from "../library/Loading";
import Table from "../library/Table";

interface Props {
  closeTable: () => void
  data: PBBReport[]
}


export default function PBBTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
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
