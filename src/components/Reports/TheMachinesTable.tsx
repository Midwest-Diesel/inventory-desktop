import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  closeTable: () => void
  data: TheMachinesReport[]
}


export default function TheMachinesTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = data.map((row) =>
      [row.partNum, row.desc, row.total].join('\t')
    ).join('\n');
    navigator.clipboard.writeText(rowsText);
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-bar">
        <Button onClick={handleGoBack}>Back</Button>
        <Button onClick={copyToClipboard}>Copy</Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>PartNum</th>
            <th>Desc</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ row.total }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
